import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { buildTimeline } from '@smil/timeline/compile'
import type { T_ValueSerializer, I_AbsRelKeyframe } from '@smil/timeline/types'
import type { I_TranslateConfig, I_TranslateValue } from './types'

export type { I_TranslateConfig, I_TranslateValue } from './types'


const serializeTranslate: T_ValueSerializer<I_TranslateValue> = (v) => `${v.x} ${v.y}`

function buildCoordinates(
  initX: number,
  initY: number,
  timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[],
): I_TranslateValue[] {
  const coordinates: I_TranslateValue[] = [{ x: initX, y: initY }]
  let lastX = initX
  let lastY = initY

  for (const seg of timeline) {
    let newX: number
    let newY: number

    if (!isNil(seg.toAbs)) {
      newX = defaultTo(seg.toAbs.x, lastX)
      newY = defaultTo(seg.toAbs.y, lastY)
    } else {
      // toRel
      newX = lastX + defaultTo(seg.toRel!.x, 0)
      newY = lastY + defaultTo(seg.toRel!.y, 0)
    }

    coordinates.push({ x: newX, y: newY })
    lastX = newX
    lastY = newY
  }

  return coordinates
}

export function transformTranslate(config: I_TranslateConfig) {
  const {
    initValue,
    timeline,
    begin,
    calcMode,
    restart,
    native,
  } = config

  const initX = defaultTo(initValue?.x, 0)
  const initY = defaultTo(initValue?.y, 0)
  const isFreeze = defaultTo(config.isFreeze, false)
  const loopCount = defaultTo(config.loopCount, 1)
  const isAdditive = defaultTo(config.isAdditive, true)

  const coordinates = buildCoordinates(initX, initY, timeline)

  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    toAbs: coordinates[i + 1],
    keySplines: defaultTo(seg.keySplines, LINEAR_KEY_SPLINE),
  }))

  const result = buildTimeline({ initValue: { x: initX, y: initY }, timeline: fullKeyframes, serializer: serializeTranslate })

  const hasKeySplines = timeline.some(seg => seg.keySplines)
  const finalCalcMode = defaultTo(calcMode, hasKeySplines ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animateTransform
      attributeName="transform"
      type="translate"
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
