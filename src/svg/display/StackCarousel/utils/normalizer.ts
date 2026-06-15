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
    stayRotate: item.stayRotate,
  }
}

/**
 * 标准化配置数组
 *
 * 至少需要 minCount 张（= 可见叠层数 showStackNum）避免同图多层错乱，不足时按 ceil(minCount/N) 整组复制：
 * - 1 张、minCount=3 → 3 份（×3）
 * - 2 张、minCount=3 → 4 份（×2）
 * - N ≥ minCount → 直接使用
 */
export const normalizeItems = ({ items, defaultExitDirection, minCount = 3 }: {
  items?: I_StackCarouselItem[]
  defaultExitDirection: T_Direction8
  /** 至少需要的独立项数（= 可见叠层数 showStackNum），不足时整组复制补齐 */
  minCount?: number
}): I_NormalizedStackItem[] => {
  if (isNil(items) || items.length === 0) {
    throw new Error("`childItems` must not be empty. StackCarousel requires at least 1 item.")
  }
  const normalized = items.map(item => fillDefaults(item, defaultExitDirection))
  const N = normalized.length
  if (N >= minCount) return normalized

  // 不足 minCount 张：按 ceil(minCount/N) 整组复制，确保 N ≥ minCount
  const copies = Math.ceil(minCount / N)
  const result: I_NormalizedStackItem[] = []
  for (let c = 0; c < copies; c++) result.push(...normalized)
  return result
}
