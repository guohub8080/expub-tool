import type { ReactNode } from "react"
import type { T_SpacingProps } from "@css-fn/spacing"

/** 默认放大倍数 */
export const DEFAULT_ZOOM_SCALE = 4
/** 默认缩放时长（秒） */
export const DEFAULT_DURATION = 1
/** 默认缓动曲线 */
export const DEFAULT_KEY_SPLINES = "0.24 0 0.24 1"

/** 热区缩略图位置（左上角 + 尺寸，viewBox 坐标） */
export interface ClickZoomThumbnail {
  /** 缩略图左上角 X（viewBox 坐标，不是中心） */
  x: number
  /** 缩略图左上角 Y（viewBox 坐标，不是中心） */
  y: number
  /** 缩略图宽 */
  w: number
  /** 缩略图高 */
  h: number
}

/** per-item scale 配置（放大/缩小速度与缓动） */
export interface ClickZoomScale {
  /** 放大时长（秒），缺省用内部默认 1 */
  inDuration?: number
  /** 缩小时长（秒），缺省用内部默认 1 */
  outDuration?: number
  /** 放大缓动曲线，缺省用内部默认 "0.24 0 0.24 1" */
  inKeySplines?: string
  /** 缩小缓动曲线，缺省用内部默认 "0.24 0 0.24 1 */
  outKeySplines?: string
}

/** 单个热区配置 */
export interface ClickZoomItem {
  /** 缩略图位置（左上角 + 尺寸） */
  thumbnail: ClickZoomThumbnail
  /** 放大后的详情内容。string = 图片 url；ReactNode = 自定义 jsx */
  modalContent: string | ReactNode
  /** scale 配置（per-item 放大/缩小速度与缓动），缺省用内部默认 */
  scale?: ClickZoomScale
}

export interface I_ClickZoomProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 热区数组 */
  childItems: ClickZoomItem[]
  /** 背景放大开关，默认 4。范围 [1, +∞)，< 1 抛错
   *  modal（详情）放大倍数固定 = 热区→全屏（canvasSize.w / thumbnail.w），始终放大、不受此值影响
   *  zoomScale 只管 homeBg 背景：=1 背景不放大（跳过副本），>1 背景跟着 modal 一起放大 */
  zoomScale?: number
  /** 主背景（必填）。string = 图片 url（自动包 <image>）；ReactNode = 任意 SVG（含动画）。同时渲染在静态层和放大层，SMIL 自动同步 */
  homeBg: string | ReactNode
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}
