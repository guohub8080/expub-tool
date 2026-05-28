import { round } from 'lodash'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import isNil from 'lodash/isNil'
import type { I_TimelineKeyframe, I_TimelineResult, T_ValueSerializer } from './types'

/**
 * 通用时间线编译器
 *
 * 将关键帧数组编译为 SMIL 动画所需的 values / keyTimes / keySplines / totalDuration。
 * 与 SVG/React 完全解耦，纯函数，零副作用。
 *
 * SMIL 规范约束：
 * - values、keyTimes 点数必须相等（均为 keyframes.length + 1）
 * - keySplines 点数 = values 点数 - 1（= keyframes.length）
 * - keyTimes 必须从 0 到 1 单调递增
 *
 * 因此 initValue 必填——它是 values 的第一个点，缺少它会导致数组长度不匹配。
 */
export function compileTimeline<T>(
  keyframes: I_TimelineKeyframe<T>[],
  serializer: T_ValueSerializer<T>,
  initValue: T,
): I_TimelineResult {
  if (keyframes.length === 0) {
    throw new Error('`keyframes` must not be empty.')
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
  keyframes.forEach(k => valueList.push(serializer(k.to)))
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
  const keySplines = keyframes.map(k => k.keySpline ?? LINEAR_KEY_SPLINE).join(';')

  return { values, keyTimes, keySplines, totalDuration }
}
