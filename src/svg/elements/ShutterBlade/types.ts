import type { ReactNode } from "react"
import type { T_SpacingProps } from "@css-fn/spacing"

export const DEFAULT_BLADES = 6
export const DEFAULT_BLADE_FILL = "#f3f4f6"
export const DEFAULT_BLADE_STROKE = "#374151"
export const DEFAULT_BLADE_STROKE_WIDTH = 2
export const DEFAULT_CLOSE_DURATION = 0.5
export const DEFAULT_CLOSE_STAY = 0.4
export const DEFAULT_OPEN_DURATION = 0.5
export const DEFAULT_OPEN_STAY = 1.2
/** 默认闭合旋转角度（-1 = 自动 = sector/2） */
export const DEFAULT_CLOSE_ANGLE = -1

export interface I_ShutterBladeProps {
  canvasSize: { w: number; h: number }
  /** 叶片数，默认 6 */
  blades?: number
  /** 叶片填充色，默认 #f3f4f6 */
  bladeFill?: string
  /** 叶片描边色，默认 #374151 */
  bladeStroke?: string
  /** 叶片描边宽度，默认 2 */
  bladeStrokeWidth?: number
  /** 闭合旋转角度（度），叶片绕枢轴旋转多少度收缩孔径。
   *  默认 -1 = 自动（360/N/2 = sector/2） */
  closeAngle?: number
  /** 收缩时长（秒，叶片旋转、孔变小），默认 0.5 */
  closeDuration?: number
  /** 闭合停留（秒），默认 0.4 */
  closeStay?: number
  /** 张开时长（秒，叶片旋回、孔变大），默认 0.5 */
  openDuration?: number
  /** 打开停留（秒，露出底图），默认 1.2 */
  openStay?: number
  children?: ReactNode
  spacing?: T_SpacingProps
}
