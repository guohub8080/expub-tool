/**
 * CamaraStage — 导演式镜头动画系统类型定义
 *
 * 核心概念：
 *   - Camera 在虚拟 z 空间中运动（前进 / 后撤 / 折返 / 停顿）
 *   - Scene / Object 按 world 坐标放置在 z 空间中
 *   - 编译阶段采样 camera 轨迹 → 投影为 2D 的 translate + scale + opacity
 *   - 输出纯静态 SVG + SMIL，不依赖运行时 JS
 *
 * 空间链路：
 *   objectLocal → sceneWorld → cameraRelative → screen2D
 */

import type { ReactNode } from "react"
import type { I_AbsRelKeyframe, I_TimelineKeyframe } from "@smil/timeline/types"

// ─── 基础向量 ───

/** 三维向量，world space 坐标 */
export interface I_Vec3 {
  x: number
  y: number
  z: number
}

/** 二维向量，screen space 坐标 */
export interface I_Vec2 {
  x: number
  y: number
}

// ─── Camera ───

/** camera timeline 上的单个段：定义 camera 在一段时间内的运动 */
export interface I_CameraSegment {
  /** 本段持续时间（秒） */
  durationSeconds: number
  /** 本段结束时 camera 的绝对位置（与 toRel 二选一） */
  toAbs?: Partial<I_Vec3>
  /** 本段结束时 camera 的相对偏移（与 toAbs 二选一） */
  toRel?: Partial<I_Vec3>
  /** 缓动曲线，默认线性 */
  keySplines?: string
}

/** camera 配置 */
export interface I_CameraConfig {
  /** camera 初始位置 */
  initial: I_Vec3
  /** camera 运动时间线（按顺序执行） */
  timeline: I_CameraSegment[]
}

// ─── Scene & Object ───

/** scene 类型：world = 普通前景层，passThrough = 可穿越层 */
export type T_SceneKind = "world" | "passThrough"

/** 场景级动画配置（局部表演层，不篡改 camera 语义） */
export interface I_SceneTrack {
  /** scene 整体位移偏移 */
  translate?: I_AbsRelKeyframe<Partial<I_Vec2>>[]
  /** scene 整体透明度动画 */
  opacity?: I_TimelineKeyframe<number>[]
  /** scene 整体缩放动画 */
  scale?: I_TimelineKeyframe<number>[]
}

/** 单个 object 配置 */
export interface I_ObjectNodeConfig {
  /** object 唯一标识 */
  id: string
  /** object 在 scene 内的局部坐标 */
  local: Partial<I_Vec3>
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一） */
  jsx?: ReactNode
  /** object 级动画（可选） */
  timeline?: I_ObjectTrack
}

/** object 级动画配置 */
export interface I_ObjectTrack {
  /** 透明度动画 */
  opacity?: I_TimelineKeyframe<number>[]
  /** 缩放动画 */
  scale?: I_TimelineKeyframe<number>[]
}

/** 单个 scene 配置 */
export interface I_SceneConfig {
  /** scene 唯一标识 */
  id: string
  /** scene 在 world space 中的位置 */
  world: I_Vec3
  /** scene 类型 */
  kind: T_SceneKind
  /** scene 级动画（可选） */
  timeline?: I_SceneTrack
  /** scene 内的 object 列表 */
  objects: I_ObjectNodeConfig[]
}

// ─── 投影参数 ───

/** 投影 / 视口配置 */
export interface I_ViewportConfig {
  /** 画布尺寸 */
  width: number
  height: number
  /**
   * 1x 满屏参考深度（焦距）。
   * 当 rz = f 时，scale = 1，即与 viewport 基准尺寸一致的元素刚好满屏。
   */
  f: number
}

// ─── Crossing（穿越事件） ───

/** 穿越方向 */
export type T_CrossDirection = "forward" | "backward"

/**
 * 穿越事件：camera 经过 scene 的 z 平面时触发
 *
 * - forward:  rz 从负变正（camera 从 scene 后方穿到前方）
 * - backward: rz 从正变负（camera 从 scene 前方穿到 scene 后方）
 */
export interface I_CrossingEvent {
  /** 发生穿越的全局时间点（秒） */
  time: number
  /** 穿越方向 */
  direction: T_CrossDirection
}

// ─── 编译结果 ───

/** 单个采样帧的投影结果 */
export interface I_ProjectionFrame {
  /** 屏幕空间 x（相对 viewport 中心） */
  screenX: number
  /** 屏幕空间 y（相对 viewport 中心） */
  screenY: number
  /** 投影缩放比 */
  scale: number
  /** 透明度（穿越时由导演规则决定） */
  opacity: number
}

/** 场景级编译结果：一个 scene 在全局 timeline 上每一帧的 SMIL 关键帧 */
export interface I_CompiledSceneTrack {
  sceneId: string
  /** translate 关键帧（screenX, screenY） */
  translate: I_TimelineKeyframe<Partial<{ x: number; y: number }>>[]
  /** scale 关键帧 */
  scale: I_TimelineKeyframe<number>[]
  /** opacity 关键帧 */
  opacity: I_TimelineKeyframe<number>[]
  /** 该 scene 的穿越事件列表（调试用） */
  crossings: I_CrossingEvent[]
}

// ─── 组件 Props ───

/** CamaraStage 组件对外暴露的 props */
export interface I_CamaraStageProps {
  /** 视口 / 投影配置 */
  viewport: I_ViewportConfig
  /** camera 配置 */
  camera: I_CameraConfig
  /** 场景列表（按 z 轴前后排列，后面的 scene 可能被前面的遮挡） */
  scenes: I_SceneConfig[]
  /**
   * 采样精度：每秒采样帧数，默认 30。
   * 值越大动画越平滑，但生成的 SMIL keyframe 越多。
   */
  sampleRate?: number
  /** 画布背景 */
  canvasBg?: string
  /** 外间距配置 */
  spacing?: import("@css-fn/spacing").T_SpacingProps
}
