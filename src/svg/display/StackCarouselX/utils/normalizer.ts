import defaultTo from "lodash/defaultTo"
import { getEaseBezier } from "@smil/bezier"
import type { I_StackCarouselItem, I_NormalizedStackItem } from "../types"
import { DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from "../types"

const DEFAULT_KEY_SPLINES = getEaseBezier({ isIn: true, isOut: true })

const fillDefaults = (item: I_StackCarouselItem): I_NormalizedStackItem => {
  const useItem = !!item.item
  if (!item.url && !item.item) {
    throw new Error("Each item must have either `url` or `item`.")
  }
  if (item.url && item.item) {
    console.warn("`url` is ignored when `item` is also provided.")
  }
  return {
    url: item.url,
    item: item.item,
    link: item.link,
    useItem,
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    keySplines: defaultTo(item.keySplines, DEFAULT_KEY_SPLINES),
  }
}

/**
 * 标准化配置数组
 *
 * 至少需要 3 张图：1→复制3，2→补成3，≥3→直接用
 */
export const normalizeItems = (items?: I_StackCarouselItem[]): I_NormalizedStackItem[] => {
  if (!items || items.length === 0) {
    throw new Error("`pics` must not be empty. StackCarousel requires at least 1 item.")
  }
  const normalized = items.map(fillDefaults)
  if (normalized.length === 1) {
    return [normalized[0], normalized[0], normalized[0]]
  }
  if (normalized.length === 2) {
    return [normalized[0], normalized[1], normalized[0]]
  }
  return normalized
}
