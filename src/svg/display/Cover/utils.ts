import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import { DIRECTION_8 } from "@svg/types"
import type { T_Direction8 } from "@svg/types"
import type { I_CoverChildItem, I_NormalizedCoverItem } from "./types"
import { DEFAULT_COVER_DURATION, DEFAULT_STAY_DURATION, DEFAULT_DIRECTION, DEFAULT_KEY_SPLINES } from "./types"

// ── normalizer ──

const fillDefaults = (item: I_CoverChildItem): I_NormalizedCoverItem => {
  const useJsx = isDefined(item.jsx)

  if (isNil(item.url) && isNil(item.jsx)) {
    throw new Error("Each item must have either `url` or `jsx`.")
  }

  if (isDefined(item.url) && isDefined(item.jsx)) {
    console.warn("`url` is ignored when `jsx` is also provided.")
  }

  return {
    url: item.url,
    jsx: item.jsx,
    useJsx,
    coverDuration: defaultTo(item.coverDuration, DEFAULT_COVER_DURATION),
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    direction: defaultTo(item.direction, DEFAULT_DIRECTION),
    keySplines: defaultTo(item.keySplines, DEFAULT_KEY_SPLINES),
  }
}

export const normalizeItems = (items?: I_CoverChildItem[]): I_NormalizedCoverItem[] => {
  if (isNil(items) || items.length === 0) {
    throw new Error("`childItems` must not be empty.")
  }
  return items.map(fillDefaults)
}

// ── offset calculator（8 方向） ──

/**
 * 根据方向获取进入时的初始偏移（foreignObject 的 x/y 属性值）
 * 即图片在屏幕外的起始位置
 */
export const getEntryOffset = (
  direction: T_Direction8,
  w: number,
  h: number,
): { x: number; y: number } => {
  console.log('[getEntryOffset] direction:', JSON.stringify(direction), 'typeof:', typeof direction, 'w:', w, 'h:', h)
  const result = (() => {
    switch (direction) {
      case DIRECTION_8.Left:      return { x: w, y: 0 }
      case DIRECTION_8.Right:     return { x: -w, y: 0 }
      case DIRECTION_8.Top:       return { x: 0, y: h }
      case DIRECTION_8.Bottom:    return { x: 0, y: -h }
      case DIRECTION_8.TopLeft:   return { x: w, y: h }
      case DIRECTION_8.TopRight:  return { x: -w, y: h }
      case DIRECTION_8.BottomLeft:  return { x: w, y: -h }
      case DIRECTION_8.BottomRight: return { x: -w, y: -h }
      default:
        console.error('[Cover] getEntryOffset: unknown direction', direction)
        return { x: 0, y: -h }
    }
  })()
  console.log('[getEntryOffset] result:', JSON.stringify(result))
  return result
}

/**
 * 根据方向获取退出偏移（translate 的 toRel 值）
 * 即从屏外位置滑到中心所需的相对位移
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
    default:
      console.error('[Cover] getExitOffset: unknown direction', direction)
      return { x: 0, y: h }
  }
}

// ── timeline ──

/** 计算总周期时长 = Σ(coverDuration + stayDuration) */
export const calcTotalDuration = (items: I_NormalizedCoverItem[]): number => {
  return items.reduce((sum, item) => sum + item.coverDuration + item.stayDuration, 0)
}
