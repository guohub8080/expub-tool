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

// ── 默认 identity 值 ──

export const IDENTITY_SCALE = 1
export const IDENTITY_OPACITY = 1
export const IDENTITY_ROTATION = 0
export const IDENTITY_SKEW = 0

// ── 动画通道配置 ──

/**
 * 普通动画通道（opacity 专用）
 *
 * - sideValue：item 不在中心时的值
 * - centerValue：item 在中心时的值
 * - stay：在中心停留期间的行为
 */
export interface I_CarouselAnimChannel {
  /** 侧边状态值，默认 1 */
  sideValue?: number
  /** 中心状态值，默认 1 */
  centerValue?: number
  /**
   * stay 阶段行为：
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
 * 简单模式：自动根据 angle 计算 entry/exit 偏移
 * 高级模式：自定义 initValue + timeline
 * stay：中心停留期间的位移（如浮动效果）
 */
export interface I_CarouselTranslateChannel {
  /** off-screen 距离倍数，默认 1 */
  distance?: number
  /** entry/exit 缓动曲线 */
  keySplines?: string
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

  /** 位移通道：自动沿主轴移动 */
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
  stay: 'hold' | { value: number } | { timeline: I_TimelineKeyframe<number>[] }
}

export interface I_NormalizedOriginChannel extends I_NormalizedAnimChannel {
  origin: T_Origin
}

export interface I_NormalizedTranslateChannel {
  distance: number
  keySplines: string
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
