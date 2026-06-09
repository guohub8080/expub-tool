import type { ReactNode } from "react"

export interface I_SkewSlideCarouselChildItem {
  url?: string
  jsx?: ReactNode
  switchDuration?: number
  stayDuration?: number
}

/** 默认缓动曲线 */
export const EASE = "0.42 0 0.58 1"
/** 默认斜切角度 */
export const DEFAULT_SKEW_ANGLE = 15
/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 2
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 2
