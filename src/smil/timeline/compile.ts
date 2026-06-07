import { round } from 'lodash'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import isNil from 'lodash/isNil'
import type { I_TimelineKeyframe, I_TimelineResult, T_ValueSerializer } from './types'

export interface I_BuildTimelineConfig<T> {
  /** 初始值（values 的第一个点，必填） */
  initValue: T
  /** 时间线段数组（至少 1 段） */
  timeline: I_TimelineKeyframe<T>[]
  /** 值序列化函数，默认 String。translate 等复杂类型需自定义 */
  serializer?: T_ValueSerializer<T>
}

/**
 * buildTimeline — 时间轴编译器
 *
 * 将语义化的时间线段编译为 SMIL 动画所需的 values / keyTimes / keySplines / totalDuration。
 * 与 SVG/React 完全解耦，纯函数，零副作用。
 *
 * SMIL 规范约束：
 * - values、keyTimes 点数必须相等（均为 timeline.length + 1）
 * - keySplines 点数 = values 点数 - 1（= timeline.length）
 * - keyTimes 必须从 0 到 1 单调递增
 *
 * 因此 initValue 必填——它是 values 的第一个点，缺少它会导致数组长度不匹配。
 */
export function buildTimeline<T>(config: I_BuildTimelineConfig<T>): I_TimelineResult {
  const { initValue, timeline, serializer = String as unknown as T_ValueSerializer<T> } = config
  const keyframes = timeline

  if (keyframes.length === 0) {
    throw new Error('`timeline` must not be empty.')
  }

  if (isNil(initValue)) {
    throw new Error('`initValue` must not be null or undefined, SMIL requires values/keyTimes count to match.')
  }

  // 1. totalDuration
  const totalDuration = keyframes.reduce((sum, k) => sum + k.durationSeconds, 0)

  if (totalDuration <= 0) {
    throw new Error('`totalDuration` must be greater than 0.')
  }

  // 2. values（initValue 为第一个点，keyframes 依次追加，共 n+1 个点）
  const valueList: string[] = [serializer(initValue)]
  keyframes.forEach(k => valueList.push(serializer(k.toAbs)))
  const values = valueList.join(';')

  // 3. keyTimes（n+1 个点，强制最后一帧为 1 避免浮点精度问题）
  const keyTimesList: number[] = [0]
  let accumulated = 0
  keyframes.forEach((k, i) => {
    accumulated += k.durationSeconds
    const isLast = i === keyframes.length - 1
    keyTimesList.push(isLast ? 1 : round(accumulated / totalDuration, 6))
  })
  const keyTimes = keyTimesList.join(';')

  // 4. keySplines（n 个，= values 点数 - 1，未填默认线性）
  const keySplines = keyframes.map(k => k.keySplines ?? LINEAR_KEY_SPLINE).join(';')

  return { values, keyTimes, keySplines, totalDuration }
}
