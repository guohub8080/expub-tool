import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from '@utils/fn/isDefined'
import { getEaseBezier } from "@smil/bezier"
import type { T_Direction8 } from "@svg/types"
import type { I_StackCarouselItem, I_NormalizedStackItem, I_NormalizedExitConfig } from "../types"
import { DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from "../types"

const DEFAULT_KEY_SPLINES = getEaseBezier({ isIn: true, isOut: true })

const normalizeExit = (item: I_StackCarouselItem, defaultDirection: T_Direction8): I_NormalizedExitConfig => {
  const exit = item.exit
  return {
    direction: defaultTo(exit?.direction, defaultDirection),
    skew: exit?.skew,
    rotation: isNil(exit?.rotation?.angle) ? undefined : exit!.rotation,
    scale: defaultTo(exit?.scale, 1),
    distance: exit?.distance,
  }
}

const fillDefaults = (item: I_StackCarouselItem, defaultExitDirection: T_Direction8): I_NormalizedStackItem => {
  const useItem = isDefined(item.jsx)
  if (isNil(item.url) && isNil(item.jsx)) {
    throw new Error("Each item must have either `url` or `jsx`.")
  }
  if (isDefined(item.url) && isDefined(item.jsx)) {
    console.warn("`url` is ignored when `jsx` is also provided.")
  }
  return {
    url: item.url,
    jsx: item.jsx,
    link: item.link,
    useItem,
    exit: normalizeExit(item, defaultExitDirection),
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
export const normalizeItems = ({ items, defaultExitDirection }: {
  items?: I_StackCarouselItem[]
  defaultExitDirection: T_Direction8
}): I_NormalizedStackItem[] => {
  if (isNil(items) || items.length === 0) {
    throw new Error("`pics` must not be empty. StackCarousel requires at least 1 item.")
  }
  const normalized = items.map(item => fillDefaults(item, defaultExitDirection))
  if (normalized.length === 1) {
    return [normalized[0], normalized[0], normalized[0]]
  }
  if (normalized.length === 2) {
    return [normalized[0], normalized[1], normalized[0]]
  }
  return normalized
}
