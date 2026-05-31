import type { I_PicConfig, I_NormalizedPicConfig } from "../types";
import { DEFAULT_DIRECTION, DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from "../types";
import defaultTo from "lodash/defaultTo";
import { getEaseBezier } from "@smil/bezier";

/**
 * 配置标准化器
 *
 * 将用户传入的 I_PicConfig[] 转换为内部使用的 I_NormalizedPicConfig[]。
 * 所有可选字段在此填充默认值，后续计算逻辑无需再处理空值。
 */

/** 默认缓动曲线：ease-in-out */
export const DEFAULT_KEY_SPLINES = getEaseBezier({ isIn: true, isOut: true });

/** 内部函数，填充单张图片配置的默认值并校验 */
const fillDefaults = (pic: I_PicConfig): I_NormalizedPicConfig => {
    const useItem = !!pic.item

    if (!pic.url && !pic.item) {
        throw new Error("Each pic must have either `url` or `item`. `url` and `item` cannot both be empty.")
    }

    if (pic.url && pic.item) {
        console.warn("`url` is ignored when `item` is also provided.")
    }

    return {
        url: pic.url,
        item: pic.item,
        useItem,
        direction: defaultTo(pic.direction, DEFAULT_DIRECTION),
        switchDuration: defaultTo(pic.switchDuration, DEFAULT_SWITCH_DURATION),
        stayDuration: defaultTo(pic.stayDuration, DEFAULT_STAY_DURATION),
        keySplines: defaultTo(pic.keySplines, DEFAULT_KEY_SPLINES)
    }
}

/**
 * 标准化图片数组
 *
 * 1. 未提供 / 空数组 → 抛出错误
 * 2. 仅 1 张图 → 自动复制一份（推入效果需要 ≥2 张）
 * 3. 多张图 → 逐个填充默认值
 */
export const normalizePics = (pics?: I_PicConfig[]): I_NormalizedPicConfig[] => {
    if (!pics || pics.length === 0) {
        throw new Error("`pics` must not be empty. AnyPush requires at least 1 image.")
    }

    if (pics.length === 1) {
        const normalized = fillDefaults(pics[0]);
        return [normalized, normalized];
    }

    return pics.map(fillDefaults);
};
