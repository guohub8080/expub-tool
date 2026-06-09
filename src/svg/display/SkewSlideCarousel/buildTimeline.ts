import defaultTo from 'lodash/defaultTo'
import { buildCyclicTimelines } from '@utils/svg/buildCyclicTimelines'
import type { I_ItemTimeline, T_SwitchPhase } from '@utils/svg/buildCyclicTimelines'
import type { I_TimelineKeyframe } from '@smil/timeline/types'
import { DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION, DEFAULT_EASE } from './utils'

export type { I_ItemTimeline }

/**
 * 构建 SkewSlideCarousel 的循环时间轴。
 * 包装 buildCyclicTimelines，使用组件默认值。
 */
export const buildSkewTimelines = (childItems: Array<{ switchDuration?: number; stayDuration?: number }>) => {
  const items: T_SwitchPhase[] = childItems.map(item => ({
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
  }))
  return buildCyclicTimelines(items)
}

/**
 * 构建四阶段（entry → stay → exit → hold）的 timeline segments。
 * 用于 translate、skew、opacity 三条动画轨道。
 */
export const buildPhaseSegments = <T>(params: {
  entryDur: number
  stayDur: number
  exitDur: number
  holdDur: number
  entryTarget: T
  stayTarget: T
  exitTarget: T
  holdTarget: T
  ease?: string
}): I_TimelineKeyframe<T>[] => {
  const { entryDur, stayDur, exitDur, holdDur, entryTarget, stayTarget, exitTarget, holdTarget, ease = DEFAULT_EASE } = params
  const segs: I_TimelineKeyframe<T>[] = []
  if (entryDur > 0) segs.push({ durationSeconds: entryDur, toAbs: entryTarget, keySplines: ease })
  if (stayDur > 0) segs.push({ durationSeconds: stayDur, toAbs: stayTarget, keySplines: ease })
  if (exitDur > 0) segs.push({ durationSeconds: exitDur, toAbs: exitTarget, keySplines: ease })
  if (holdDur > 0) segs.push({ durationSeconds: holdDur, toAbs: holdTarget, keySplines: ease })
  return segs
}
