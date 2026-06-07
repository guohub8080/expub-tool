import type { ReactNode } from "react"
import type { T_Direction8, I_RotationConfig, I_EntryScaleConfig, I_EntryOpacityConfig, I_EntrySkewConfig, I_EntryTranslateConfig, I_StayTranslateConfig, I_StayAnimConfig } from "@svg/types"
import type { I_TimelineKeyframe } from "@smil/timeline/types"

export type { I_RotationConfig, I_EntryScaleConfig, I_EntryOpacityConfig, I_EntrySkewConfig, I_EntryTranslateConfig, I_StayTranslateConfig } from "@svg/types"

/** stay 阶段动画配置（固定值或 timeline） */
export interface I_StayConfig {
  /** stay 期间的位移（固定位置 或 timeline 动画） */
  translate?: I_StayTranslateConfig
  /** stay 期间的旋转（固定角度 或 timeline 动画） */
  rotation?: I_StayAnimConfig
  /** stay 期间的缩放（固定值 或 timeline 动画） */
  scale?: I_StayAnimConfig
  /** stay 期间的透明度（固定值 或 timeline 动画） */
  opacity?: I_StayAnimConfig
  /** stay 期间的 skewX（固定角度 或 timeline 动画） */
  skewX?: I_StayAnimConfig
  /** stay 期间的 skewY（固定角度 或 timeline 动画） */
  skewY?: I_StayAnimConfig
}

/** 进入配置 */
export interface I_EntryConfig {
  /** 进入位移配置（简单模式用 direction，高级模式用 timeline） */
  translate?: I_EntryTranslateConfig
  /** 进入时的 skewX 变换配置，不传则进入无 skewX */
  skewX?: I_EntrySkewConfig
  /** 进入时的 skewY 变换配置，不传则进入无 skewY */
  skewY?: I_EntrySkewConfig
  /** 进入时的旋转配置，不传则进入无旋转 */
  rotation?: I_RotationConfig
  /** 进入时的缩放配置，不传则进入无缩放 */
  scale?: I_EntryScaleConfig
  /** 进入时的透明度配置，不传则进入无透明度动画 */
  opacity?: I_EntryOpacityConfig
}

/** 退出配置 */
export interface I_ExitConfig {
  /** 退出位移配置（简单模式用 direction，高级模式用 timeline） */
  translate?: I_EntryTranslateConfig
  /** 退出时的 skewX 变换配置，不传则退出无 skewX */
  skewX?: I_EntrySkewConfig
  /** 退出时的 skewY 变换配置，不传则退出无 skewY */
  skewY?: I_EntrySkewConfig
  /** 退出时的旋转配置，不传则退出无旋转 */
  rotation?: I_RotationConfig
  /** 退出时的缩放配置，不传则退出无缩放 */
  scale?: I_EntryScaleConfig
  /** 退出时的透明度配置，不传则退出无透明度动画 */
  opacity?: I_EntryOpacityConfig
}

/** hold 阶段动画配置（仅支持 timeline 写法，屏外等待期间精确控制属性归位） */
export interface I_HoldConfig {
  /** hold 期间的透明度动画，必须用 timeline 指定关键帧 */
  opacity?: { timeline: I_TimelineKeyframe<number>[] }
}

export interface I_AnyLoopDisplayChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一） */
  jsx?: ReactNode
  /** 进入配置 */
  entry?: I_EntryConfig
  /** 停留配置（固定值 或 timeline 动画） */
  stay?: I_StayConfig
  /** 退出配置 */
  exit?: I_ExitConfig
  /** hold 阶段配置（屏外等待期间，用于归位属性值） */
  hold?: I_HoldConfig
  /** 停留时长（秒），图片全屏静止的持续时间，默认 2 */
  stayDuration?: number
  /**
   * 切换动画时长（秒），默认 2
   * 注意：当前图的退出时长由【下一张图】的 switchDuration 决定，
   * 因为下一张图进入时会覆盖当前图的退出，两者共享同一段时间。
   */
  switchDuration?: number
}
