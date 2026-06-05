import type { ReactNode } from "react"
import type { T_Direction8, I_SkewConfig, I_RotationConfig, I_EntryScaleConfig, I_EntryOpacityConfig } from "@svg/types"

export type { I_SkewConfig, I_RotationConfig, I_EntryScaleConfig, I_EntryOpacityConfig } from "@svg/types"

/** 进入配置 */
export interface I_EntryConfig {
  /** 进入方向，默认 T（从上方进入） */
  direction?: T_Direction8
  /** 进入时的 skew 变换配置，不传则进入无 skew */
  skew?: I_SkewConfig
  /** 进入时的旋转配置，不传则进入无旋转 */
  rotation?: I_RotationConfig
  /** 进入时的缩放配置，不传则进入无缩放 */
  scale?: I_EntryScaleConfig
  /** 进入时的透明度配置，不传则进入无透明度动画 */
  opacity?: I_EntryOpacityConfig
}

/** 退出配置 */
export interface I_ExitConfig {
  /** 退出方向，默认与进入方向相反（T↔B，L↔R，TL↔BR，TR↔BL） */
  direction?: T_Direction8
  /** 退出时的 skew 变换配置，不传则退出无 skew */
  skew?: I_SkewConfig
  /** 退出时的旋转配置，不传则退出无旋转 */
  rotation?: I_RotationConfig
  /** 退出时的缩放配置，不传则退出无缩放 */
  scale?: I_EntryScaleConfig
  /** 退出时的透明度配置，不传则退出无透明度动画 */
  opacity?: I_EntryOpacityConfig
}

export interface I_AnyLoopDisplayChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一） */
  jsx?: ReactNode
  /** 进入配置 */
  entry?: I_EntryConfig
  /** 退出配置 */
  exit?: I_ExitConfig
  /** 停留时长（秒），图片全屏静止的持续时间，默认 2 */
  stayDuration?: number
  /**
   * 切换动画时长（秒），默认 2
   * 注意：当前图的退出时长由【下一张图】的 switchDuration 决定，
   * 因为下一张图进入时会覆盖当前图的退出，两者共享同一段时间。
   */
  switchDuration?: number
  /**
   * 自定义 offscreen 距离（像素倍数）。
   * 不传则自动计算（基于画布尺寸 + scale 缓冲）。
   * 传值后直接作为 getOffscreenTranslate 的 bufferMultiplier。
   */
  distance?: number
}
