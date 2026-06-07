import type { I_AbsRelKeyframe } from '@smil/timeline/types'
import type { T_NativeAnimateTransform } from '@smil/types'

export interface I_TranslateValue {
  x: number
  y: number
}

export interface I_TranslateConfig {
  initValue?: Partial<I_TranslateValue>
  timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[]
  begin?: string
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced'
  isFreeze?: boolean
  loopCount?: number
  isAdditive?: boolean
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimateTransform
}
