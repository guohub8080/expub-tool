import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

/** 卡牌单面内容（复用 ClickFlipCard 的接口） */
export interface I_FaceContent {
  url?: string
  jsx?: ReactNode
}

/** 点击热区配置 */
export interface I_HotArea {
  /** 热区左上角 X（相对于 canvasSize） */
  x?: number
  /** 热区左上角 Y（相对于 canvasSize） */
  y?: number
  /** 热区宽度 */
  w: number
  /** 热区高度 */
  h: number
}

export interface I_ClickFlipOnceProps {
  /** SVG viewBox 尺寸 */
  canvasSize: { w: number; h: number }
  /** 画布背景色 */
  canvasBg?: string
  /** 正面内容 */
  frontSide: I_FaceContent
  /** 反面内容 */
  backSide: I_FaceContent
  /** 翻转时长（秒），默认 1 */
  flipDuration?: number
  /** 贝塞尔缓动参数 "x1 y1 x2 y2"，省略则使用 ease-in-out */
  keySplines?: string
  /** 点击热区，不传则默认整张卡片可点击 */
  hotArea?: I_HotArea
  /** 外间距 */
  spacing?: T_SpacingProps
}
