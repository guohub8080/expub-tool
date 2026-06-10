import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import type { T_Direction4 } from "@svg/types"
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

// ── offset calculator ──

/**
 * 根据方向获取进入时的初始偏移（foreignObject 的 x/y 属性值）
 * 即图片在屏幕外的起始位置
 */
export const getEntryOffset = (
  direction: T_Direction4,
  w: number,
  h: number,
): { x: number; y: number } => {
  switch (direction) {
    case "L": return { x: w, y: 0 }       // 从左侧进入 → 初始在右边屏外
    case "R": return { x: -w, y: 0 }      // 从右侧进入 → 初始在左边屏外
    case "T": return { x: 0, y: h }       // 从上方进入 → 初始在下方屏外
    case "B": return { x: 0, y: -h }      // 从下方进入 → 初始在上方屏外
  }
}

/**
 * 根据方向获取退出偏移（translate 的 toRel 值）
 * 即从屏外位置滑到中心所需的相对位移
 */
export const getExitOffset = (
  direction: T_Direction4,
  w: number,
  h: number,
): { x: number; y: number } => {
  switch (direction) {
    case "L": return { x: -w, y: 0 }
    case "R": return { x: w, y: 0 }
    case "T": return { x: 0, y: -h }
    case "B": return { x: 0, y: h }
  }
}

// ── timeline ──

/** 计算总周期时长 = Σ(coverDuration + stayDuration) */
export const calcTotalDuration = (items: I_NormalizedCoverItem[]): number => {
  return items.reduce((sum, item) => sum + item.coverDuration + item.stayDuration, 0)
}
