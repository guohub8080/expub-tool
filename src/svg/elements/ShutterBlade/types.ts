import type { ReactNode } from "react"
import type { T_SpacingProps } from "@css-fn/spacing"

/** 默认叶片数 */
export const DEFAULT_BLADES = 6
/** 默认叶片填充色（浅灰，配合描边看轮廓） */
export const DEFAULT_BLADE_FILL = "#f3f4f6"
/** 默认叶片描边色 */
export const DEFAULT_BLADE_STROKE = "#374151"
/** 默认叶片描边宽度（viewBox 单位） */
export const DEFAULT_BLADE_STROKE_WIDTH = 2
/** 默认关闭过程时长（秒，叶片旋入包裹） */
export const DEFAULT_CLOSE_DURATION = 0.5
/** 默认闭合停留（秒，叶片铺满） */
export const DEFAULT_CLOSE_STAY = 0.4
/** 默认打开过程时长（秒，叶片撤离） */
export const DEFAULT_OPEN_DURATION = 0.5
/** 默认打开停留（秒，露出底图） */
export const DEFAULT_OPEN_STAY = 1.2

export interface I_ShutterBladeProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 叶片数，默认 6 */
  blades?: number
  /** 叶片填充色，默认 #f3f4f6（浅灰） */
  bladeFill?: string
  /** 叶片描边色，默认 #374151 */
  bladeStroke?: string
  /** 叶片描边宽度（viewBox 单位），默认 2 */
  bladeStrokeWidth?: number
  /** 关闭旋转角度（度），默认 0 = 自动按扇区角 360/blades 算；
   *  传正值则用该值（更大旋得更狠） */
  openAngle?: number
  /** 关闭过程时长（秒，叶片旋入包裹），默认 0.5 */
  closeDuration?: number
  /** 闭合停留（秒，叶片铺满），默认 0.4 */
  closeStay?: number
  /** 打开过程时长（秒，叶片撤离），默认 0.5 */
  openDuration?: number
  /** 打开停留（秒，露出底图），默认 1.2 */
  openStay?: number
  /** 快门后面的内容（打开时露出） */
  children?: ReactNode
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}
