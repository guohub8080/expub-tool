import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { compileTimeline } from '@smil/timeline/compile'
import type { I_OpacityConfig } from './types'


export function animateOpacity(config: I_OpacityConfig) {
  const {
    initValue = 1,
    timeline,
    begin,
    calcMode,
    isFreeze = false,
    loopCount = 1,
    restart,
  } = config

  const values: number[] = [initValue]
  let last = initValue
  for (const seg of timeline) {
    const next = defaultTo(seg.to, last)
    values.push(next)
    last = next
  }

  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    to: values[i + 1],
    keySpline: seg.keySpline ?? LINEAR_KEY_SPLINE,
  }))

  const result = compileTimeline(fullKeyframes, String, initValue)

  const hasKeySpline = timeline.some(seg => seg.keySpline)
  const finalCalcMode = calcMode ?? (hasKeySpline ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animate
      attributeName="opacity"
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
