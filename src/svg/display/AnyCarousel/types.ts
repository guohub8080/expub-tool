import type { ReactNode } from "react"

/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 0.5
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1.0
/** 默认相邻 child 间距（像素） */
export const DEFAULT_CHILD_GAP = 100
/** 默认流动方向角度（度），0 = 向右 */
export const DEFAULT_ANGLE = 0

/**
 * 单个角色的变换配置（5 通道）
 *
 * 用于 centerChildConfig / lastChildConfig / nextChildConfig / outWindowConfig。
 * 所有通道可选，缺省为恒等值（scale=1、rotate=0、skewX=0、skewY=0、opacity=1）。
 */
export interface I_ChildTransform {
  /** 缩放比，默认 1 */
  scale?: number;
  /** 旋转角度（度），默认 0 */
  rotate?: number;
  /** X 方向倾斜角度（度），默认 0 */
  skewX?: number;
  /** Y 方向倾斜角度（度），默认 0 */
  skewY?: number;
  /** 不透明度 0-1，默认 1 */
  opacity?: number;
}

/** 标准化后的角色变换配置 — 5 通道均已填充默认值 */
export interface I_NormalizedChildTransform {
  scale: number;
  rotate: number;
  skewX: number;
  skewY: number;
  opacity: number;
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
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string;
}

/**
 * 标准化后的配置 — 所有可选字段已填充默认值
 */
export interface I_NormalizedItemConfig extends I_AnyCarouselItemConfig {
  switchDuration: number;
  stayDuration: number;
  keySplines: string;
  /** 标记 item 模式 */
  useItem: boolean;
}
