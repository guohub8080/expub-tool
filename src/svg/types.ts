export type T_SnapAlign = 'start' | 'center' | 'end'

export type T_CanvasSize = {
  w?: number
  h?: number
}

export type T_Direction4 = "L" | "R" | "T" | "B"

/** 八方向：水平/垂直 + 对角线（对角线遵循 CSS 习惯：垂直在前 TL/TR/BL/BR） */
export type T_Direction8 = "L" | "R" | "T" | "B" | "TL" | "TR" | "BL" | "BR"

export type T_DirectionX = "L" | "R"

/** 九宫格预设位置 或 自定义坐标 */
export type T_Origin =
  | 'TopLeft' | 'Top' | 'TopRight'
  | 'Left'   | 'Center' | 'Right'
  | 'BottomLeft' | 'Bottom' | 'BottomRight'
  | { x: number; y: number }

export type T_HotArea = {
  x?: number
  y?: number
  w?: number
  h?: number
}

/** 斜切配置 */
export interface I_SkewConfig {
  /** skewX 或 skewY，决定斜切轴方向 */
  type: 'X' | 'Y'
  /** 斜切角度（度），正负决定倾斜方向，建议 0–45 */
  angle: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/** 旋转配置 */
export interface I_RotationConfig {
  /** 旋转中心，默认 Center */
  origin?: T_Origin
  /** 旋转角度（度），正值=顺时针，默认 0 */
  angle?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}
