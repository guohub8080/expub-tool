import isPlainObject from "lodash/isPlainObject"
import type { T_Direction8, T_Origin } from "@svg/types"

/**
 * 方向位移计算器
 *
 * 根据推入/推出方向和画布尺寸，计算屏幕外的 translate 坐标。
 * 坐标系以画布中心为原点。
 *
 * bufferMultiplier 用于放大 offscreen 距离，确保缩放后的内容也完全离开可见区域。
 * 例如 exit scale=3 时，内容可能放大到 3 倍，需要 translate 距离也相应放大。
 *
 * 额外加上 canvasSize × 0.5 的余量，覆盖非 Center origin（如 TopLeft）导致的
 * 内容不对称扩展——此时内容从 origin 向一侧扩展，距离中心比 Center origin 更远。
 */
export const getOffscreenTranslate = ({
  direction,
  canvasWidth,
  canvasHeight,
  bufferMultiplier = 1,
}: {
  /** 推入/推出方向 */
  direction: T_Direction8
  /** 画布宽度 */
  canvasWidth: number
  /** 画布高度 */
  canvasHeight: number
  /** 距离倍数，默认 1。当内容有缩放时，应传入 max(scale, 1) 以确保放大后的内容完全离屏 */
  bufferMultiplier?: number
}): { x: number; y: number } => {
  // canvasSize × bufferMultiplier + 10
  // +10 覆盖非 Center origin 导致的内容不对称扩展（anti-aliasing 余量）
  const offscreenDistanceX = canvasWidth * bufferMultiplier + 10
  const offscreenDistanceY = canvasHeight * bufferMultiplier + 10
  const xMap: Record<string, number> = {
    L: offscreenDistanceX, R: -offscreenDistanceX,
    TL: offscreenDistanceX, TR: -offscreenDistanceX,
    BL: offscreenDistanceX, BR: -offscreenDistanceX,
  }
  const yMap: Record<string, number> = {
    T: offscreenDistanceY, B: -offscreenDistanceY,
    TL: offscreenDistanceY, TR: offscreenDistanceY,
    BL: -offscreenDistanceY, BR: -offscreenDistanceY,
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
