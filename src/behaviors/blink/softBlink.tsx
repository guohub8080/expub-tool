import { animateOpacity } from '@smil/animate/opacity'

export interface I_SoftBlinkConfig {
  maxOpacity?: number
  minOpacity?: number
  onceBlinkDurationSeconds?: number
  keySpline?: string
  begin?: string
  loopCount?: number
  restart?: 'always' | 'whenNotActive' | 'never'
}

export function animateSoftBlink(config: I_SoftBlinkConfig = {}) {
  const {
    maxOpacity = 1,
    minOpacity = 0.2,
    onceBlinkDurationSeconds = 1.2,
    keySpline = '0.45 0 0.55 1',
    begin,
    loopCount = 0,
    restart,
  } = config

  const half = onceBlinkDurationSeconds / 2

  return animateOpacity({
    initValue: maxOpacity,
    timeline: [
      { to: minOpacity, durationSeconds: half, keySpline },
      { to: maxOpacity, durationSeconds: half, keySpline },
    ],
    begin,
    loopCount,
    restart,
  })
}
