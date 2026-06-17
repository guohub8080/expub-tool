import type { ReactNode } from "react"
import type { T_SpacingProps } from "@css-fn/spacing"

export const DEFAULT_BLADES = 8
export const DEFAULT_BLADE_FILL = "#323232"
export const DEFAULT_BLADE_STROKE = "#000000"
export const DEFAULT_BLADE_STROKE_WIDTH = 2
export const DEFAULT_CLOSE_DURATION = 0.5
export const DEFAULT_CLOSE_STAY = 0.4
export const DEFAULT_OPEN_DURATION = 0.5
export const DEFAULT_OPEN_STAY = 1.2
/** 默认缓动曲线（ease-in-out） */
export const DEFAULT_KEY_SPLINES = "0.42 0 0.58 1"

export interface I_ShutterBladeProps {
  canvasSize: { w: number; h: number }
  /** 叶片数，默认 8 */
  blades?: number
  /** 叶片填充色，默认 #323232 */
  bladeFill?: string
  /** 叶片描边色，默认 #000 */
  bladeStroke?: string
  /** 叶片描边宽度，默认 2 */
  bladeStrokeWidth?: number
  /** 关闭时长（秒，叶片平移回来覆盖），默认 0.5 */
  closeDuration?: number
  /** 关闭停留（秒，覆盖状态），默认 0.4 */
  closeStay?: number
  /** 打开时长（秒，叶片平移出去露出），默认 0.5 */
  openDuration?: number
  /** 打开停留（秒，露出底图），默认 1.2 */
  openStay?: number
  /** 缓动曲线（SMIL keySplines），默认 "0.42 0 0.58 1"（ease-in-out，缓慢停住）。
   *  传 "0 0 1 1" = 线性（匀速） */
  keySplines?: string
  children?: ReactNode
  spacing?: T_SpacingProps
}
