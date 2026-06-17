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
/** 默认圆孔半径（-1 = 自动，对角线 * 0.6） */
export const DEFAULT_APERTURE = -1

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
  /** 圆孔半径（打开态，顶点距中心多远）。默认 -1 = 自动（对角线*0.6）。
   *  越大孔越大（露出多），越小孔越小 */
  aperture?: number
  /** 收缩时长（秒，叶片向中心平移、孔变小），默认 0.5 */
  closeDuration?: number
  /** 闭合停留（秒，孔=0），默认 0.4 */
  closeStay?: number
  /** 张开时长（秒，叶片回弹、孔变大），默认 0.5 */
  openDuration?: number
  /** 打开停留（秒，露出底图），默认 1.2 */
  openStay?: number
  children?: ReactNode
  spacing?: T_SpacingProps
}
