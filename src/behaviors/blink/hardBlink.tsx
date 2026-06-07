import defaultTo from 'lodash/defaultTo'
import { animateOpacity } from '@smil/animate/opacity'

export interface I_HardBlinkConfig {
  onDurationSeconds?: number
  offDurationSeconds?: number
  begin?: string
  loopCount?: number
}

export function animateHardBlink(config?: I_HardBlinkConfig) {
  const onDurationSeconds = defaultTo(config?.onDurationSeconds, 0.8)
  const offDurationSeconds = defaultTo(config?.offDurationSeconds, 0.3)
  const loopCount = defaultTo(config?.loopCount, 0)

  return animateOpacity({
    initValue: 1,
    timeline: [
      { toAbs: 0, durationSeconds: offDurationSeconds },
      { toAbs: 1, durationSeconds: onDurationSeconds },
    ],
    begin: config?.begin,
    loopCount,
    calcMode: 'discrete',
  })
}
