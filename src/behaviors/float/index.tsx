import { transformTranslate } from '@smil/animateTransform/translate'

export interface I_FloatConfig {
  floatRangeY?: number
  floatRangeX?: number
  duration?: number
  keySpline?: string
  begin?: string
  loopCount?: number
}

export function transformFloat(config: I_FloatConfig = {}) {
  const {
    floatRangeY = 20,
    floatRangeX = 0,
    duration = 4,
    keySpline = '0.24 0 0.24 1',
    begin,
    loopCount = 0,
  } = config

  const half = duration / 2

  return transformTranslate({
    initValue: { x: floatRangeX, y: 0 },
    timeline: [
      { to: { x: -floatRangeX, y: -floatRangeY }, durationSeconds: half, keySpline },
      { to: { x: floatRangeX, y: 0 }, durationSeconds: half, keySpline },
    ],
    begin,
    loopCount,
    isAdditive: true,
    isRelativeMove: false,
  })
}
