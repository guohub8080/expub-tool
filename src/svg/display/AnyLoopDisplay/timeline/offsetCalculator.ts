import isPlainObject from "lodash/isPlainObject"
import type { T_Direction8, T_Origin } from "@svg/types"

/**
 * 方向位移计算器
 *
 * 根据推入/推出方向和画布尺寸，计算屏幕外的 translate 坐标。
 * 坐标系以画布中心为原点：
 *   T  → y = +(canvasHeight+1)
 *   B  → y = -(canvasHeight+1)
 *   L  → x = +(canvasWidth+1)
 *   R  → x = -(canvasWidth+1)
 *   TL → x = +(canvasWidth+1), y = +(canvasHeight+1)
 *   TR → x = -(canvasWidth+1), y = +(canvasHeight+1)
 *   BL → x = +(canvasWidth+1), y = -(canvasHeight+1)
 *   BR → x = -(canvasWidth+1), y = -(canvasHeight+1)
 */
export const getOffscreenTranslate = ({
  direction,
  canvasWidth,
  canvasHeight,
}: {
  /** 推入/推出方向 */
  direction: T_Direction8
  /** 画布宽度 */
  canvasWidth: number
  /** 画布高度 */
  canvasHeight: number
}): { x: number; y: number } => {
  const xMap: Record<string, number> = {
    L: canvasWidth + 1, R: -(canvasWidth + 1),
    TL: canvasWidth + 1, TR: -(canvasWidth + 1),
    BL: canvasWidth + 1, BR: -(canvasWidth + 1),
  }
  const yMap: Record<string, number> = {
    T: canvasHeight + 1, B: -(canvasHeight + 1),
    TL: canvasHeight + 1, TR: canvasHeight + 1,
    BL: -(canvasHeight + 1), BR: -(canvasHeight + 1),
  }
  return { x: xMap[direction] ?? 0, y: yMap[direction] ?? 0 }
}

/**
 * 根据九宫格位置返回旋转中心的坐标。
 *
 * 坐标系以画布中心为原点，contentWidth/contentHeight 为内容区域尺寸：
 *
 *   TopLeft=(-w/2, -h/2)  Top=(0, -h/2)      TopRight=(w/2, -h/2)
 *   Left=(-w/2, 0)         Center=(0, 0)       Right=(w/2, 0)
 *   BottomLeft=(-w/2, h/2) Bottom=(0, h/2)     BottomRight=(w/2, h/2)
 */
export const getRotationOrigin = ({
  origin,
  contentWidth,
  contentHeight,
}: {
  /** 九宫格位置或自定义坐标 */
  origin: T_Origin
  /** 内容区域宽度 */
  contentWidth: number
  /** 内容区域高度 */
  contentHeight: number
}): [number, number] => {
  // 自定义坐标直接返回
  if (isPlainObject(origin)) {
    const { x, y } = origin as { x: number; y: number }
    return [x, y]
  }

  // 九宫格预设（origin 此时一定是 string）
  const hw = contentWidth / 2
  const hh = contentHeight / 2
  const grid: Record<string, [number, number]> = {
    TopLeft: [-hw, -hh],    Top: [0, -hh],      TopRight: [hw, -hh],
    Left: [-hw, 0],         Center: [0, 0],      Right: [hw, 0],
    BottomLeft: [-hw, hh],  Bottom: [0, hh],     BottomRight: [hw, hh],
  }
  return grid[origin as string]
}
