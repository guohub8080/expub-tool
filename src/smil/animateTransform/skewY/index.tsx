import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { buildTimeline } from '@smil/timeline/compile'
import type { I_SkewYConfig } from './types'

export type { I_SkewYConfig } from './types'


export function transformSkewY(config: I_SkewYConfig) {
  const {
    initValue = 0,
    timeline,
    begin,
    calcMode,
    isFreeze = false,
    loopCount = 1,
    isAdditive = true,
    restart,
  } = config

  const angles: number[] = [initValue]
  let lastAngle = initValue
  for (const seg of timeline) {
    const nextAngle = defaultTo(seg.toAbs, lastAngle)
    angles.push(nextAngle)
    lastAngle = nextAngle
  }

  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    toAbs: angles[i + 1],
    keySplines: seg.keySplines ?? LINEAR_KEY_SPLINE,
  }))

  const result = buildTimeline({ initValue, timeline: fullKeyframes })

  const hasKeySplines = timeline.some(seg => seg.keySplines)
  const finalCalcMode = calcMode ?? (hasKeySplines ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animateTransform
      attributeName="transform"
      type="skewY"
      values={result.values}
      keyTimes={result.keyTimes}
      keySplines={finalCalcMode === 'spline' ? result.keySplines : undefined}
      dur={`${result.totalDuration}s`}
      calcMode={finalCalcMode}
      repeatCount={repeatCountValue}
      begin={begin}
      fill={isFreeze ? 'freeze' : 'remove'}
      additive={isAdditive ? 'sum' : undefined}
      {...(!isNil(restart) && { restart })}
      {...config.native}
    />
  )
}
