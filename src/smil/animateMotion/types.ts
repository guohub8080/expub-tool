import type { T_NativeAnimateMotion } from '@smil/types'

export type T_PathMotionRotate = 'auto' | 'auto-reverse' | number

export interface I_PathMotionConfig {
  path: string
  durationSeconds?: number
  rotate?: T_PathMotionRotate
  begin?: string
  calcMode?: 'spline' | 'linear' | 'paced'
  keySplines?: string
  keyTimes?: string
  isFreeze?: boolean
  loopCount?: number
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimateMotion
}
