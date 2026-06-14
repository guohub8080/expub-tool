import isPlainObject from "lodash/isPlainObject"
import type { T_Origin } from "@svg/types"

/**
 * 根据九宫格位置返回变换原点坐标（相对内容中心）。
 *
 * 坐标系以内容中心为原点，contentWidth/contentHeight 为内容区域尺寸：
 *
 *   TopLeft=(-w/2, -h/2)  Top=(0, -h/2)      TopRight=(w/2, -h/2)
 *   Left=(-w/2, 0)         Center=(0, 0)       Right=(w/2, 0)
 *   BottomLeft=(-w/2, h/2) Bottom=(0, h/2)     BottomRight=(w/2, h/2)
 *
 * 自定义 { x, y } 坐标直接返回。通用工具，AnyCarousel / AnyLoopDisplay 共用。
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
