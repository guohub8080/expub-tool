export type T_SnapAlign = 'start' | 'center' | 'end'

export type T_CanvasSize = {
  w?: number
  h?: number
}

export type T_Direction4 = "L" | "R" | "T" | "B"

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
