import React from 'react'
import { LINEAR_KEY_SPLINE } from '@smil/constants'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { buildTimeline } from '@smil/timeline/compile'
import type { I_ScaleConfig } from './types'

export type { I_ScaleConfig, I_ScaleRawConfig } from './types'
export { transformScaleRaw } from './raw'


export function transformScale(config: I_ScaleConfig) {
  const {
    initValue = 1,
    timeline,
    origin,
    begin,
    calcMode,
    isFreeze = false,
    loopCount = 1,
    isAdditive = true,
    restart,
  } = config

  const [cx, cy] = origin

  // 1. 构建完整 scale 序列（to 省略时保持上一帧）
  const scaleValues: number[] = [initValue]
  let lastScale = initValue
  for (const seg of timeline) {
    const nextScale = defaultTo(seg.toAbs, lastScale)
    scaleValues.push(nextScale)
    lastScale = nextScale
  }

  // 2. 编译时间线
  const fullKeyframes = timeline.map((seg, i) => ({
    durationSeconds: seg.durationSeconds,
    toAbs: scaleValues[i + 1],
    keySplines: seg.keySplines ?? LINEAR_KEY_SPLINE,
  }))

  const result = buildTimeline({ initValue, timeline: fullKeyframes })

  // 3. 构建三个元素的 values
  const scaleValuesStr = scaleValues.map(s => `${s} ${s}`).join(';')
  const translateToValues = scaleValues.map(() => `${cx} ${cy}`).join(';')
  const translateBackValues = scaleValues.map(() => `${-cx} ${-cy}`).join(';')

  // 4. 公共属性
  const hasKeySplines = timeline.some(seg => seg.keySplines)
  const finalCalcMode = calcMode ?? (hasKeySplines ? 'spline' : 'linear')
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount
  const fillValue = isFreeze ? 'freeze' : 'remove'
  const additiveValue = isAdditive ? 'sum' : undefined

  // 5. 返回三元素 Fragment
  return (
    <>
      <animateTransform
        attributeName="transform"
        type="translate"
        values={translateToValues}
        keyTimes={result.keyTimes}
        dur={`${result.totalDuration}s`}
        calcMode="linear"
        repeatCount={repeatCountValue}
        begin={begin}
        fill={fillValue}
        additive={additiveValue}
        {...(!isNil(restart) && { restart })}
      />
      <animateTransform
        attributeName="transform"
        type="scale"
        values={scaleValuesStr}
        keyTimes={result.keyTimes}
        keySplines={finalCalcMode === 'spline' ? result.keySplines : undefined}
        dur={`${result.totalDuration}s`}
        calcMode={finalCalcMode}
        repeatCount={repeatCountValue}
        begin={begin}
        fill={fillValue}
        additive={additiveValue}
        {...(!isNil(restart) && { restart })}
        {...config.native}
      />
      <animateTransform
        attributeName="transform"
        type="translate"
        values={translateBackValues}
        keyTimes={result.keyTimes}
        dur={`${result.totalDuration}s`}
        calcMode="linear"
        repeatCount={repeatCountValue}
        begin={begin}
        fill={fillValue}
        additive={additiveValue}
        {...(!isNil(restart) && { restart })}
      />
    </>
  )
}
