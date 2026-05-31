import type { I_NormalizedItemConfig } from "../types";
import type { I_Layout } from "../types";
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import { getRightX, getCenterX, getLeftX, getOffScreenRightX, getOffScreenLeftX } from "./positionCalculator";

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
 * translate 时间线（5 段）
 *
 * 1. 屏外右侧 → 右 peek（从不可见滑入）
 * 2. 右 peek → 中心（switch in）
 * 3. 中心 → 中心（stay）
 * 4. 中心 → 左 peek（switch out）
 * 5. 左 peek → 屏外左侧（滑出到不可见）
 *
 * 循环重启：屏外左侧 → 屏外右侧，都不可见，无缝衔接
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
    const offScreenRight = getOffScreenRightX(layout);
    const holdTime = calculateHoldTime(index, items, totalCycleDuration);

    return [
        // 1. 屏外右侧 → 右 peek
        { to: { x: getRightX(layout), y: layout.sideY }, durationSeconds: holdTime / 2, keySplines: current.keySplines },
        // 2. 右 peek → 中心
        { to: { x: getCenterX(layout), y: 0 }, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        // 3. 中心 → 中心（停留）
        { to: { x: getCenterX(layout), y: 0 }, durationSeconds: current.stayDuration, keySplines: current.keySplines },
        // 4. 中心 → 左 peek
        { to: { x: getLeftX(layout), y: layout.sideY }, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        // 5. 左 peek → 屏外左侧
        { to: { x: offScreenLeft, y: layout.sideY }, durationSeconds: holdTime / 2, keySplines: current.keySplines },
    ];
}

/** scale 时间线（5 段）：sideScale → sideScale → 1 → 1 → sideScale → sideScale */
export const assembleScaleTimeline = (
    index: number,
    items: I_NormalizedItemConfig[],
    sideScale: number,
    totalCycleDuration: number
): I_TimelineKeyframe<number>[] => {
    const current = items[index];
    const next = items[(index + 1) % items.length];
    const holdTime = calculateHoldTime(index, items, totalCycleDuration);

    return [
        // 1. 屏外滑入右 peek：保持 sideScale
        { to: sideScale, durationSeconds: holdTime / 2, keySplines: current.keySplines },
        // 2. 右 peek → 中心：放大到 1
        { to: 1, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        // 3. 中心停留：保持 1
        { to: 1, durationSeconds: current.stayDuration, keySplines: current.keySplines },
        // 4. 中心 → 左 peek：缩小到 sideScale
        { to: sideScale, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        // 5. 左 peek → 屏外左侧：保持 sideScale
        { to: sideScale, durationSeconds: holdTime / 2, keySplines: current.keySplines },
    ];
}
