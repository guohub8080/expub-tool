import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

/** 热区位置和尺寸（viewBox 单位，同 canvasSize 坐标系） */
export interface I_ModalImgHotArea {
  x: number
  y: number
  w: number
  h: number
}

/** 单个热区 + 对应图片 */
export interface I_ModalImgChildItem {
  /** 热区位置（viewBox 单位） */
  hotArea: I_ModalImgHotArea
  /** 点击热区后弹出的图片 URL（微信原生预览） */
  imgUrl: string
  /** 图片自然高/宽比（data-ratio）。如 5.66 表示高是宽的 5.66 倍。用于计算 scale 压缩长图 */
  ratio?: number
}

/** 背景内容：url 或 jsx 二选一 */
export interface I_ModalImgContent {
  url?: string
  jsx?: ReactNode
}

export interface I_ModalImgProps {
  /** SVG viewBox 尺寸（必填） */
  canvasSize: { w: number; h: number }
  /** 画布背景：url 或 jsx，不传则无背景 */
  canvasBg?: I_ModalImgContent
  /** 热区 + 图片列表（必填） */
  childItems: I_ModalImgChildItem[]
  /** 外间距 */
  spacing?: T_SpacingProps
}
