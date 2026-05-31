import type { I_NormalizedItemConfig } from "../types";
import type { I_Layout } from "../types";
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import { getRightX, getCenterX, getLeftX, getOffScreenLeftX } from "./positionCalculator";

/** 总周期时长 = Σ(switch + stay) */
export const calculateTotalCycleDuration = (items: I_NormalizedItemConfig[]): number => {
    return items.reduce((total, item) => total + item.switchDuration + item.stayDuration, 0);
}

/** 延迟启动时间 */
export const calculateDelayTime = (index: number, items: I_NormalizedItemConfig[]): number => {
    if (index === 0) {
        return -items[0].switchDuration;
    }

    let delay = items[0].stayDuration;
    for (let i = 1; i < index; i++) {
        delay += items[i].switchDuration + items[i].stayDuration;
    }
    return delay;
}

/** 保持时间 */
export const calculateHoldTime = (
    index: number,
    items: I_NormalizedItemConfig[],
    totalDuration: number
): number => {
    const current = items[index];
    const next = items[(index + 1) % items.length];
    return totalDuration - current.switchDuration - current.stayDuration - next.switchDuration;
}

/**
 * translate 时间线
 *
 * 单方向：右→中→左→继续向左滑出屏幕外
 * 循环重启时从屏幕外跳回右边（不可见）
 */
export const assembleTranslateTimeline = (
    index: number,
    items: I_NormalizedItemConfig[],
    layout: I_Layout,
    imageW: number,
    sideScale: number,
    totalCycleDuration: number
): I_TimelineKeyframe<Partial<I_TranslateValue>>[] => {
    const current = items[index];
    const next = items[(index + 1) % items.length];
    const offScreenLeft = getOffScreenLeftX(imageW, sideScale);

    return [
        // 1. 进入段：右 → 中心
        { to: { x: getCenterX(layout), y: 0 }, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        // 2. 停留段：中心不动
        { to: { x: getCenterX(layout), y: 0 }, durationSeconds: current.stayDuration, keySplines: current.keySplines },
        // 3. 退出段：中心 → 左 peek
        { to: { x: getLeftX(layout), y: layout.sideY }, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        // 4. 滑出段：左 peek → 继续向左滑出屏幕外
        { to: { x: offScreenLeft, y: layout.sideY }, durationSeconds: calculateHoldTime(index, items, totalCycleDuration), keySplines: current.keySplines },
    ];
}

/** scale 时间线：sideScale → 1.0 → 1.0 → sideScale → sideScale */
export const assembleScaleTimeline = (
    index: number,
    items: I_NormalizedItemConfig[],
    sideScale: number,
    totalCycleDuration: number
): I_TimelineKeyframe<number>[] => {
    const current = items[index];
    const next = items[(index + 1) % items.length];

    return [
        { to: 1, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        { to: 1, durationSeconds: current.stayDuration, keySplines: current.keySplines },
        { to: sideScale, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        { to: sideScale, durationSeconds: calculateHoldTime(index, items, totalCycleDuration), keySplines: current.keySplines },
    ];
}
