import type { I_TimelineKeyframe } from "@smil/timeline/types"

export type T_SnapAlign = 'start' | 'center' | 'end'

export type T_CanvasSize = {
  w?: number
  h?: number
}

export type T_Direction4 = "L" | "R" | "T" | "B"

/** 八方向：水平/垂直 + 对角线（对角线遵循 CSS 习惯：垂直在前 TL/TR/BL/BR） */
export type T_Direction8 = "L" | "R" | "T" | "B" | "TL" | "TR" | "BL" | "BR"

/** T_Direction4 常量，避免硬编码字符串 */
export const DIRECTION_4 = {
  Left: "L",
  Right: "R",
  Top: "T",
  Bottom: "B",
} as const

/** T_Direction8 常量，避免硬编码字符串 */
export const DIRECTION_8 = {
  Left: "L",
  Right: "R",
  Top: "T",
  Bottom: "B",
  TopLeft: "TL",
  TopRight: "TR",
  BottomLeft: "BL",
  BottomRight: "BR",
} as const

export type T_DirectionX = "L" | "R"

/** 九宫格预设位置 或 自定义坐标 */
export type T_Origin =
  | 'TopLeft' | 'Top' | 'TopRight'
  | 'Left'   | 'Center' | 'Right'
  | 'BottomLeft' | 'Bottom' | 'BottomRight'
  | { x: number; y: number }

/** T_Origin 常量，避免硬编码字符串 */
export const ORIGIN = {
  TopLeft: 'TopLeft',
  Top: 'Top',
  TopRight: 'TopRight',
  Left: 'Left',
  Center: 'Center',
  Right: 'Right',
  BottomLeft: 'BottomLeft',
  Bottom: 'Bottom',
  BottomRight: 'BottomRight',
} as const

export type T_HotArea = {
  x?: number
  y?: number
  w?: number
  h?: number
}

/** 斜切配置 */
export interface I_SkewConfig {
  /** skewX 或 skewY，决定斜切轴方向 */
  type: 'X' | 'Y'
  /** 斜切角度（度），正负决定倾斜方向，建议 0–45 */
  angle: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/** 旋转配置 */
export interface I_RotationConfig {
  /** 旋转中心（相对于 childCanvas），默认 Center */
  childCanvasOrigin?: T_Origin
  /** 旋转角度（度），正值=顺时针，默认 0 */
  angle?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/**
 * 缩放配置（用于 entry/exit 动画）
 *
 * 支持两种模式：
 *
 * 1. 简单模式：只传 from，组件自动生成 from→1（entry）或 1→from（exit）的动画
 *    { from: 0.1, childCanvasOrigin: ORIGIN.TopLeft }
 *
 * 2. 高级模式：传 initValue + timeline，完全自定义动画路径
 *    { initValue: 0.1, timeline: [{ durationSeconds: 1, to: 1.5 }, { durationSeconds: 1.5, to: 1 }] }
 *    timeline 总时长必须 ≤ 对应 entry/exit 的 duration，剩余时间 hold 在最后值
 */
export interface I_EntryScaleConfig {
  /** 缩放中心（相对于 childCanvas），默认 Center */
  childCanvasOrigin?: T_Origin

  // ── 简单模式 ──
  /**
   * 缩放起始值，默认 1（不缩放）。
   * entry 时动画：from 此值 → 1
   * exit 时动画：1 → from 此值
   */
  from?: number
  /** 缓动曲线，仅简单模式生效，默认 ease-in-out */
  keySplines?: string

  // ── 高级模式 ──
  /** 自定义起始值，高级模式必填 */
  initValue?: number
  /** 自定义动画路径，每段指定 durationSeconds + to + 可选 keySplines。总时长必须 ≤ 对应 phase duration */
  timeline?: I_TimelineKeyframe<number>[]
}
