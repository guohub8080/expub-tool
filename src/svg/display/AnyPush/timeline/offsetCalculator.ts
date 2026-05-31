import type { T_Direction4, I_Point } from "../types";

/**
 * 方向位移计算器
 *
 * 根据滑入/滑出方向和 viewBox 尺寸，计算 foreignObject 需要的位移坐标。
 * 所有坐标以 viewBox 左上角为原点。
 *
 * 坐标系：
 *   → x 正方向（右）
 *   ↓ y 正方向（下）
 *
 *   "R"（从右侧进入）= foreignObject 初始在左边界外 (x = -viewBoxW)
 *   "L"（从左侧进入）= foreignObject 初始在右边界外 (x = +viewBoxW)
 *   "B"（从下方进入）= foreignObject 初始在上边界外 (y = -viewBoxH)
 *   "T"（从上方进入）= foreignObject 初始在下边界外 (y = +viewBoxH)
 */

/**
 * 获取"进入"初始偏移 — foreignObject 的 x/y 初始坐标
 * 图片从这个位置开始，通过 translate 动画滑到中心 (0,0)
 */
export const getEntryOffset = (
    direction: T_Direction4,
    viewBoxW: number,
    viewBoxH: number
): I_Point => {
    switch (direction) {
        case "L": return { x: viewBoxW, y: 0 };
        case "R": return { x: -viewBoxW, y: 0 };
        case "T": return { x: 0, y: viewBoxH };
        case "B": return { x: 0, y: -viewBoxH };
    }
};

/**
 * 获取"退出"位移 — 相对坐标，用于 animateTransform 的 to 值
 *
 * 进入段需要从 entryOffset 移动到中心，等效于相对位移 = entryOffset 取反 = exitOffset。
 * 所以在 assembleTimeline 中，进入段的 to 值使用 exitOffset。
 */
export const getExitOffset = (
    direction: T_Direction4,
    viewBoxW: number,
    viewBoxH: number
): I_Point => {
    switch (direction) {
        case "L": return { x: -viewBoxW, y: 0 };
        case "R": return { x: viewBoxW, y: 0 };
        case "T": return { x: 0, y: -viewBoxH };
        case "B": return { x: 0, y: viewBoxH };
    }
};

/** 初始位置 = 进入偏移（供 foreignObject 的 x/y 属性使用） */
export const getInitialPosition = (
    direction: T_Direction4,
    viewBoxW: number,
    viewBoxH: number
): I_Point => {
    return getEntryOffset(direction, viewBoxW, viewBoxH);
};
