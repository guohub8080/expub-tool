/**
 * 角度驱动的 slot 位置计算
 *
 * Stack/slot 模型：每个 slot 在周期里依次经过 back → mid → center → exit。
 * 位置沿 `angle` 方向排列：
 * - back:  最远离中心的一侧
 * - mid:   back 与 center 之间
 * - center: 中心
 * - exit:  中心沿 angle 方向飞出的一侧
 *
 * itemGap 控制相邻 slot 之间的间距。
 */

import type { I_TranslateValue } from "@smil/animateTransform/translate"

/** 计算沿 angle 方向的单位向量 */
export const getAngleUnitVector = (angle: number): { x: number; y: number } => {
  const rad = angle * Math.PI / 180
  return { x: Math.cos(rad), y: Math.sin(rad) }
}

/**
 * 根据 angle 与 itemGap 计算 4 个 slot 位置
 *
 * 约定：
 * - angle = 0°  时，进入方向为左侧（-x），退出方向为右侧（+x）
 * - angle = 90° 时，进入方向为上侧（-y），退出方向为下侧（+y）
 * - isReversed 时整体加 180°
 *
 * 位置索引 0=back, 1=mid, 2=center, 3=exit
 */
export const calcSlotPositions = (
  angle: number,
  itemW: number,
  itemH: number,
  gap: number,
): Partial<I_TranslateValue>[] => {
  const unit = getAngleUnitVector(angle)

  // 相邻 slot 的间距（不含自身尺寸）
  const stepX = itemW + gap
  const stepY = itemH + gap

  // center = (0, 0)
  // back:  反向两个 slot 距离
  // mid:   反向一个 slot 距离
  // exit:  正向一个 slot 距离（飞出）
  return [
    { x: -2 * stepX * unit.x, y: -2 * stepY * unit.y }, // back
    { x: -1 * stepX * unit.x, y: -1 * stepY * unit.y }, // mid
    { x: 0, y: 0 },                                      // center
    { x: 1 * stepX * unit.x, y: 1 * stepY * unit.y },   // exit（占位，会被 offscreen exit 覆盖）
  ]
}

/**
 * 计算 exit 位置的屏外偏移
 *
 * exit 位置 = center 沿 angle 方向再向外移动，确保 item 完全离开 viewBox。
 */
export const calcExitOffset = (
  angle: number,
  canvasW: number,
  canvasH: number,
  itemW: number,
  itemH: number,
  gap: number,
): Partial<I_TranslateValue> => {
  const unit = getAngleUnitVector(angle)
  const exitStepX = (canvasW + itemW) / 2 - gap
  const exitStepY = (canvasH + itemH) / 2 - gap
  return {
    x: exitStepX * unit.x,
    y: exitStepY * unit.y,
  }
}

/** 构建单个 slot 的主轨道 translate timeline */
export const buildSlotTranslateTimeline = ({
  positions,
  exitOffset,
  keySplines,
}: {
  positions: Partial<I_TranslateValue>[]
  exitOffset: Partial<I_TranslateValue>
  keySplines: string
}): { initValue: Partial<I_TranslateValue>; timeline: { toAbs: Partial<I_TranslateValue>; durationSeconds: number; keySplines: string }[] } => {
  return {
    initValue: positions[0],
    timeline: [
      { toAbs: positions[1], durationSeconds: 1, keySplines }, // back → mid
      { toAbs: positions[2], durationSeconds: 1, keySplines }, // mid → center
      { toAbs: exitOffset, durationSeconds: 1, keySplines },   // center → exit (offscreen)
    ],
  }
}

/** 简单数据容器，用于 buildCyclicTimelines */
export interface I_SwitchPhase {
  switchDuration: number
  stayDuration: number
}

/** 将 I_NormalizedCarouselItem[] 转为 buildCyclicTimelines 所需的 I_SwitchPhase[] */
export const toSwitchPhases = (items: { switchDuration: number; stayDuration: number }[]): I_SwitchPhase[] => {
  return items.map(item => ({
    switchDuration: item.switchDuration,
    stayDuration: item.stayDuration,
  }))
}
