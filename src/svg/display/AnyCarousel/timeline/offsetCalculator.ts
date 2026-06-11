import defaultTo from "lodash/defaultTo"
import type { I_NormalizedCarouselItem } from "../types"
import type { T_SwitchPhase } from "@utils/svg/buildCyclicTimelines"

/**
 * 从角度和 itemCanvasSize 计算轨道步进向量
 *
 * angle 决定轨道方向：
 * - 0°   → 水平向右（等同于 axis: 'X'）
 * - 90°  → 垂直向下（等同于 axis: 'Y'）
 * - 45°  → 右上对角线
 * - 180° → 水平向左
 * - 270° → 垂直向上
 *
 * stepX = (itemW + gap) × cos(angle)
 * stepY = (itemH + gap) × sin(angle)
 */
export const calcStepVector = (
  angle: number,
  itemW: number,
  itemH: number,
  gap: number,
): { x: number; y: number } => {
  const rad = angle * Math.PI / 180
  return {
    x: (itemW + gap) * Math.cos(rad),
    y: (itemH + gap) * Math.sin(rad),
  }
}

/**
 * 计算中心 slot 的位置（viewBox 坐标系）
 *
 * 中心 slot 放在 viewBox 的中心区域，减去 itemCanvasSize 的一半。
 */
export const calcCenterPosition = (
  viewBoxW: number,
  viewBoxH: number,
  itemW: number,
  itemH: number,
): { x: number; y: number } => {
  return {
    x: (viewBoxW - itemW) / 2,
    y: (viewBoxH - itemH) / 2,
  }
}

/**
 * 生成 slot 布局：N+3 个 slot（含首尾副本，保证循环无缝）
 *
 * slot[1] 显示 items[0]（初始中心位置）
 * 首尾副本（slot[0] 和 slot[N+2]）不做动画
 *
 * 返回每个 slot 的 { itemIdx, x, y }
 */
export const buildSlotLayout = (params: {
  N: number
  center: { x: number; y: number }
  step: { x: number; y: number }
  isReversed: boolean
}): Array<{ itemIdx: number; x: number; y: number }> => {
  const { N, center, step, isReversed } = params
  const slots: Array<{ itemIdx: number; x: number; y: number }> = []

  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N // slot[1] = items[0]
    const offset = i - 1 // slot[1] 偏移 = 0（中心）
    const sign = isReversed ? -1 : 1
    slots.push({
      itemIdx,
      x: center.x - sign * offset * step.x,
      y: center.y - sign * offset * step.y,
    })
  }

  return slots
}

/**
 * 计算 scale 的 translate 补偿
 *
 * scale 以 origin 为中心缩放后，内容会偏移。
 * 补偿量确保内容在 slot 内保持居中。
 *
 * dx = -itemW × (scale - 1) / 2
 * dy = -itemH × (scale - 1) / 2
 */
export const calcScaleCompensation = (
  scale: number,
  itemW: number,
  itemH: number,
): { dx: number; dy: number } => {
  return {
    dx: -itemW * (scale - 1) / 2,
    dy: -itemH * (scale - 1) / 2,
  }
}

/**
 * 将 I_NormalizedCarouselItem[] 转为 buildCyclicTimelines 所需的 T_SwitchPhase[]
 */
export const toSwitchPhases = (items: I_NormalizedCarouselItem[]): T_SwitchPhase[] => {
  return items.map(item => ({
    switchDuration: item.switchDuration,
    stayDuration: item.stayDuration,
  }))
}
