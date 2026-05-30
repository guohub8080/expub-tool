import defaultTo from 'lodash/defaultTo'
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

export function animateSoftBlink(config?: I_SoftBlinkConfig) {
  const maxOpacity = defaultTo(config?.maxOpacity, 1)
  const minOpacity = defaultTo(config?.minOpacity, 0.2)
  const onceBlinkDurationSeconds = defaultTo(config?.onceBlinkDurationSeconds, 1.2)
  const keySpline = defaultTo(config?.keySpline, '0.45 0 0.55 1')
  const loopCount = defaultTo(config?.loopCount, 0)

  const half = onceBlinkDurationSeconds / 2

  return animateOpacity({
    initValue: maxOpacity,
    timeline: [
      { to: minOpacity, durationSeconds: half, keySpline },
      { to: maxOpacity, durationSeconds: half, keySpline },
    ],
    begin: config?.begin,
    loopCount,
    restart: config?.restart,
  })
}
