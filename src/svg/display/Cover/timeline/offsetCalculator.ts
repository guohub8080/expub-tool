import { DIRECTION_8 } from "@svg/types"
import type { T_Direction8 } from "@svg/types"

/**
 * 进入偏移 — foreignObject 的 x/y 初始坐标（屏外位置）
 *
 * CoverIn: foreignObject 放在屏外，通过 translate 滑到中心
 */
export const getEntryOffset = (
  direction: T_Direction8,
  w: number,
  h: number,
): { x: number; y: number } => {
  switch (direction) {
    case DIRECTION_8.Left:      return { x: w, y: 0 }
    case DIRECTION_8.Right:     return { x: -w, y: 0 }
    case DIRECTION_8.Top:       return { x: 0, y: h }
    case DIRECTION_8.Bottom:    return { x: 0, y: -h }
    case DIRECTION_8.TopLeft:   return { x: w, y: h }
    case DIRECTION_8.TopRight:  return { x: -w, y: h }
    case DIRECTION_8.BottomLeft:  return { x: w, y: -h }
    case DIRECTION_8.BottomRight: return { x: -w, y: -h }
  }
}

/**
 * 退出偏移 — 从屏外滑到中心所需的相对位移（toRel）
 *
 * CoverIn: foreignObject 从 entryOffset 位置 translate 此值到达中心
 * CoverOut: foreignObject 从中心 translate 此值到达屏外
 */
export const getExitOffset = (
  direction: T_Direction8,
  w: number,
  h: number,
): { x: number; y: number } => {
  switch (direction) {
    case DIRECTION_8.Left:      return { x: -w, y: 0 }
    case DIRECTION_8.Right:     return { x: w, y: 0 }
    case DIRECTION_8.Top:       return { x: 0, y: -h }
    case DIRECTION_8.Bottom:    return { x: 0, y: h }
    case DIRECTION_8.TopLeft:   return { x: -w, y: -h }
    case DIRECTION_8.TopRight:  return { x: w, y: -h }
    case DIRECTION_8.BottomLeft:  return { x: -w, y: h }
    case DIRECTION_8.BottomRight: return { x: w, y: h }
  }
}
