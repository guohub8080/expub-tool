import type { T_SpacingProps } from "@css-fn/spacing"

// ──────────────────────────── 空间基础 ────────────────────────────

/** 三维向量（x 向右, y 向上, z 沿镜头方向） */
export type Vec3 = { x: number; y: number; z: number }

// ──────────────────────────── Camera ────────────────────────────

/** 相机关键帧段 */
export type CameraSegment = {
  /** 本段持续时长（秒） */
  durationSeconds: number
  /** 本段结束时的绝对目标位置 */
  toAbs?: Partial<Vec3>
  /** 本段结束时的相对偏移量 */
  toRel?: Partial<Vec3>
  /** 贝塞尔缓动参数 "x1 y1 x2 y2" */
  keySplines?: string
}

/** 相机配置 */
export type Camera = {
  /** 相机初始位置（世界坐标） */
  initial: Vec3
  /** 相机运动时间线 */
  timeline: CameraSegment[]
}

// ──────────────────────────── Scene / Object ────────────────────────────

/** 场景类型 */
export type T_SceneKind = 'world' | 'passThrough'

/** 入场修饰器配置（仅 passThrough 生效） */
export type I_EntranceConfig = {
  /** 触发距离：rz < 此值时开始入场（默认 200） */
  triggerDistance?: number
  /** 透明度范围：from → to 随 u 从 0→1 */
  opacity?: { from: number; to: number }
  /** 缩放因子范围：worldScale × from → worldScale × to */
  scale?: { from: number; to: number }
  /** 横向偏移范围：worldTx + from → worldTx + to */
  offsetX?: { from: number; to: number }
  /** 纵向偏移范围：worldTy + from → worldTy + to */
  offsetY?: { from: number; to: number }
}

/** 对象节点 */
export type ObjectNode = {
  /** 对象 ID */
  id: string
  /** 相对 scene 的局部坐标 */
  local: Vec3
  /** 图片 URL */
  asset: string
  /** 图片尺寸（默认与 viewport 相同） */
  size?: { w: number; h: number }
  /** 入场修饰器（覆盖 scene 级配置） */
  entrance?: I_EntranceConfig
}

/** 场景 */
export type Scene = {
  /** 场景 ID */
  id: string
  /** 场景世界坐标 */
  world: Vec3
  /** 场景类型：world = 普通世界层，passThrough = 穿越层 */
  kind: T_SceneKind
  /** 入场修饰器（passThrough 时生效，对象级可覆盖） */
  entrance?: I_EntranceConfig
  /** 场景内的对象列表 */
  objects: ObjectNode[]
}

// ──────────────────────────── Viewport ────────────────────────────

/** 视口配置 */
export type Viewport = {
  width: number
  height: number
}

// ──────────────────────────── Bake 中间层 ────────────────────────────

/** 烘焙帧 — authoring solver 的输出单位 */
export type BakedFrame = {
  /** 归一化时间 [0, 1] */
  t: number
  /** 屏幕 X 平移（相对视口中心） */
  tx: number
  /** 屏幕 Y 平移（相对视口中心） */
  ty: number
  /** 深度缩放因子 */
  scale: number
  /** 透明度 */
  opacity: number
}

/** 规范轨道 — 上游 solver 可替换，下游 SVG 编译器只读此结构 */
export type CanonicalTrack = {
  /** 轨道 ID（格式：sceneId.objectId） */
  id: string
  /** 所属场景 ID */
  sceneId: string
  /** 场景类型 */
  kind: T_SceneKind
  /** 烘焙帧序列 */
  frames: BakedFrame[]
  /** 对象图片尺寸 */
  size: { w: number; h: number }
  /** 图片 URL */
  asset: string
}

/** 烘焙结果 */
export type I_BakeResult = {
  tracks: CanonicalTrack[]
  totalDuration: number
}

// ──────────────────────────── 组件 Props ────────────────────────────

/** CamaraStage 组件 Props */
export type I_CamaraStageProps = {
  /** 视口尺寸 */
  viewport: Viewport
  /** 焦距（默认 300） */
  focalLength?: number
  /** 相机配置 */
  camera: Camera
  /** 场景列表 */
  scenes: Scene[]
  /** 采样率 fps（默认 30） */
  sampleRate?: number
  /** 画布背景 */
  canvasBg?: string
  /** 外间距 */
  spacing?: T_SpacingProps
}
