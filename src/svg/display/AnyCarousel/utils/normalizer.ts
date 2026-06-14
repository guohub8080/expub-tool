import type {
  I_AnyCarouselItemConfig,
  I_NormalizedItemConfig,
  I_ChildTransform,
  I_NormalizedChildTransform,
  I_PivotPoint,
  T_Channel,
} from "../types";
import { DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from "../types";
import { PIVOT } from "@svg/types";
import defaultTo from "lodash/defaultTo";
import isNil from "lodash/isNil";
import { isDefined } from "@utils/fn/isDefined";
import { getEaseBezier } from "@smil/bezier";
import { getRotationPivot } from "@utils/svg/getRotationPivot";

/** 默认缓动曲线：ease-in-out */
export const DEFAULT_KEY_SPLINES = getEaseBezier({ isIn: true, isOut: true });

/** 内部函数，填充单项配置的默认值并校验 */
const fillDefaults = (item: I_AnyCarouselItemConfig): I_NormalizedItemConfig => {
  const useItem = !!item.item

  if (isNil(item.url) && isNil(item.item)) {
    throw new Error("Each item must have either `url` or `item`. `url` and `item` cannot both be empty.")
  }

  if (isDefined(item.url) && isDefined(item.item)) {
    console.warn("`url` is ignored when `item` is also provided.")
  }

  return {
    url: item.url,
    item: item.item,
    useItem,
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    keySplines: defaultTo(item.keySplines, DEFAULT_KEY_SPLINES)
  }
}

/**
 * 标准化配置数组
 *
 * 至少需要 3 张图才能同时显示左peek+中心+右peek：
 * - 1 张 → 复制到 3 张
 * - 2 张 → 复制第一张补成 3 张
 * - ≥3 张 → 直接使用
 */
export const normalizeItems = (items?: I_AnyCarouselItemConfig[]): I_NormalizedItemConfig[] => {
  if (isNil(items) || items.length === 0) {
    throw new Error("`pics` must not be empty. Requires at least 1 item.")
  }

  const normalized = items.map(fillDefaults)

  if (normalized.length === 1) {
    return [normalized[0], normalized[0], normalized[0]]
  }

  if (normalized.length === 2) {
    return [normalized[0], normalized[1], normalized[0]]
  }

  return normalized
};

/** 解析后的单通道：值 + 支点（相对内容中心）+ 缓动 */
type T_ResolvedChannel = { value: number; pivot: I_PivotPoint; keySplines?: string }

const CENTER_PIVOT: I_PivotPoint = { x: 0, y: 0 }

/**
 * 把通道配置（数字简写 或 object）解析为 { value, pivot, keySplines }。
 *
 * - 数字：value = 该数，pivot = Center，无 keySplines。
 * - object：value = .value，pivot 由 childCanvasPivot 解析（缺省 Center），keySplines 透传。
 * - undefined：value = defaultValue（恒等），pivot = Center。
 */
const resolveChannel = (
  c: T_Channel | undefined,
  defaultValue: number,
  contentWidth: number,
  contentHeight: number,
): T_ResolvedChannel => {
  if (isNil(c)) return { value: defaultValue, pivot: CENTER_PIVOT }
  if (typeof c === 'number') return { value: c, pivot: CENTER_PIVOT }
  const [x, y] = getRotationPivot({
    pivot: defaultTo(c.childCanvasPivot, PIVOT.Center),
    contentWidth,
    contentHeight,
  })
  return { value: c.value, pivot: { x, y }, ...(isDefined(c.keySplines) ? { keySplines: c.keySplines } : {}) }
}

/**
 * 标准化角色变换配置 — 4 个通道拆出 value/pivot/keySplines，opacity 单独处理
 *
 * contentWidth/contentHeight = childCanvas 尺寸，pivot 以此为基准。
 */
export const normalizeChildConfig = (
  cfg: I_ChildTransform | undefined,
  contentWidth: number,
  contentHeight: number,
): I_NormalizedChildTransform => {
  const scale = resolveChannel(cfg?.scale, 1, contentWidth, contentHeight)
  const rotate = resolveChannel(cfg?.rotate, 0, contentWidth, contentHeight)
  const skewX = resolveChannel(cfg?.skewX, 0, contentWidth, contentHeight)
  const skewY = resolveChannel(cfg?.skewY, 0, contentWidth, contentHeight)
  return {
    scale: scale.value, scalePivot: scale.pivot, ...(scale.keySplines ? { scaleKeySplines: scale.keySplines } : {}),
    rotate: rotate.value, rotatePivot: rotate.pivot, ...(rotate.keySplines ? { rotateKeySplines: rotate.keySplines } : {}),
    skewX: skewX.value, skewXPivot: skewX.pivot, ...(skewX.keySplines ? { skewXKeySplines: skewX.keySplines } : {}),
    skewY: skewY.value, skewYPivot: skewY.pivot, ...(skewY.keySplines ? { skewYKeySplines: skewY.keySplines } : {}),
    opacity: defaultTo(cfg?.opacity, 1),
  }
}
