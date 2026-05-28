import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { T_NativeAnimate } from '@smil/types'

export interface I_OpacityConfig {
  initValue?: number
  timeline: I_TimelineKeyframe<number>[]
  begin?: string
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced'
  isFreeze?: boolean
  loopCount?: number
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimate
}
