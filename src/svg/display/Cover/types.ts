import type { ReactNode } from "react"
import type { T_Direction4 } from "@svg/types"

export type { T_Direction4 } from "@svg/types"

/** 默认滑入/滑出时长（秒） */
export const DEFAULT_COVER_DURATION = 0.5
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 0.5
/** 默认方向 */
export const DEFAULT_DIRECTION: T_Direction4 = "B"
/** 默认缓动曲线 (ease-in-out) */
export const DEFAULT_KEY_SPLINES = "0.42 0 0.58 1"

/**
 * CoverIn / CoverOut 单项配置
 */
export interface I_CoverChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
  /** 滑入/滑出时长（秒），默认 0.5 */
  coverDuration?: number
  /** 停留时长（秒），默认 0.5 */
  stayDuration?: number
  /** 滑入/滑出方向，默认 "B" */
  direction?: T_Direction4
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/**
 * 标准化后的配置（所有可选字段已填充）
 */
export interface I_NormalizedCoverItem {
  url?: string
  jsx?: ReactNode
  coverDuration: number
  stayDuration: number
  direction: T_Direction4
  keySplines: string
  useJsx: boolean
}
