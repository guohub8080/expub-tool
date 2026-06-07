import defaultTo from 'lodash/defaultTo'
import { transformTranslate } from '@smil/animateTransform/translate'

export interface I_FloatConfig {
  floatRangeY?: number
  floatRangeX?: number
  duration?: number
  keySplines?: string
  begin?: string
  loopCount?: number
}

export function transformFloat(config?: I_FloatConfig) {
  const floatRangeY = defaultTo(config?.floatRangeY, 20)
  const floatRangeX = defaultTo(config?.floatRangeX, 0)
  const duration = defaultTo(config?.duration, 4)
  const keySplines = defaultTo(config?.keySplines, '0.24 0 0.24 1')
  const loopCount = defaultTo(config?.loopCount, 0)

  const half = duration / 2

  return transformTranslate({
    initValue: { x: floatRangeX, y: 0 },
    timeline: [
      { toAbs: { x: -floatRangeX, y: -floatRangeY }, durationSeconds: half, keySplines },
      { toAbs: { x: floatRangeX, y: 0 }, durationSeconds: half, keySplines },
    ],
    begin: config?.begin,
    loopCount,
    isAdditive: true,
  })
}
