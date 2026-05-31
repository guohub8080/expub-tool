import type { I_CoverFlowItemConfig, I_NormalizedItemConfig } from "../types";
import { DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from "../types";
import defaultTo from "lodash/defaultTo";
import { getEaseBezier } from "@smil/bezier";

/** 默认缓动曲线：ease-in-out */
export const DEFAULT_KEY_SPLINES = getEaseBezier({ isIn: true, isOut: true });

/** 内部函数，填充单项配置的默认值并校验 */
const fillDefaults = (item: I_CoverFlowItemConfig): I_NormalizedItemConfig => {
    const useItem = !!item.item

    if (!item.url && !item.item) {
        throw new Error("Each item must have either `url` or `item`. `url` and `item` cannot both be empty.")
    }

    if (item.url && item.item) {
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
 * 1. 未提供 / 空数组 → 抛出错误
 * 2. 仅 1 项 → 自动复制一份
 * 3. 多项 → 逐个填充默认值
 */
export const normalizeItems = (items?: I_CoverFlowItemConfig[]): I_NormalizedItemConfig[] => {
    if (!items || items.length === 0) {
        throw new Error("`pics` must not be empty. CoverFlow requires at least 1 item.")
    }

    if (items.length === 1) {
        const normalized = fillDefaults(items[0]);
        return [normalized, normalized];
    }

    return items.map(fillDefaults);
};
