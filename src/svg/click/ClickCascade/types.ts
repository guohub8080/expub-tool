import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

export interface I_CascadeLayer {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 SVG 内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
  /** 点击热区（viewBox 坐标），不传则全屏 */
  hotArea?: { x?: number; y?: number; w?: number; h?: number }
}

export interface I_ClickCascadeProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 画布背景色，默认 #FFFFFF */
  canvasBg?: string
  /** 图层配置数组（至少 2 张），第 1 张为底层，依次向上叠加 */
  layers: I_CascadeLayer[]
  /** 淡入时长（秒），默认 0.8 */
  fadeDuration?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}
