import type { I_CoverFlowItemConfig, I_NormalizedItemConfig } from "../types";
import { DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from "../types";
import defaultTo from "lodash/defaultTo";
import isNil from "lodash/isNil";
import { isDefined } from "@utils/fn/isDefined";
import { getEaseBezier } from "@smil/bezier";

/** 默认缓动曲线：ease-in-out */
export const DEFAULT_KEY_SPLINES = getEaseBezier({ isIn: true, isOut: true });

/** 内部函数，填充单项配置的默认值并校验 */
const fillDefaults = (item: I_CoverFlowItemConfig): I_NormalizedItemConfig => {
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
 * CoverFlow 至少需要 3 张图才能同时显示左peek+中心+右peek：
 * - 1 张 → 复制到 3 张
 * - 2 张 → 复制第一张补成 3 张
 * - ≥3 张 → 直接使用
 */
export const normalizeItems = (items?: I_CoverFlowItemConfig[]): I_NormalizedItemConfig[] => {
    if (isNil(items) || items.length === 0) {
        throw new Error("`pics` must not be empty. CoverFlow requires at least 1 item.")
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
