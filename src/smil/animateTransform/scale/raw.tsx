import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { buildTimeline } from '@smil/timeline/compile'
import type { T_ValueSerializer } from '@smil/timeline/types'
import type { I_ScaleRawConfig } from './types'

export type { I_ScaleRawConfig } from './types'

const serializeScale: T_ValueSerializer<number> = (v) => `${v} ${v}`

export function transformScaleRaw(config: I_ScaleRawConfig) {
  const {
    initValue = 1,
    timeline,
    begin,
    calcMode,
    isFreeze = false,
    loopCount = 1,
    isAdditive = true,
    restart,
  } = config

  const scaleValues: number[] = [initValue]
  let lastScale = initValue
  for (const seg of timeline) {
    const nextScale = defaultTo(seg.toAbs, lastScale)
    scaleValues.push(nextScale)
    lastScale = nextScale
  }

  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    toAbs: scaleValues[i + 1],
    keySplines: defaultTo(seg.keySplines, LINEAR_KEY_SPLINE),
  }))

  const result = buildTimeline({ initValue, timeline: fullKeyframes, serializer: serializeScale })

  const hasKeySplines = timeline.some(seg => seg.keySplines)
  const finalCalcMode = defaultTo(calcMode, hasKeySplines ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animateTransform
      attributeName="transform"
      type="scale"
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
