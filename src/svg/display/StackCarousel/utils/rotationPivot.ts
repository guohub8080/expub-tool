import isPlainObject from "lodash/isPlainObject"
import type { T_Pivot } from "@svg/types"

/**
 * 九宫格旋转中心 → card 局部坐标 [x, y]
 *
 * 坐标系：(0,0) = card 左上角，(cardWidth, cardHeight) = card 右下角
 */
export const resolveRotationPivot = ({
  pivot,
  cardWidth,
  cardHeight,
}: {
  pivot: T_Pivot
  cardWidth: number
  cardHeight: number
}): [number, number] => {
  if (isPlainObject(pivot)) {
    const { x, y } = pivot as { x: number; y: number }
    return [x, y]
  }

  const w = cardWidth
  const h = cardHeight
  const grid: Record<string, [number, number]> = {
    TopLeft:     [0, 0],    Top:     [w / 2, 0],    TopRight:     [w, 0],
    Left:        [0, h / 2], Center:  [w / 2, h / 2], Right:       [w, h / 2],
    BottomLeft:  [0, h],    Bottom:  [w / 2, h],    BottomRight:  [w, h],
  }
  return grid[pivot as string]
}
