import { transformScale } from '@smil/animateTransform/scale'

export interface I_BreatheConfig {
  fromScale?: number
  toScale?: number
  onceBreatheDurationSeconds?: number
  origin: [number, number]
  keySplines?: string
  begin?: string
  loopCount?: number
}

export function transformBreathe(config: I_BreatheConfig) {
  const {
    fromScale = 1,
    toScale = 1.1,
    onceBreatheDurationSeconds = 2,
    origin,
    keySplines = '0.42 0 0.58 1',
    begin,
    loopCount = 0,
  } = config

  const half = onceBreatheDurationSeconds / 2

  return transformScale({
    initValue: fromScale,
    origin,
    timeline: [
      { to: toScale, durationSeconds: half, keySplines },
      { to: fromScale, durationSeconds: half, keySplines },
    ],
    begin,
    loopCount,
  })
}
