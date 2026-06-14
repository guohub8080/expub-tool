import isPlainObject from "lodash/isPlainObject"
import type { T_Pivot } from "@svg/types"

/**
 * 根据九宫格位置返回变换支点坐标（相对内容中心）。
 *
 * 坐标系以内容中心为原点，contentWidth/contentHeight 为内容区域尺寸：
 *
 *   TopLeft=(-w/2, -h/2)  Top=(0, -h/2)      TopRight=(w/2, -h/2)
 *   Left=(-w/2, 0)         Center=(0, 0)       Right=(w/2, 0)
 *   BottomLeft=(-w/2, h/2) Bottom=(0, h/2)     BottomRight=(w/2, h/2)
 *
 * 自定义 { x, y } 坐标直接返回。通用工具，AnyCarousel / AnyLoopDisplay 共用。
 */
export const getRotationPivot = ({
  pivot,
  contentWidth,
  contentHeight,
}: {
  /** 九宫格位置或自定义坐标 */
  pivot: T_Pivot
  /** 内容区域宽度 */
  contentWidth: number
  /** 内容区域高度 */
  contentHeight: number
}): [number, number] => {
  // 自定义坐标直接返回
  if (isPlainObject(pivot)) {
    const { x, y } = pivot as { x: number; y: number }
    return [x, y]
  }

  // 九宫格预设（pivot 此时一定是 string）
  const halfWidth = contentWidth / 2
  const halfHeight = contentHeight / 2
  const grid: Record<string, [number, number]> = {
    TopLeft: [-halfWidth, -halfHeight],   Top: [0, -halfHeight],     TopRight: [halfWidth, -halfHeight],
    Left: [-halfWidth, 0],                Center: [0, 0],            Right: [halfWidth, 0],
    BottomLeft: [-halfWidth, halfHeight], Bottom: [0, halfHeight],   BottomRight: [halfWidth, halfHeight],
  }
  return grid[pivot as string]
}
