import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { T_NativeAnimateTransform } from '@smil/types'

export interface I_ScaleConfig {
  initValue?: number
  timeline: I_TimelineKeyframe<number>[]
  origin: [number, number]
  begin?: string
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced'
  isFreeze?: boolean
  loopCount?: number
  isAdditive?: boolean
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimateTransform
}

export interface I_ScaleRawConfig {
  initValue?: number
  timeline: I_TimelineKeyframe<number>[]
  begin?: string
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced'
  isFreeze?: boolean
  loopCount?: number
  isAdditive?: boolean
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimateTransform
}
