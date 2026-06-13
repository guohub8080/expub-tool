import type { ReactNode } from "react"
import type { T_Origin } from "@svg/types"
import type { I_TimelineKeyframe } from "@smil/timeline/types"

export type { T_Origin } from "@svg/types"

// ── 默认值常量 ──

/** 默认轨道角度（度），0 = 水平（从左到右） */
export const DEFAULT_ANGLE = 0
/** 默认 slot 间距 */
export const DEFAULT_ITEM_GAP = 0
/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 0.5
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1.0
/** 默认缓动曲线 (ease-in-out) */
export const DEFAULT_KEY_SPLINES = "0.42 0 0.58 1"

/** 默认 identity 值 */
export const IDENTITY_SCALE = 1
export const IDENTITY_OPACITY = 1
export const IDENTITY_ROTATION = 0
export const IDENTITY_SKEW = 0

// ── 动画通道配置 ──

/**
 * 普通动画通道（opacity 专用）
 *
 * 在 stack/slot 模型下，值按 4 个 slot 位置插值：
 * - backValue: 位于 back slot 时的值
 * - midValue:  位于 mid slot 时的值
 * - centerValue: 位于 center slot 时的值
 * - exitValue: 位于 exit slot 时的值（退场前最后一刻）
 *
 * 若只传 sideValue / centerValue，则 back/mid 用 sideValue，exit 自动沿用 centerValue（或 sideValue）。
 */
export interface I_CarouselAnimChannel {
  /** 侧边（back / mid）状态值，默认 identity */
  sideValue?: number
  /** 中心状态值，默认 identity */
  centerValue?: number
  /** 退场状态值；不传则默认 = centerValue */
  exitValue?: number
  /**
   * stay 阶段行为（仅 center slot 生效）：
   * - 不传：保持 centerValue
   * - 数字：保持在该值
   * - { timeline }：自定义动画
   */
  stay?: number | { timeline: I_TimelineKeyframe<number>[] }
}

/** 带原点的动画通道 */
export interface I_CarouselOriginChannel extends I_CarouselAnimChannel {
  /** 变换原点，默认 'Center' */
  origin?: T_Origin
}

// ── translate 配置 ──

/**
 * translate 通道配置
 *
 * 主轨道位置由组件根据 angle + itemGap 自动计算。
 * 这里只配置叠加在主轨道之上的独立动画：
 * - stay: 在 center slot 停留期间的位移（如浮动效果）
 */
export interface I_CarouselTranslateChannel {
  /** stay 阶段位移 */
  stay?: { x: number; y: number } | { timeline: I_TimelineKeyframe<{ x: number; y: number }>[] }
}

// ── 单项配置 ──

export interface I_AnyCarouselChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
  /** 切换时长（秒），默认 0.5 */
  switchDuration?: number
  /** 停留时长（秒），默认 1.0 */
  stayDuration?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string

  /** 位移通道：仅用于叠加在主轨道之上的 stay 阶段自定义位移 */
  translate?: I_CarouselTranslateChannel
  /** 缩放通道 */
  scale?: I_CarouselOriginChannel
  /** 透明度通道 */
  opacity?: I_CarouselAnimChannel
  /** 旋转通道 */
  rotation?: I_CarouselOriginChannel
  /** skewX 通道 */
  skewX?: I_CarouselOriginChannel
  /** skewY 通道 */
  skewY?: I_CarouselOriginChannel
}

// ── 标准化后的类型 ──

export interface I_NormalizedAnimChannel {
  sideValue: number
  centerValue: number
  exitValue: number
  stay: 'hold' | { value: number } | { timeline: I_TimelineKeyframe<number>[] }
}

export interface I_NormalizedOriginChannel extends I_NormalizedAnimChannel {
  origin: T_Origin
}

export interface I_NormalizedTranslateChannel {
  stay: 'hold' | { value: { x: number; y: number } } | { timeline: I_TimelineKeyframe<{ x: number; y: number }>[] }
}

export interface I_NormalizedCarouselItem {
  url?: string
  jsx?: ReactNode
  useJsx: boolean
  switchDuration: number
  stayDuration: number
  keySplines: string
  translate: I_NormalizedTranslateChannel
  scale?: I_NormalizedOriginChannel
  opacity?: I_NormalizedAnimChannel
  rotation?: I_NormalizedOriginChannel
  skewX?: I_NormalizedOriginChannel
  skewY?: I_NormalizedOriginChannel
}

// ── slot 位置类型 ──

/** slot 在 stack 中的 4 个位置 */
export type T_SlotPosition = 0 | 1 | 2 | 3

export const SLOT_POSITION = {
  Back: 0,
  Mid: 1,
  Center: 2,
  Exit: 3,
} as const
