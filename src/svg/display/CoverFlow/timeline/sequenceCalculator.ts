import type { I_NormalizedItemConfig } from "../types";
import type { I_Layout } from "../types";
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import { getRightX, getCenterX, getLeftX } from "./positionCalculator";

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
 * 为第 index 项组装 translate 时间线
 *
 * 4 段：进入(右→中) → 停留(中) → 退出(中→左) → 保持(左→右)
 */
export const assembleTranslateTimeline = (
    index: number,
    items: I_NormalizedItemConfig[],
    layout: I_Layout,
    totalCycleDuration: number
): I_TimelineKeyframe<Partial<I_TranslateValue>>[] => {
    const current = items[index];
    const next = items[(index + 1) % items.length];
    const centerX = getCenterX(layout);
    const leftX = getLeftX(layout);
    const rightX = getRightX(layout);

    return [
        // 1. 进入段：右 → 中心
        { to: { x: centerX, y: layout.sideY }, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        // 2. 停留段：中心不动
        { to: { x: centerX, y: layout.sideY }, durationSeconds: current.stayDuration, keySplines: current.keySplines },
        // 3. 退出段：中心 → 左
        { to: { x: leftX, y: layout.sideY }, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        // 4. 保持段：左 → 右（等待下一轮）
        { to: { x: rightX, y: layout.sideY }, durationSeconds: calculateHoldTime(index, items, totalCycleDuration), keySplines: current.keySplines },
    ];
}

/**
 * 为第 index 项组装 scale 时间线
 *
 * 4 段：sideScale → 1.0 → 1.0 → sideScale → sideScale
 */
export const assembleScaleTimeline = (
    index: number,
    items: I_NormalizedItemConfig[],
    sideScale: number,
    totalCycleDuration: number
): I_TimelineKeyframe<number>[] => {
    const current = items[index];
    const next = items[(index + 1) % items.length];

    return [
        // 1. 进入段：sideScale → 1.0
        { to: 1, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        // 2. 停留段：保持 1.0
        { to: 1, durationSeconds: current.stayDuration, keySplines: current.keySplines },
        // 3. 退出段：1.0 → sideScale
        { to: sideScale, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        // 4. 保持段：保持 sideScale
        { to: sideScale, durationSeconds: calculateHoldTime(index, items, totalCycleDuration), keySplines: current.keySplines },
    ];
}
