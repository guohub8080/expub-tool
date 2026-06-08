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
  x: number
  y: number
  w: number
  h: number
}

/** 斜切配置（StackCarouselX 使用） */
export interface I_SkewConfig {
  /** skewX 或 skewY，决定斜切轴方向 */
  type: 'X' | 'Y'
  /** 斜切角度（度），正负决定倾斜方向，建议 0–45 */
  angle: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/**
 * 斜切配置（AnyLoopDisplay entry/exit 使用）
 *
 * 支持两种模式：
 *
 * 1. 简单模式：只传 from，组件自动生成 from→0（entry）或 0→from（exit）的动画
 *    { from: 30 }
 *
 * 2. 高级模式：传 initValue + timeline，完全自定义动画路径
 *    { initValue: 30, timeline: [{ durationSeconds: 1, to: -10 }, { durationSeconds: 0.5, to: 0 }] }
 *    timeline 总时长必须 ≤ 对应 entry/exit 的 duration，剩余时间 hold 在最后值
 */
export interface I_EntrySkewConfig {
  // ── 简单模式 ──
  /**
   * 斜切起始角度（度），默认 0。
   * entry 时动画：from 此值 → 0
   * exit 时动画：0 → from 此值
   */
  from?: number
  /** 缓动曲线，仅简单模式生效，默认 ease-in-out */
  keySplines?: string

  // ── 高级模式 ──
  /** 自定义起始值（度），高级模式必填 */
  initValue?: number
  /** 自定义动画路径，每段指定 durationSeconds + to + 可选 keySplines。总时长必须 ≤ 对应 phase duration */
  timeline?: I_TimelineKeyframe<number>[]
}

/**
 * 旋转配置
 *
 * 支持两种模式：
 *
 * 1. 简单模式：只传 angle，组件自动生成 angle→0（entry）或 0→angle（exit）的动画
 *    { angle: 360, childCanvasOrigin: ORIGIN.Center }
 *
 * 2. 高级模式：传 initValue + timeline，完全自定义动画路径
 *    { initValue: 720, timeline: [{ durationSeconds: 1, to: 0 }, { durationSeconds: 1.5, to: -360 }] }
 *    timeline 总时长必须 ≤ 对应 entry/exit 的 duration，剩余时间 hold 在最后值
 */
export interface I_RotationConfig {
  /** 旋转中心（相对于 childCanvas），默认 Center */
  childCanvasOrigin?: T_Origin

  // ── 简单模式 ──
  /**
   * 旋转角度（度），正值=顺时针，默认 0。
   * entry 时动画：angle → 0
   * exit 时动画：0 → angle
   */
  angle?: number
  /** 缓动曲线，仅简单模式生效，默认 ease-in-out */
  keySplines?: string

  // ── 高级模式 ──
  /** 自定义起始值（度），高级模式必填 */
  initValue?: number
  /** 自定义动画路径，每段指定 durationSeconds + to + 可选 keySplines。总时长必须 ≤ 对应 phase duration */
  timeline?: I_TimelineKeyframe<number>[]
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

/**
 * 透明度配置（用于 entry/exit 动画）
 *
 * 支持两种模式：
 *
 * 1. 简单模式：只传 from，组件自动生成 from→1（entry）或 1→from（exit）的动画
 *    { from: 0 }
 *
 * 2. 高级模式：传 initValue + timeline，完全自定义动画路径
 *    { initValue: 0, timeline: [{ durationSeconds: 1, to: 0.8 }, { durationSeconds: 0.5, to: 1 }] }
 *    timeline 总时长必须 ≤ 对应 entry/exit 的 duration，剩余时间 hold 在最后值
 */
export interface I_EntryOpacityConfig {
  // ── 简单模式 ──
  /**
   * 透明度起始值（0-1），默认 1（不透明）。
   * entry 时动画：from 此值 → 1
   * exit 时动画：1 → from 此值
   */
  from?: number
  /** 缓动曲线，仅简单模式生效，默认 ease-in-out */
  keySplines?: string

  // ── 高级模式 ──
  /** 自定义起始值（0-1），高级模式必填 */
  initValue?: number
  /** 自定义动画路径，每段指定 durationSeconds + to + 可选 keySplines。总时长必须 ≤ 对应 phase duration */
  timeline?: I_TimelineKeyframe<number>[]
}

/**
 * translate entry/exit 配置
 *
 * 支持两种模式：
 *
 * 1. 简单模式：只传 direction，组件自动计算 offscreen 位置
 *    { direction: 'L' }
 *
 * 2. 高级模式：传 initValue + timeline，完全自定义位移路径
 *    { initValue: { x: -500, y: 0 }, timeline: [{ durationSeconds: 1, to: { x: 20, y: 0 } }, { durationSeconds: 0.5, to: { x: 0, y: 0 } }] }
 *    timeline 总时长必须 ≤ 对应 entry/exit 的 duration，剩余时间 hold 在最后值
 */
export interface I_EntryTranslateConfig {
  // ── 简单模式 ──
  /** 进入/退出方向，默认 T。简单模式下组件根据方向自动计算 offscreen 位置 */
  direction?: T_Direction8
  /** 自定义 offscreen 距离（像素倍数），不传则自动计算 */
  distance?: number
  /** 缓动曲线，仅简单模式生效，默认 ease-in-out */
  keySplines?: string

  // ── 高级模式 ──
  /** 自定义起始坐标，高级模式必填 */
  initValue?: { x: number; y: number }
  /** 自定义动画路径，每段指定 durationSeconds + to + 可选 keySplines。总时长必须 ≤ 对应 phase duration */
  timeline?: I_TimelineKeyframe<{ x: number; y: number }>[]
}

/**
 * stay 阶段 translate 配置
 *
 * 两种模式：
 *
 * 1. 固定位置：传 { x, y }，stay 期间保持在该位置
 *    translate: { x: 0, y: -10 }
 *
 * 2. 动画模式：传 { timeline }，stay 期间播放自定义位移动画
 *    translate: { timeline: [{ durationSeconds: 0.5, to: { x: 0, y: -8 } }, { durationSeconds: 0.5, to: { x: 0, y: 8 } }] }
 *    timeline 总时长必须 ≤ stayDuration，剩余时间 hold 在最后值
 */
export type I_StayTranslateConfig =
  | { x: number; y: number }
  | { timeline: I_TimelineKeyframe<{ x: number; y: number }>[] }

/**
 * stay 阶段动画配置
 *
 * 两种模式：
 *
 * 1. 固定值：传数字，stay 期间保持在该值
 *    rotation: 45  → stay 期间 rotation 固定在 45°
 *
 * 2. 动画模式：传 { timeline }，stay 期间播放自定义动画
 *    rotation: { timeline: [{ durationSeconds: 1, to: 10 }, { durationSeconds: 1, to: 0 }] }
 *    timeline 总时长必须 ≤ stayDuration，剩余时间 hold 在最后值
 */
export type I_StayAnimConfig = number | { timeline: I_TimelineKeyframe<number>[] }

/** 背景图适配方式 */
export type T_CanvasBgFit = 'stretch' | 'cover' | 'contain' | 'tile'

/** 背景图对齐方式（九宫格） */
export type T_CanvasBgPosition = 'center' | 'left' | 'right' | 'top' | 'bottom'
	| 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

/** 画布背景配置 */
export interface I_CanvasBg {
	/** 背景图 URL */
	url?: string
	/** 背景色 "#xxx", "rgba(...)", "rgb(...)" */
	color?: string
	/** 适配方式，默认 'stretch' */
	fit?: T_CanvasBgFit
	/** 对齐方式，默认 'center'。stretch 时忽略 */
	position?: T_CanvasBgPosition
}
