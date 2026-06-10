import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import type { I_CoverChildItem, I_NormalizedCoverItem } from "../types"
import { DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION, DEFAULT_DIRECTION, DEFAULT_KEY_SPLINES } from "../types"

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
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    direction: defaultTo(item.direction, DEFAULT_DIRECTION),
    keySplines: defaultTo(item.keySplines, DEFAULT_KEY_SPLINES),
  }
}

/**
 * 标准化 childItems：
 * - 空/nil → throw
 * - 1 图 → 复制成 2 张做循环
 * - ≥ 2 图 → 逐个填充默认值
 */
export const normalizeItems = (items?: I_CoverChildItem[]): I_NormalizedCoverItem[] => {
  if (isNil(items) || items.length === 0) {
    throw new Error("`childItems` must not be empty.")
  }
  const normalized = items.map(fillDefaults)
  if (normalized.length === 1) {
    return [normalized[0], { ...normalized[0] }]
  }
  return normalized
}

/** 计算总周期时长 = Σ(switchDuration + stayDuration) */
export const calcTotalDuration = (items: I_NormalizedCoverItem[]): number => {
  return items.reduce((sum, item) => sum + item.switchDuration + item.stayDuration, 0)
}
