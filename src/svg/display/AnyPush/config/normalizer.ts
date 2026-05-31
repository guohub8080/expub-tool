import type { I_PicConfig, I_NormalizedPicConfig } from "../types";
import defaultTo from "lodash/defaultTo";;
import { getEaseBezier } from "@smil/bezier/index";

/**
 * 配置标准化器
 *
 * 将用户传入的 I_PicConfig[] 转换为内部使用的 I_NormalizedPicConfig[]。
 * 所有可选字段在此填充默认值，后续计算逻辑无需再处理空值。
 */

/** 默认切换时长：0.5 秒 */
export const DEFAULT_SWITCH_DURATION = 0.5;
/** 默认停留时长：0.5 秒 */
export const DEFAULT_STAY_DURATION = 0.5;
/** 默认方向：从右侧滑入 */
export const DEFAULT_DIRECTION: I_NormalizedPicConfig["direction"] = "R";
/** 默认缓动曲线：ease-in-out */
export const DEFAULT_KEY_SPLINES = getEaseBezier({ isIn: true, isOut: true });

/** 将单个 I_PicConfig 填充默认值，产出 I_NormalizedPicConfig */
export const normalizePic = (pic: I_PicConfig): I_NormalizedPicConfig => ({
    url: pic.url,
    direction: defaultTo(pic.direction, DEFAULT_DIRECTION),
    switchDuration: defaultTo(pic.switchDuration, DEFAULT_SWITCH_DURATION),
    stayDuration: defaultTo(pic.stayDuration, DEFAULT_STAY_DURATION),
    keySplines: defaultTo(pic.keySplines, DEFAULT_KEY_SPLINES)
});

/**
 * 标准化整个图片数组
 *
 * 处理三种情况：
 * 1. 未提供 / 空数组 → 抛出错误（推入效果至少需要 1 张图）
 * 2. 仅 1 张图 → 自动复制一份（推入效果需要 ≥2 张）
 * 3. 多张图 → 逐个标准化
 */
export const normalizePics = (pics?: I_PicConfig[]): I_NormalizedPicConfig[] => {
    if (!pics || pics.length === 0) {
        throw new Error("`pics` must not be empty. AnyPush requires at least 1 image.")
    }

    if (pics.length === 1) {
        const normalized = normalizePic(pics[0]);
        return [normalized, normalized];
    }

    return pics.map(normalizePic);
};
