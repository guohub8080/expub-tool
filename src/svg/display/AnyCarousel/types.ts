import type { ReactNode } from "react"
import type { T_Origin } from "@svg/types"
import type { I_TimelineKeyframe } from "@smil/timeline/types"

export type { T_Origin } from "@svg/types"

// ── 默认值常量 ──

/** 默认轨道角度（度），0 = 水平向右 */
export const DEFAULT_ANGLE = 0
/** 默认 slot 间距 */
export const DEFAULT_ITEM_GAP = 0
/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 0.5
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1.0
/** 默认缓动曲线 (ease-in-out) */
export const DEFAULT_KEY_SPLINES = "0.42 0 0.58 1"

// ── 默认 identity 值（侧图和中心图一样 = 不生成动画） ──

export const IDENTITY_SCALE = 1
export const IDENTITY_OPACITY = 1
export const IDENTITY_ROTATION = 0
export const IDENTITY_SKEW = 0

// ── 动画通道配置 ──

/**
 * 普通动画通道（opacity 专用，无 origin）
 *
 * 两个状态值：
 * - sideValue：slot 在侧边时的值
 * - centerValue：slot 在中心时的值
 *
 * enter 阶段自动从 sideValue → centerValue 插值
 * exit 阶段自动从 centerValue → sideValue 插值
 * hold 阶段保持 sideValue
 *
 * stay 阶段用户自定义：
 * - 不传：保持 centerValue
 * - 数字：保持在该值
 * - { timeline }：自定义动画（如呼吸、闪烁）
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

/**
 * 带原点的动画通道（scale / rotation / skewX / skewY 专用）
 *
 * 在 I_CarouselAnimChannel 基础上增加 origin 支持，
 * 渲染时用嵌套 <g> 隔离 origin 的 translate→动画→translate-back。
 */
export interface I_CarouselOriginChannel extends I_CarouselAnimChannel {
  /** 变换原点，默认 'Center' */
  origin?: T_Origin
}

// ── 单项配置 ──

/**
 * AnyCarousel 单项配置
 *
 * 每个 childItem 描述一张图/内容及其到达中心/回到侧边时的动画效果。
 * 轨道方向由组件级 props.angle 决定，不在此配置。
 */
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

  /** 缩放通道：centerValue=1.4 + sideValue=1 → CoverFlow 效果 */
  scale?: I_CarouselOriginChannel
  /** 透明度通道：centerValue=1 + sideValue=0.3 → 侧图半透明 */
  opacity?: I_CarouselAnimChannel
  /** 旋转通道：centerValue=0 + sideValue=180 → 侧图翻转 */
  rotation?: I_CarouselOriginChannel
  /** skewX 通道 */
  skewX?: I_CarouselOriginChannel
  /** skewY 通道 */
  skewY?: I_CarouselOriginChannel
}

// ── 标准化后的类型 ──

/** 标准化后的普通通道（所有字段已填充） */
export interface I_NormalizedAnimChannel {
  sideValue: number
  centerValue: number
  stay: 'hold' | { value: number } | { timeline: I_TimelineKeyframe<number>[] }
}

/** 标准化后的带 origin 通道 */
export interface I_NormalizedOriginChannel extends I_NormalizedAnimChannel {
  origin: T_Origin
}

/** 标准化后的单项配置 */
export interface I_NormalizedCarouselItem {
  url?: string
  jsx?: ReactNode
  useJsx: boolean
  switchDuration: number
  stayDuration: number
  keySplines: string
  scale?: I_NormalizedOriginChannel
  opacity?: I_NormalizedAnimChannel
  rotation?: I_NormalizedOriginChannel
  skewX?: I_NormalizedOriginChannel
  skewY?: I_NormalizedOriginChannel
}
