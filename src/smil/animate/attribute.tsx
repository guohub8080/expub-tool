import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import isNil from 'lodash/isNil'
import defaultTo from 'lodash/defaultTo'
import { compileTimeline } from '@smil/timeline/compile'
import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { T_NativeAnimate } from '@smil/types'

export interface I_AnimateAttributeConfig<T = number | string> {
  attributeName: string
  initValue: T
  timeline: I_TimelineKeyframe<T>[]
  begin?: string
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced'
  isFreeze?: boolean
  loopCount?: number
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimate
}

export function animateAttribute<T extends number | string>(
  config: I_AnimateAttributeConfig<T>,
) {
  const {
    attributeName,
    initValue,
    timeline,
    begin,
    calcMode,
    isFreeze = false,
    loopCount = 1,
    restart,
  } = config

  const values: T[] = [initValue]
  let last = initValue
  for (const seg of timeline) {
    const next = defaultTo(seg.to, last)
    values.push(next)
    last = next
  }

  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    to: values[i + 1],
    keySplines: seg.keySplines ?? LINEAR_KEY_SPLINE,
  }))

  const serializer = (v: T) => String(v)
  const result = compileTimeline(fullKeyframes, serializer, initValue)

  const hasKeySplines = timeline.some(seg => seg.keySplines)
  const finalCalcMode = calcMode ?? (hasKeySplines ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animate
      attributeName={attributeName}
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
