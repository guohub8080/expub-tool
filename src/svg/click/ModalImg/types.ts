import type { T_SpacingProps } from '@css-fn/spacing'
import type { I_CanvasBg } from '@svg/types'

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
}

export interface I_ModalImgProps {
  /** SVG viewBox 尺寸（必填） */
  canvasSize: { w: number; h: number }
  /** 画布背景 */
  canvasBg?: I_CanvasBg
  /** 热区 + 图片列表（必填） */
  childItems: I_ModalImgChildItem[]
  /** 外间距 */
  spacing?: T_SpacingProps
}
