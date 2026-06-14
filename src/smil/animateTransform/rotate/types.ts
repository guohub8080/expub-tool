import type { I_AbsRelKeyframe } from '@smil/timeline/types'
import type { T_NativeAnimateTransform } from '@smil/types'

export interface I_RotateConfig {
  initValue?: number
  timeline: I_AbsRelKeyframe<number>[]
  /** 旋转中心（常量），与 origins 二选一。二者都未提供时默认 [0, 0] */
  origin?: [number, number]
  /** 逐关键帧旋转中心：长度需为 timeline.length + 1（initValue 帧在前）。
   *  逐帧不同时用此（如 AnyCarousel 一个 slot 跨多角色、每角色不同 origin）。
   *  与 origin 二选一；同时给出时 origins 优先 */
  origins?: [number, number][]
  begin?: string
  calcMode?: 'spline' | 'linear' | 'discrete' | 'paced'
  isFreeze?: boolean
  loopCount?: number
  isAdditive?: boolean
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimateTransform
}
