import type { ReactNode } from "react"
import type { T_DirectionX } from "../../types"

export type { T_DirectionX } from "../../types"

export interface I_SkewSlideItem {
  url?: string
  item?: ReactNode
  /** 进入方向，不传则继承全局 isReversed。L = 正角度，R = 负角度 */
  skewIn?: T_DirectionX
  /** 退出方向，不传则继承全局 isReversed。L = 正角度，R = 负角度 */
  skewOut?: T_DirectionX
  /** 停留时长（秒），默认 2 */
  stayDuration?: number
  /** 切换动画时长（秒），默认 2 */
  switchDuration?: number
}

/** 默认缓动曲线 */
export const EASE = "0.42 0 0.58 1"
/** 默认斜切角度 */
export const DEFAULT_SKEW_ANGLE = 15
/** 默认单步时长（秒） */
export const DEFAULT_STEP = 4
