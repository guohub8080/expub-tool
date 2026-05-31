import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { compileTimeline } from '@smil/timeline/compile'
import type { I_SkewXConfig } from './types'

export type { I_SkewXConfig } from './types'


export function transformSkewX(config: I_SkewXConfig) {
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

  // 1. 构建角度序列（to 省略时保持上一帧）
  const angles: number[] = [initValue]
  let lastAngle = initValue
  for (const seg of timeline) {
    const nextAngle = defaultTo(seg.to, lastAngle)
    angles.push(nextAngle)
    lastAngle = nextAngle
  }

  // 2. 编译时间线
  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    to: angles[i + 1],
    keySplines: seg.keySplines ?? LINEAR_KEY_SPLINE,
  }))

  const result = compileTimeline(fullKeyframes, String, initValue)

  // 3. 公共属性
  const hasKeySplines = timeline.some(seg => seg.keySplines)
  const finalCalcMode = calcMode ?? (hasKeySplines ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <animateTransform
      attributeName="transform"
      type="skewX"
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
