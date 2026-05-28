/**
 * compileTimeline 类型定义
 */

export interface I_TimelineKeyframe<T> {
  durationSeconds: number
  to: T
  keySpline?: string
}

export interface I_TimelineResult {
  values: string
  keyTimes: string
  keySplines: string
  totalDuration: number
}

export type T_ValueSerializer<T> = (value: T) => string
