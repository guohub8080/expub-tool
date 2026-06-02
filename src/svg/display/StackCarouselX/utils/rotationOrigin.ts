import isPlainObject from "lodash/isPlainObject"
import type { T_RotationOrigin } from "../types"

/**
 * 九宫格旋转中心 → card 局部坐标 [cx, cy]
 *
 * 坐标系：(0,0) = card 左上角，(cardWidth, cardHeight) = card 右下角
 */
export const resolveRotationOrigin = ({
  origin,
  cardWidth,
  cardHeight,
}: {
  origin: T_RotationOrigin
  cardWidth: number
  cardHeight: number
}): [number, number] => {
  if (isPlainObject(origin)) {
    const { cx, cy } = origin as { cx: number; cy: number }
    return [cx, cy]
  }

  const w = cardWidth
  const h = cardHeight
  const grid: Record<string, [number, number]> = {
    TopLeft:     [0, 0],    Top:     [w / 2, 0],    TopRight:     [w, 0],
    Left:        [0, h / 2], Center:  [w / 2, h / 2], Right:       [w, h / 2],
    BottomLeft:  [0, h],    Bottom:  [w / 2, h],    BottomRight:  [w, h],
  }
  return grid[origin as string]
}
