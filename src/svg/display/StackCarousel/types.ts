import type { ReactNode } from "react"
import type { T_Direction8, T_Pivot, I_SkewConfig, I_RotationConfig } from "@svg/types"

/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 1
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1

/** 可见叠层数下限（闭区间） */
export const MIN_STACK_NUM = 2
/** 可见叠层数上限（闭区间） */
export const MAX_STACK_NUM = 8
/** 默认可见叠层数（与历史实现一致：back / mid / center） */
export const DEFAULT_STACK_NUM = 3

/** 退场配置 */
export interface I_ExitConfig {
  /** 退场方向，X 默认 "L"，Y 默认 "R" */
  direction?: T_Direction8
  /** 退场移动距离，默认 viewBoxW/viewBoxH（有 skew/rotation 时可能需要加大） */
  distance?: number
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
  direction: T_Direction8
  distance?: number
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
