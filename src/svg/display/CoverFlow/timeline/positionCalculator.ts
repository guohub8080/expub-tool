import type { I_Layout } from "../types";

/**
 * 计算布局
 *
 * viewBoxW = imageW + 2 * gap + 2 * peekPx
 *
 * ┌────┐  ┌──────────────┐  ┌────┐
 * │peek│  │              │  │peek│
 * │ Px │  │   center     │  │ Px │
 * │    │gap│  (imageW)    │gap│    │
 * └────┘  └──────────────┘  └────┘
 */
export const calculateLayout = (
    imageW: number,
    imageH: number,
    peekPx: number,
    gap: number,
    sideScale: number,
): I_Layout => {
    const viewBoxW = imageW + 2 * gap + 2 * peekPx
    const viewBoxH = imageH

    // 中心图 x（紧贴 left gap 右侧）
    const centerX = peekPx + gap

    // 右侧图：左边缘对齐 right gap 左侧
    const rightX = peekPx + gap + imageW + gap

    // 左侧图：右边缘对齐 left gap 左侧 → x = peekPx - imageW * sideScale
    const leftX = peekPx - imageW * sideScale

    // 侧图垂直居中
    const sideY = imageH * (1 - sideScale) / 2

    // scale 原点：图片中心
    const origin: [number, number] = [imageW / 2, imageH / 2]

    return { viewBoxW, viewBoxH, centerX, leftX, rightX, sideY, origin }
}

/** 获取"进入"的初始 x 坐标（右侧 peek 位置） */
export const getRightX = (layout: I_Layout): number => layout.rightX

/** 获取中心 x 坐标 */
export const getCenterX = (layout: I_Layout): number => layout.centerX

/** 获取"退出"的 x 坐标（左侧 peek 位置） */
export const getLeftX = (layout: I_Layout): number => layout.leftX
