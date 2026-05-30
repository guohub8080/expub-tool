import { animateOpacity } from '@smil/animate/opacity'

export interface I_HardBlinkConfig {
  onDurationSeconds?: number
  offDurationSeconds?: number
  begin?: string
  loopCount?: number
}

export function animateHardBlink(config: I_HardBlinkConfig = {}) {
  const {
    onDurationSeconds = 0.8,
    offDurationSeconds = 0.3,
    begin,
    loopCount = 0,
  } = config

  return animateOpacity({
    initValue: 1,
    timeline: [
      { to: 1, durationSeconds: onDurationSeconds },
      { to: 0, durationSeconds: offDurationSeconds },
      { to: 1, durationSeconds: 0.001 },
    ],
    begin,
    loopCount,
    calcMode: 'discrete',
  })
}
