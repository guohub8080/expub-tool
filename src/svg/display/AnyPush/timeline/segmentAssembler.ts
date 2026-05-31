import type { T_Direction, I_TimelineSegment, I_NormalizedPicConfig } from "../types";
import { getEntryOffset, getExitOffset } from "./offsetCalculator";
import { calculateDelayTime, calculateHoldTime } from "./sequenceCalculator";

/**
 * 时间线段组装器
 *
 * 为每张图片生成 4 段动画时间线，描述一个完整周期内的运动轨迹：
 *
 * ┌──────────┬──────────┬──────────┬──────────┐
 * │  进入段   │  停留段   │  退出段   │  保持段   │
 * │ switchDur │ stayDur  │nextSwitch│ holdTime │
 * └──────────┴──────────┴──────────┴──────────┘
 *
 * 1. 进入段：从屏幕外滑入中心（to = exitOffset，抵消 foreignObject 的 entryOffset 初始位置）
 * 2. 停留段：在中心保持静止（to = {0,0}，相对位移为零）
 * 3. 退出段：从中心滑出到屏幕外（to = nextPic 的 exitOffset）
 * 4. 保持段：在屏幕外等待循环（to = {0,0}，duration = 剩余时间）
 *
 * 关键：所有 to 值都是相对位移（isRelativeMove=true），
 * foreignObject 的初始 x/y 已经设为 entryOffset。
 */

/**
 * 为第 index 张图片组装完整的时间线
 *
 * @param index - 当前图片索引
 * @param pics - 所有图片的标准化配置
 * @param viewBoxW - viewBox 宽度
 * @param viewBoxH - viewBox 高度
 * @param totalCycleDuration - 总周期时长（所有图的 switch+stay 之和）
 * @returns 4 段时间线（进入、停留、退出、保持）
 */
export const assembleTimeline = (
    index: number,
    pics: I_NormalizedPicConfig[],
    viewBoxW: number,
    viewBoxH: number,
    totalCycleDuration: number
): I_TimelineSegment[] => {
    const currentPic = pics[index];
    const nextPic = pics[(index + 1) % pics.length];

    // 1. 进入段：从 entryOffset 位置移到中心
    //    foreignObject 初始在 entryOffset，需要 translate 一个 exitOffset 才能回到原点
    const entrySegment: I_TimelineSegment = {
        to: getExitOffset(currentPic.direction, viewBoxW, viewBoxH),
        durationSeconds: currentPic.switchDuration,
        keySplines: currentPic.keySplines
    };

    // 2. 停留段：在中心不动
    const staySegment: I_TimelineSegment = {
        to: { x: 0, y: 0 },
        durationSeconds: currentPic.stayDuration,
        keySplines: currentPic.keySplines
    };

    // 3. 退出段：从中心滑到屏幕外（沿下一张图的退出方向）
    //    使用 nextPic 的方向，让当前图"让出"位置给下一张
    const exitSegment: I_TimelineSegment = {
        to: getExitOffset(nextPic.direction, viewBoxW, viewBoxH),
        durationSeconds: nextPic.switchDuration,
        keySplines: nextPic.keySplines
    };

    // 4. 保持段：在屏幕外等待，直到自己的下一轮进入
    const holdSegment: I_TimelineSegment = {
        to: { x: 0, y: 0 },
        durationSeconds: calculateHoldTime(index, pics, totalCycleDuration),
        keySplines: currentPic.keySplines
    };

    return [entrySegment, staySegment, exitSegment, holdSegment];
};

/** 获取所有图片的延迟时间 */
export const getAllDelayTimes = (pics: I_NormalizedPicConfig[]): number[] => {
    return pics.map((_, index) => calculateDelayTime(index, pics));
};

/** 获取所有图片的初始位置（foreignObject 的 x/y） */
export const getAllInitialPositions = (
    pics: I_NormalizedPicConfig[],
    viewBoxW: number,
    viewBoxH: number
): { x: number; y: number }[] => {
    return pics.map(pic => getEntryOffset(pic.direction, viewBoxW, viewBoxH));
};
