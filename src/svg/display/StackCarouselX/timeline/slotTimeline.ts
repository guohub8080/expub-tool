import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import max from "lodash/max"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type { I_SkewConfig, I_RotationConfig } from "@svg/types"
import type { I_NormalizedStackItem, I_NormalizedExitConfig } from "../types"

/**
 * 位置定义：0=back, 1=mid, 2=center, 3=exit
 *
 * 每个 slot 在动画周期中按 back→mid→center→exit 顺序推进
 */
export type T_SlotPosition = 0 | 1 | 2 | 3

/**
 * 各位置对应的 translate / scale 值配置
 */
export interface I_PositionConfig {
  /** 各位置的 translate 值，索引 = T_SlotPosition */
  translateValues: Partial<I_TranslateValue>[]
  /** 各位置的 scale 值，索引 = T_SlotPosition（exit 位由 exitConfig.scale 覆盖） */
  scaleValues: number[]
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
 * 公式：enterBoundary(slotIndex, position) = (position === startPos) ? 0 : 2 × (itemCount + position - slotIndex)
 * position(slotIndex, boundary) = max { position ≥ startPos | boundary ≥ enterBoundary(slotIndex, position) }
 */
function getPosition({ slotIndex, itemCount, boundary }: {
  slotIndex: number
  itemCount: number
  boundary: number
}): number {
  const startPos = max([0, slotIndex - itemCount])
  for (let pos = 3; pos >= startPos; pos--) {
    const enterPos = (pos === startPos) ? 0 : 2 * (itemCount + pos - slotIndex)
    if (boundary >= enterPos) return pos
  }
  return startPos
}

/**
 * 构建单个 slot 的 translate + scale + skew + rotate 时间线
 *
 * 退场行为由 slot 自身对应的 item 决定（不随段变化），避免已退场的卡牌飘移。
 */
export function buildSlotTimelines({
  slotIndex,
  itemCount,
  items,
  posConfig,
  exitConfig,
}: {
  /** slot 索引（0 ~ itemCount+2） */
  slotIndex: number
  /** 唯一图片数量 */
  itemCount: number
  /** 标准化后的配置数组 */
  items: I_NormalizedStackItem[]
  /** 位置值配置（exit 位的 translate/scale 会被 exitConfig 覆盖） */
  posConfig: I_PositionConfig
  /** 本 slot 的退场配置 */
  exitConfig: I_SlotExitConfig
}) {
  const startPos = max([0, slotIndex - itemCount])
  const totalSegs = itemCount * 2

  const initTranslate = posConfig.translateValues[startPos]
  const initScale = posConfig.scaleValues[startPos]

  const hasSkew = !isNil(exitConfig.skew)
  const hasRotation = !isNil(exitConfig.rotation)
  const skewSplines = exitConfig.skew?.keySplines

  const translateTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  const scaleTimeline: I_TimelineKeyframe<number>[] = []
  const skewTimeline: I_TimelineKeyframe<number>[] = []
  const rotateTimeline: I_TimelineKeyframe<number>[] = []

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = Math.floor(seg / 2)
    const item = items[itemIdx % itemCount]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const splines = item.keySplines

    const nextPos = getPosition({ slotIndex, itemCount, boundary: seg + 1 })
    const isExit = nextPos === 3

    translateTimeline.push({
      toAbs: isExit ? exitConfig.translate : posConfig.translateValues[nextPos],
      durationSeconds: dur,
      keySplines: splines,
    })

    scaleTimeline.push({
      toAbs: isExit ? exitConfig.scale : posConfig.scaleValues[nextPos],
      durationSeconds: dur,
      keySplines: splines,
    })

    if (hasSkew) {
      skewTimeline.push({
        toAbs: isExit ? exitConfig.skew!.angle : 0,
        durationSeconds: dur,
        keySplines: defaultTo(skewSplines, splines),
      })
    }

    if (hasRotation) {
      rotateTimeline.push({
        toAbs: isExit ? (defaultTo(exitConfig.rotation!.angle, 0)) : 0,
        durationSeconds: dur,
        keySplines: defaultTo(exitConfig.rotation!.keySplines, splines),
      })
    }
  }

  return {
    initTranslate,
    initScale,
    translateTimeline,
    scaleTimeline,
    skewTimeline: hasSkew ? skewTimeline : undefined,
    skewType: exitConfig.skew?.type,
    rotateTimeline: hasRotation ? rotateTimeline : undefined,
  }
}
