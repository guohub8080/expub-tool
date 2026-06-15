import isNil from "lodash/isNil"
import { isDefined } from '@utils/fn/isDefined'
import defaultTo from "lodash/defaultTo"
import max from "lodash/max"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type { I_SkewConfig, I_RotationConfig } from "@svg/types"
import type { I_NormalizedStackItem } from "../types"
import { resolveRotationPivot } from "../utils/rotationPivot"

/**
 * 位置定义：0..showStackNum-1 为可见叠层（0=最远端 tail，showStackNum-1=焦点 center），showStackNum 为 exit
 *
 * 每个 slot 在动画周期中按 tail → … → center → exit 顺序推进
 */
export type T_SlotPosition = number

/**
 * 各位置对应的 translate / scale / rotate 值配置
 */
export interface I_PositionConfig {
  /** 各位置的 translate 值，索引 = T_SlotPosition */
  translateValues: Partial<I_TranslateValue>[]
  /** 各位置的 scale 值，索引 = T_SlotPosition（exit 位由 exitConfig.scale 覆盖） */
  scaleValues: number[]
  /** 各位置的 rotate 角度（度），索引 = T_SlotPosition；全 0 时退场段旋转无变化 */
  rotateValues: number[]
  /** 各位置的 rotate pivot [x,y]（card 局部），索引 = T_SlotPosition */
  rotatePivots: [number, number][]
}

/** 本 slot 的退场行为 */
export interface I_SlotExitConfig {
  translate: Partial<I_TranslateValue>
  skew?: I_SkewConfig
  rotation?: I_RotationConfig
  scale: number
}

/**
 * 计算 slot 在段边界处的位置
 *
 * 公式：enterBoundary(slotIndex, position) = (position === startPosition) ? 0 : 2 × (itemCount + position − slotIndex)
 * position(slotIndex, boundary) = max { position ≥ startPosition | boundary ≥ enterBoundary(slotIndex, position) }
 *
 * showStackNum 为可见叠层数，exit 位 = showStackNum
 */
function getPosition({ slotIndex, itemCount, showStackNum, boundary }: {
  slotIndex: number
  itemCount: number
  /** 可见叠层数（exit 位 = showStackNum） */
  showStackNum: number
  boundary: number
}): number {
  const startPosition = max([0, slotIndex - itemCount])
  for (let position = showStackNum; position >= startPosition; position--) {
    const enterBoundary = (position === startPosition) ? 0 : 2 * (itemCount + position - slotIndex)
    if (boundary >= enterBoundary) return position
  }
  return startPosition
}

/**
 * 构建单个 slot 的 translate + scale + skew + rotate 时间线
 *
 * 退场行为由 slot 自身对应的 item 决定（不随段变化），避免已退场的卡牌飘移。
 */
export function buildSlotTimelines({
  slotIndex,
  itemCount,
  showStackNum,
  items,
  posConfig,
  exitConfig,
  cardW,
  cardH,
}: {
  /** slot 索引（0 ~ itemCount + showStackNum - 1） */
  slotIndex: number
  /** 唯一图片数量 */
  itemCount: number
  /** 可见叠层数（exit 位 = showStackNum） */
  showStackNum: number
  /** 标准化后的配置数组 */
  items: I_NormalizedStackItem[]
  /** 位置值配置（exit 位的 translate/scale 会被 exitConfig 覆盖） */
  posConfig: I_PositionConfig
  /** 本 slot 的退场配置 */
  exitConfig: I_SlotExitConfig
  /** 卡牌基准宽（解析退场 rotate pivot） */
  cardW: number
  /** 卡牌基准高（解析退场 rotate pivot） */
  cardH: number
}) {
  const startPosition = max([0, slotIndex - itemCount])
  const segmentCount = itemCount * 2

  const initTranslate = posConfig.translateValues[startPosition]
  const initScale = posConfig.scaleValues[startPosition]
  const initRotate = posConfig.rotateValues[startPosition]

  const hasSkew = isDefined(exitConfig.skew)
  const hasRotation = isDefined(exitConfig.rotation)
  const skewSplines = exitConfig.skew?.keySplines
  const rotationSplines = exitConfig.rotation?.keySplines

  const translateTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  const scaleTimeline: I_TimelineKeyframe<number>[] = []
  const skewTimeline: I_TimelineKeyframe<number>[] = []
  const rotateTimeline: I_TimelineKeyframe<number>[] = []

  // rotate 逐帧 pivot（transformRotate 的 pivots 长度 = timeline 段数 + 1，initValue 帧在前）
  const rotatePivotFrames: [number, number][] = [posConfig.rotatePivots[startPosition]]

  for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
    const itemIndex = Math.floor(segmentIndex / 2)
    const item = items[itemIndex % itemCount]
    const isSwitch = segmentIndex % 2 === 0
    const segmentDuration = isSwitch ? item.switchDuration : item.stayDuration
    const splines = item.keySplines

    const nextPosition = getPosition({ slotIndex, itemCount, showStackNum, boundary: segmentIndex + 1 })
    const isExit = nextPosition === showStackNum

    translateTimeline.push({
      toAbs: isExit ? exitConfig.translate : posConfig.translateValues[nextPosition],
      durationSeconds: segmentDuration,
      keySplines: splines,
    })

    scaleTimeline.push({
      toAbs: isExit ? exitConfig.scale : posConfig.scaleValues[nextPosition],
      durationSeconds: segmentDuration,
      keySplines: splines,
    })

    if (hasSkew) {
      skewTimeline.push({
        toAbs: isExit ? exitConfig.skew!.angle : 0,
        durationSeconds: segmentDuration,
        keySplines: defaultTo(skewSplines, splines),
      })
    }

    // rotate：层间按 posConfig.rotateValues 插值；退场时维持当前层角度（无 exit.rotation），
    // 或过渡到 exit.rotation.angle（有 exit.rotation）。rotate 与 translate/scale 同段、同步
    rotateTimeline.push({
      toAbs: isExit
        ? (hasRotation ? defaultTo(exitConfig.rotation!.angle, 0) : rotateTimeline.length > 0 ? (rotateTimeline[rotateTimeline.length - 1].toAbs as number) : initRotate)
        : posConfig.rotateValues[nextPosition],
      durationSeconds: segmentDuration,
      keySplines: isExit && hasRotation ? defaultTo(rotationSplines, splines) : splines,
    })
    rotatePivotFrames.push(
      isExit
        ? resolveRotationPivot({ pivot: defaultTo(exitConfig.rotation?.childCanvasPivot, "Center"), cardWidth: cardW, cardHeight: cardH })
        : posConfig.rotatePivots[nextPosition]
    )
  }

  return {
    initTranslate,
    initScale,
    initRotate,
    translateTimeline,
    scaleTimeline,
    skewTimeline: hasSkew ? skewTimeline : undefined,
    skewType: exitConfig.skew?.type,
    rotateTimeline,
    rotatePivotFrames,
  }
}
