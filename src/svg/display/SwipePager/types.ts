import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

/** 可视内容：url 与 jsx 二选一；都为空则该单元不渲染 */
export interface I_SwipePagerContent {
  url?: string
  jsx?: ReactNode
}

export interface I_SwipePagerProps {
  /** SVG viewBox 尺寸，同时决定每个 slide 的宽高比（必填） */
  canvasSize: { w: number; h: number }
  /** 容器背景层（渲染在轨道背后）：url 或 jsx，不传则无背景 */
  canvasBg?: I_SwipePagerContent
  /** 滑块数组。轨道宽 = N×100%，每个 slide 恰好占满视口宽（必填） */
  items: I_SwipePagerContent[]
  /** 露出下一张的宽度（viewBox 单位，同 canvasSize.w）。默认 0 = 每张满屏不露出。
   *  范围 [0, canvasSize.w)：设后每个 slide 占 (canvasSize.w - peekWidth)，右侧露出下一张 peekWidth */
  peekWidth?: number
  /** 外间距 */
  spacing?: T_SpacingProps
}
