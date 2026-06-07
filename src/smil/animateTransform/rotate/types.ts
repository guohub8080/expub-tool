import type { I_AbsRelKeyframe } from '@smil/timeline/types'
import type { T_NativeAnimateTransform } from '@smil/types'

export interface I_RotateConfig {
  initValue?: number
  timeline: I_AbsRelKeyframe<number>[]
  origin: [number, number]
  begin?: string
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced'
  isFreeze?: boolean
  loopCount?: number
  isAdditive?: boolean
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimateTransform
}
