import type { I_Layout } from "../types";

/**
 * 计算布局
 *
 * viewBoxW = imageW + 2 * gap + 2 * peekPx
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

  const centerX = peekPx + gap
  const rightX = peekPx + gap + imageW + gap
  const leftX = peekPx - imageW * sideScale

  const sideY = imageH * (1 - sideScale) / 2

  const pivot: [number, number] = [imageW / 2, imageH / 2]

  return { viewBoxW, viewBoxH, centerX, leftX, rightX, sideY, pivot }
}

/** 右侧 peek 位置 */
export const getRightX = (layout: I_Layout): number => layout.rightX

/** 中心位置 */
export const getCenterX = (layout: I_Layout): number => layout.centerX

/** 左侧 peek 位置 */
export const getLeftX = (layout: I_Layout): number => layout.leftX

/** 屏幕外右侧（第 1 段：从屏外滑入右 peek） */
export const getOffScreenRightX = (layout: I_Layout): number => layout.viewBoxW

/** 屏幕外左侧（第 5 段：从左 peek 滑出屏外） */
export const getOffScreenLeftX = (imageW: number, sideScale: number): number => {
  return -imageW * sideScale
}
