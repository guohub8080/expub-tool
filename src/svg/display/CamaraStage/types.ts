/**
 * types — Layer World System 类型定义
 *
 * 核心概念：
 *   - Camera 在虚拟空间中运动（后撤 / 推进 / 摆动）
 *   - Layer 是世界中的图像平面，有统一的 world 坐标
 *   - 编译阶段统一采样 → 投影为 translate + scale + opacity
 *   - 输出纯静态 SVG + SMIL
 */

import type { ReactNode } from "react"
import type { I_TimelineKeyframe } from "@smil/timeline/types"

// ─── 基础 ───

export interface I_Vec3 {
  x: number
  y: number
  z: number
}

// ─── Camera ───

export interface I_CameraSegment {
  /** 本段持续时间（秒） */
  durationSeconds: number
  /** 绝对目标位置（与 toRel 二选一） */
  toAbs?: Partial<I_Vec3>
  /** 相对偏移（与 toAbs 二选一） */
  toRel?: Partial<I_Vec3>
  /** 缓动曲线 */
  keySplines?: string
}

export interface I_CameraConfig {
  initial: I_Vec3
  timeline: I_CameraSegment[]
}

// ─── Layer ───

export type T_LayerRole = "base" | "entering" | "foreground" | "background"

export interface I_LayerTrack {
  /** 表演起始时间（秒），不传则跟随 camera 穿越自然入场 */
  at?: number
  /** 表演持续时间（秒） */
  duration?: number
  opacityFrom?: number
  opacityTo?: number
  scaleFrom?: number
  scaleTo?: number
  xFrom?: number
  xTo?: number
  yFrom?: number
  yTo?: number
  easing?: string
}

export interface I_LayerConfig {
  id: string
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义内容（与 url 二选一） */
  jsx?: ReactNode
  /** 导演化世界坐标 */
  worldX: number
  worldY: number
  worldZ: number
  /** layer 角色 */
  role?: T_LayerRole
  /** 局部表演时间轴 */
  timeline?: I_LayerTrack[]
}

// ─── Viewport ───

export interface I_ViewportConfig {
  width: number
  height: number
  /** 满屏参考深度（1x scale 时 rz = f） */
  f: number
}

// ─── 编译结果 ───

/** 单帧投影结果 */
export interface I_LayerFrame {
  worldTx: number
  worldTy: number
  worldScale: number
  enterTx: number
  enterTy: number
  enterScale: number
  enterOpacity: number
  finalTx: number
  finalTy: number
  finalScale: number
  finalOpacity: number
}

/** 单个 layer 的编译结果：world 轨道 + entrance 修饰轨道 */
export interface I_CompiledLayer {
  layerId: string
  init: I_LayerFrame
  worldTranslateTimeline: I_TimelineKeyframe<{ x: number; y: number }>[]
  worldScaleTimeline: I_TimelineKeyframe<number>[]
  enterTranslateTimeline: I_TimelineKeyframe<{ x: number; y: number }>[]
  enterScaleTimeline: I_TimelineKeyframe<number>[]
  enterOpacityTimeline: I_TimelineKeyframe<number>[]
}

// ─── 组件 Props ───

export interface I_CamaraStageProps {
  viewport: I_ViewportConfig
  camera: I_CameraConfig
  layers: I_LayerConfig[]
  /** 采样精度（帧/秒），默认 30 */
  sampleRate?: number
  /** 画布背景 */
  canvasBg?: string
  /** 外间距 */
  spacing?: import("@css-fn/spacing").T_SpacingProps
}
