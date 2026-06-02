import type { ReactNode } from "react"
import type { T_Direction4 } from "@svg/types"

/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 1
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1

/** 斜切配置 */
export interface I_SkewConfig {
  /** skewX 或 skewY，决定斜切轴方向 */
  type: 'X' | 'Y'
  /** 斜切角度（度），正负决定倾斜方向，建议 0–45 */
  angle: number
}

/** 旋转中心：九宫格预设 或 自定义坐标（card 局部坐标系，0,0 = 左上角） */
export type T_RotationOrigin =
  | 'TopLeft' | 'Top' | 'TopRight'
  | 'Left'   | 'Center' | 'Right'
  | 'BottomLeft' | 'Bottom' | 'BottomRight'
  | { cx: number; cy: number }

/** 旋转配置 */
export interface I_RotationConfig {
  /** 旋转中心（card 局部坐标），默认 Center */
  origin?: T_RotationOrigin
  /** 旋转角度（度），正值=顺时针，默认 0 */
  angle?: number
  /** 缓动曲线，默认跟随 item 级 keySplines */
  keySplines?: string
}

/** 退场配置 */
export interface I_ExitConfig {
  /** 退场方向，X 默认 "L"，Y 默认 "R" */
  direction?: T_Direction4
  /** 退场斜切，不传则退出无斜切 */
  skew?: I_SkewConfig
  /** 退场旋转，不传则退出无旋转 */
  rotation?: I_RotationConfig
  /** 退场缩放目标值，默认 1（不缩放） */
  scale?: number
}

/**
 * 用户传入的单项配置
 */
export interface I_StackCarouselItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 SVG 内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
  /** 点击跳转链接（可选） */
  link?: string
  /** 退场配置 */
  exit?: I_ExitConfig
  /** 切换时长（秒），默认 1 */
  switchDuration?: number
  /** 停留时长（秒），默认 1 */
  stayDuration?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/** 标准化后的退场配置 */
export interface I_NormalizedExitConfig {
  direction: T_Direction4
  skew?: I_SkewConfig
  rotation?: I_RotationConfig
  scale: number
}

/**
 * 标准化后的配置 — 所有可选字段已填充默认值
 */
export interface I_NormalizedStackItem {
  url?: string
  jsx?: ReactNode
  link?: string
  useItem: boolean
  exit: I_NormalizedExitConfig
  switchDuration: number
  stayDuration: number
  keySplines: string
}
