import type { T_Direction8 } from "@svg/types"
import defaultTo from 'lodash/defaultTo'

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
  return { x: defaultTo(xMap[direction], 0), y: defaultTo(yMap[direction], 0) }
}
