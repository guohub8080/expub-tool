import type { ReactNode } from "react"

/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 1
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1

/**
 * 用户传入的单项配置
 */
export interface I_StackCarouselItem {
  /** 图片地址（与 item 二选一） */
  url?: string
  /** 自定义 SVG 内容（与 url 二选一，优先级高于 url） */
  item?: ReactNode
  /** 点击跳转链接（可选） */
  link?: string
  /** 切换时长（秒），默认 1 */
  switchDuration?: number
  /** 停留时长（秒），默认 1 */
  stayDuration?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/**
 * 标准化后的配置 — 所有可选字段已填充默认值
 */
export interface I_NormalizedStackItem {
  url?: string
  item?: ReactNode
  link?: string
  useItem: boolean
  switchDuration: number
  stayDuration: number
  keySplines: string
}
