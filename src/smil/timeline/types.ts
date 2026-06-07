/**
 * buildTimeline 类型定义
 */

export interface I_TimelineKeyframe<T> {
  durationSeconds: number
  toAbs: T
  keySplines?: string
}

/**
 * 支持绝对/相对的 keyframe（translate、rotate 使用）
 *
 * 每个关键帧必须指定 toAbs（绝对目标值）或 toRel（相对偏移量），至少写一个。
 */
export type I_AbsRelKeyframe<T> = {
  durationSeconds: number
  keySplines?: string
} & (
  | { toAbs: T; toRel?: never }
  | { toRel: T; toAbs?: never }
)

export interface I_TimelineResult {
  values: string
  keyTimes: string
  keySplines: string
  totalDuration: number
}

export type T_ValueSerializer<T> = (value: T) => string
