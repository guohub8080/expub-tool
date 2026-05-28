import React from 'react'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { compileTimeline } from '@smil/timeline/compile'
import type { T_ValueSerializer } from '@smil/timeline/types'
import type { I_TranslateConfig, I_TranslateValue } from './types'

const LINEAR_KEY_SPLINE = '0 0 1 1'

const serializeTranslate: T_ValueSerializer<I_TranslateValue> = (v) => `${v.x} ${v.y}`

function buildCoordinates(
  initX: number,
  initY: number,
  timeline: I_TranslateConfig['timeline'],
  isRelativeMove: boolean,
): I_TranslateValue[] {
  const coordinates: I_TranslateValue[] = [{ x: initX, y: initY }]
  let lastX = initX
  let lastY = initY

  for (const seg of timeline) {
    const to = seg.to
    let newX: number
    let newY: number

    if (isRelativeMove) {
      newX = lastX + defaultTo(to.x, 0)
      newY = lastY + defaultTo(to.y, 0)
    } else {
      newX = to.x ?? lastX
      newY = to.y ?? lastY
    }

    coordinates.push({ x: newX, y: newY })
    lastX = newX
    lastY = newY
  }

  return coordinates
}

function resolveBegin(begin?: string, delay?: number): string | undefined {
  if (!isNil(begin)) {
    return delay ? `${begin}+${delay}s` : begin
  }
  if (delay) return `${delay}s`
  return undefined
}

export function transformTranslate(config: I_TranslateConfig) {
  const {
    initValue = {},
    timeline,
    delay = 0,
    begin,
    calcMode,
    isFreeze = false,
    loopCount = 1,
    isAdditive = true,
    isRelativeMove = true,
    restart,
  } = config

  const initX = defaultTo(initValue.x, 0)
  const initY = defaultTo(initValue.y, 0)

  const coordinates = buildCoordinates(initX, initY, timeline, isRelativeMove)

  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    to: coordinates[i + 1],
    keySpline: seg.keySpline ?? LINEAR_KEY_SPLINE,
  }))

  const result = compileTimeline(fullKeyframes, serializeTranslate, { x: initX, y: initY })

  const hasKeySpline = timeline.some(seg => seg.keySpline)
  const finalCalcMode = calcMode ?? (hasKeySpline ? 'spline' : 'linear')

  const beginValue = resolveBegin(begin, delay)
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
      begin={beginValue}
      fill={isFreeze ? 'freeze' : 'remove'}
      additive={isAdditive ? 'sum' : undefined}
      {...(!isNil(restart) && { restart })}
      {...config.native}
    />
  )
}
