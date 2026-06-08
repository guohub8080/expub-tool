import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'
import type { T_HotArea, I_CanvasBg } from '@svg/types'

/** 卡牌单面内容 */
export interface I_FaceContent {
  url?: string
  jsx?: ReactNode
  /** 点击热区，不传则默认整张卡片可点击 */
  hotArea?: T_HotArea
}

export interface I_ClickFlipInfinityProps {
  /** SVG viewBox 尺寸 */
  canvasSize: { w: number; h: number }
  /** 画布背景色，默认 #FFFFFF */
  canvasBg?: I_CanvasBg
  /** 正面内容 */
  frontSide: I_FaceContent
  /** 反面内容 */
  backSide: I_FaceContent
  /** 翻转时长（秒），默认 1 */
  flipDuration?: number
  /** 缩放效果时长（秒），默认 1 */
  switchDuration?: number
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}
