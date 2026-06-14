import type { ReactNode } from "react"
import type { T_Direction4 } from "@svg/types"
export type { T_Direction4 } from "@svg/types"

/** 默认侧图露出像素宽度 */
export const DEFAULT_PEEK_PX = 30
/** 默认中心图与侧图的间距 */
export const DEFAULT_GAP = 10
/** 默认侧图缩放 */
export const DEFAULT_SIDE_SCALE = 0.8
/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 0.5
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1.0

/**
 * 用户传入的单项配置
 */
export interface I_CoverFlowItemConfig {
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
export interface I_NormalizedItemConfig extends I_CoverFlowItemConfig {
  switchDuration: number;
  stayDuration: number;
  keySplines: string;
  /** 标记 item 模式 */
  useItem: boolean;
}

/** translate 时间线段 */
export interface I_PositionSegment {
  to: number;
  durationSeconds: number;
  keySplines: string;
}

/** scale 时间线段 */
export interface I_ScaleSegment {
  to: number;
  durationSeconds: number;
  keySplines: string;
}

/** 布局计算结果 */
export interface I_Layout {
  viewBoxW: number;
  viewBoxH: number;
  /** 中心图 x 坐标 */
  centerX: number;
  /** 左侧图 x 坐标 */
  leftX: number;
  /** 右侧图 x 坐标 */
  rightX: number;
  /** 侧图垂直居中 y */
  sideY: number;
  /** 缩放原点 */
  pivot: [number, number];
}
