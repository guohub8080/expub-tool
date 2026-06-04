import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { buildTimeline } from '@smil/timeline/compile'
import type { I_RotateConfig } from './types'

export type { I_RotateConfig } from './types'


export function transformRotate(config: I_RotateConfig) {
  const {
    initValue = 0,
    timeline,
    origin,
    begin,
    calcMode,
    isFreeze = false,
    loopCount = 1,
    isAdditive = true,
    isRelativeRotate = false,
    restart,
  } = config

  const [cx, cy] = origin

  // 1. 构建角度序列
  const angles: number[] = [initValue]
  let lastAngle = initValue

  for (const seg of timeline) {
    let nextAngle: number

    if (isRelativeRotate) {
      nextAngle = lastAngle + defaultTo(seg.to, 0)
    } else {
      nextAngle = defaultTo(seg.to, lastAngle)
    }

    angles.push(nextAngle)
    lastAngle = nextAngle
  }

  // 2. 编译时间线
  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    to: angles[i + 1],
    keySplines: seg.keySplines ?? LINEAR_KEY_SPLINE,
  }))

  const result = buildTimeline({ initValue, timeline: fullKeyframes })

  // 3. 组装 values："angle cx cy" 格式
  const angleValues = result.values.split(';')
  const values = angleValues.map(a => `${a} ${cx} ${cy}`).join(';')

  // 4. 公共属性
  const hasKeySplines = timeline.some(seg => seg.keySplines)
  const finalCalcMode = calcMode ?? (hasKeySplines ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animateTransform
      attributeName="transform"
      type="rotate"
      values={values}
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
