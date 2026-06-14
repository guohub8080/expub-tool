import type {
  I_AnyCarouselItemConfig,
  I_NormalizedItemConfig,
  I_ChildTransform,
  I_NormalizedChildTransform,
  I_PivotPoint,
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

/** 将九宫格/自定义 pivot 解析为相对内容中心的 {x,y} */
const resolvePivot = (
  pivot: I_ChildTransform['scalePivot'],
  contentWidth: number,
  contentHeight: number,
): I_PivotPoint => {
  const [x, y] = getRotationPivot({
    pivot: defaultTo(pivot, PIVOT.Center),
    contentWidth,
    contentHeight,
  })
  return { x, y }
}

/**
 * 标准化角色变换配置 — 填充 5 通道默认值，并把 4 个 pivot 解析为相对内容中心的 {x,y}
 *
 * contentWidth/contentHeight = childCanvas 尺寸，pivot 以此为基准。
 */
export const normalizeChildConfig = (
  cfg: I_ChildTransform | undefined,
  contentWidth: number,
  contentHeight: number,
): I_NormalizedChildTransform => ({
  scale: defaultTo(cfg?.scale, 1),
  rotate: defaultTo(cfg?.rotate, 0),
  skewX: defaultTo(cfg?.skewX, 0),
  skewY: defaultTo(cfg?.skewY, 0),
  opacity: defaultTo(cfg?.opacity, 1),
  scalePivot: resolvePivot(cfg?.scalePivot, contentWidth, contentHeight),
  rotatePivot: resolvePivot(cfg?.rotatePivot, contentWidth, contentHeight),
  skewXPivot: resolvePivot(cfg?.skewXPivot, contentWidth, contentHeight),
  skewYPivot: resolvePivot(cfg?.skewYPivot, contentWidth, contentHeight),
})
