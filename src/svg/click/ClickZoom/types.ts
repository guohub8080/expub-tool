import type { ReactNode } from "react"
import type { I_CanvasBg } from "@svg/types"
import type { T_SpacingProps } from "@css-fn/spacing"

/** 默认放大倍数 */
export const DEFAULT_ZOOM_SCALE = 4
/** 默认缩放时长（秒） */
export const DEFAULT_DURATION = 1
/** 默认缓动曲线 */
export const DEFAULT_KEY_SPLINES = "0.24 0 0.24 1"
/** 默认热区宽 */
export const DEFAULT_HOTSPOT_W = 237
/** 默认热区高 */
export const DEFAULT_HOTSPOT_H = 242

/** 单个热区配置 */
export interface ClickZoomItem {
  /** 热区中心 X（viewBox 坐标） */
  x: number
  /** 热区中心 Y（viewBox 坐标） */
  y: number
  /** 热区点击区域宽，默认 237 */
  hotspotW?: number
  /** 热区点击区域高，默认 242 */
  hotspotH?: number
  /** 热区缩略图（可见标注，放在热区位置，让用户看到哪里可以点）。不传则用 url/jsx 作缩略图 */
  thumbnail?: { url?: string; jsx?: ReactNode }
  /** 详情内容图片地址（放大后显示，与 jsx 二选一） */
  url?: string
  /** 详情自定义内容（与 url 二选一，优先级高） */
  jsx?: ReactNode
}

export interface I_ClickZoomProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 底图（被放大的背景）。不传则无底图 */
  background?: { url?: string; jsx?: ReactNode }
  /** 热区数组 */
  items: ClickZoomItem[]
  /** 放大倍数，默认 4 */
  zoomScale?: number
  /** 缩放时长（秒），默认 1 */
  duration?: number
  /** 缓动曲线，默认 "0.24 0 0.24 1"（ease-out） */
  keySplines?: string
  /** 画布背景 */
  canvasBg?: I_CanvasBg
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}
