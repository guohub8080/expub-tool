import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

/** 卡牌单面内容（复用 ClickFlipCard 的接口） */
export interface I_FaceContent {
  url?: string
  jsx?: ReactNode
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
  /** 贝塞尔缓动参数 "x1 y1 x2 y2"，省略则线性 */
  keySplines?: string
  /** 外间距 */
  spacing?: T_SpacingProps
}
