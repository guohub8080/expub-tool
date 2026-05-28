import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { compileTimeline } from '@smil/timeline/compile'
import type { I_PathStrokeConfig } from './types'

export function animatePathStroke(config: I_PathStrokeConfig) {
  const {
    pathLength,
    initValue,
    timeline,
    begin,
    calcMode,
    isFreeze = true,
    loopCount = 1,
    restart,
  } = config

  const initialOffset = defaultTo(initValue, pathLength)

  // 1. 构建偏移量序列
  const offsets: number[] = [initialOffset]
  let last = initialOffset
  for (const seg of timeline) {
    const next = defaultTo(seg.to, last)
    offsets.push(next)
    last = next
  }

  // 2. 编译时间线
  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    to: offsets[i + 1],
    keySpline: seg.keySpline ?? LINEAR_KEY_SPLINE,
  }))

  const result = compileTimeline(fullKeyframes, String, initialOffset)

  // 3. 公共属性
  const hasKeySpline = timeline.some(seg => seg.keySpline)
  const finalCalcMode = calcMode ?? (hasKeySpline ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animate
      attributeType="CSS"
      attributeName="stroke-dashoffset"
      values={result.values}
      keyTimes={result.keyTimes}
      keySplines={finalCalcMode === 'spline' ? result.keySplines : undefined}
      dur={`${result.totalDuration}s`}
      calcMode={finalCalcMode}
      repeatCount={repeatCountValue}
      begin={begin}
      fill={isFreeze ? 'freeze' : 'remove'}
      {...(!isNil(restart) && { restart })}
      {...config.native}
    />
  )
}
