import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type { I_NormalizedStackItem } from "../types"

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
  /** 各位置的 scale 值，索引 = T_SlotPosition */
  scaleValues: number[]
}

/**
 * 计算 slot `si` 在段边界 `boundary` 处的位置
 *
 * 公式：enterBoundary(si, p) = (p === startPos) ? 0 : 2 × (N + p - si)
 * position(si, b) = max { p ≥ startPos | b ≥ enterBoundary(si, p) }
 */
function getPosition(si: number, N: number, boundary: number): number {
  const startPos = Math.max(0, si - N)
  for (let p = 3; p >= startPos; p--) {
    const enterP = (p === startPos) ? 0 : 2 * (N + p - si)
    if (boundary >= enterP) return p
  }
  return startPos
}

/**
 * 构建单个 slot 的 translate + scale 时间线
 *
 * 退场 translate 由 slot 自身对应的 item 决定（不随段变化），避免已退场的卡牌飘移。
 *
 * @param si               slot 索引（0 ~ N+2）
 * @param N                唯一图片数量
 * @param items            标准化后的配置数组
 * @param posConfig        位置值配置（exit 位的 translate 会被 exitTranslate 覆盖）
 * @param exitTranslate    本 slot 的退场 translate（由 slot 对应的 item.exitDirection 计算）
 */
export function buildSlotTimelines(
  si: number,
  N: number,
  items: I_NormalizedStackItem[],
  posConfig: I_PositionConfig,
  exitTranslate: Partial<I_TranslateValue>,
) {
  const startPos = Math.max(0, si - N)
  const totalSegs = N * 2

  const initTranslate = posConfig.translateValues[startPos]
  const initScale = posConfig.scaleValues[startPos]

  const translateTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  const scaleTimeline: I_TimelineKeyframe<number>[] = []

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = Math.floor(seg / 2)
    const item = items[itemIdx % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const splines = item.keySplines

    const nextPos = getPosition(si, N, seg + 1)

    translateTimeline.push({
      to: nextPos === 3 ? exitTranslate : posConfig.translateValues[nextPos],
      durationSeconds: dur,
      keySplines: splines,
    })
    scaleTimeline.push({
      to: posConfig.scaleValues[nextPos],
      durationSeconds: dur,
      keySplines: splines,
    })
  }

  return { initTranslate, initScale, translateTimeline, scaleTimeline }
}
