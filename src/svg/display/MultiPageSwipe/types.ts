import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

/** 可视内容：url 与 jsx 二选一；都为空则不渲染 */
export interface I_MultiPageSwipeContent {
  url?: string
  jsx?: ReactNode
}

/** 标签把手：内容 + 手动几何（viewBox）。x 自动靠右 = canvasW - w，不用传 */
export interface I_TagHandle {
  url?: string
  jsx?: ReactNode
  /** 宽（viewBox） */
  w: number
  /** 高（viewBox） */
  h: number
  /** 顶部 Y（viewBox） */
  y: number
}

/** 单个抽拉卡：一个右侧把手 + 一组横向抽拉面板 */
export interface I_MultiPageSwipeChildItem {
  /** 右侧把手（手动 w/h/y，靠右） */
  tagHandle: I_TagHandle
  /** 向左抽拉的横向面板（至少 1 张） */
  content: I_MultiPageSwipeContent[]
}

export interface I_MultiPageSwipeProps {
  /** SVG viewBox 尺寸（必填） */
  canvasSize: { w: number; h: number }
  /** 整体背景层（渲染在所有卡背后）：url 或 jsx，不传则无背景 */
  canvasBg?: I_MultiPageSwipeContent
  /** N 个抽拉卡（零高视差叠加）；每卡一个把手 + 一组横向面板（必填） */
  childItems: I_MultiPageSwipeChildItem[]
  /** 外间距 */
  spacing?: T_SpacingProps
}
