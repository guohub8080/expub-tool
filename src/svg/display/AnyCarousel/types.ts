import type { ReactNode } from "react"
import type { T_Pivot } from "@svg/types"

/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 0.5
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1.0
/** 默认相邻 child 间距（像素） */
export const DEFAULT_CHILD_GAP = 100
/** 默认流动方向角度（度），0 = 向右 */
export const DEFAULT_ANGLE = 0

/** 单个变换通道：简写数字 或 object（绑定支点 / 缓动） */
export type T_Channel = number | I_ChannelConfig

/** 变换通道的 object 形式 */
export interface I_ChannelConfig {
  /** 通道值（scale 比 / rotate、skew 角度） */
  value: number
  /** 变换支点（相对 childCanvas），缺省 Center */
  childCanvasPivot?: T_Pivot
  /** 过渡到该角色时该通道的缓动曲线；缺省用 easeInOutSine */
  keySplines?: string
}

/**
 * 单个角色的变换配置
 *
 * 用于 centerChildConfig / lastChildConfig / nextChildConfig / outWindowConfig。
 * scale / rotate / skewX / skewY 既可传数字（简写），也可传 object 绑定支点与缓动；
 * 缺省为恒等值（scale=1、rotate=0、skewX=0、skewY=0、opacity=1）。
 *
 * 支点 per-role：不同角色可配不同 childCanvasPivot（如 coverflow：next 绕 Right、last 绕 Left）。
 * rotate 逐关键帧 pivot 几乎免费；scale/skew 逐角色不同时走「动画 pivot」补偿。
 */
export interface I_ChildTransform {
  /** 缩放比，默认 1 */
  scale?: T_Channel;
  /** 旋转角度（度），默认 0 */
  rotate?: T_Channel;
  /** X 方向倾斜角度（度），默认 0 */
  skewX?: T_Channel;
  /** Y 方向倾斜角度（度），默认 0 */
  skewY?: T_Channel;
  /** 不透明度 0-1，默认 1（无支点，保持数字） */
  opacity?: number;
}

/** 标准化后的角色变换配置 — 通道值、支点（解析为相对内容中心 {x,y}）、缓动均已填充 */
export interface I_NormalizedChildTransform {
  scale: number;
  rotate: number;
  skewX: number;
  skewY: number;
  opacity: number;
  scalePivot: I_PivotPoint;
  rotatePivot: I_PivotPoint;
  skewXPivot: I_PivotPoint;
  skewYPivot: I_PivotPoint;
  /** scale 通道过渡到本角色时的缓动；undefined 表示用 easeInOutSine */
  scaleKeySplines?: string;
  rotateKeySplines?: string;
  skewXKeySplines?: string;
  skewYKeySplines?: string;
}

/** 解析后的支点坐标（相对内容中心） */
export interface I_PivotPoint {
  x: number;
  y: number;
}

/** slot 在某个状态下所扮演的角色 */
export type T_ChildRole = 'center' | 'last' | 'next' | 'outWindow'

/**
 * 用户传入的单项配置
 */
export interface I_AnyCarouselItemConfig {
  /** 图片地址（与 item 二选一） */
  url?: string;
  /** 自定义 SVG 内容（与 url 二选一，优先级高于 url） */
  item?: ReactNode;
  /** 切换时长（秒），默认 0.5 */
  switchDuration?: number;
  /** 中心停留时长（秒），默认 1.0 */
  stayDuration?: number;
}

/**
 * 标准化后的配置 — 所有可选字段已填充默认值
 */
export interface I_NormalizedItemConfig extends I_AnyCarouselItemConfig {
  switchDuration: number;
  stayDuration: number;
  /** 标记 item 模式 */
  useItem: boolean;
}
