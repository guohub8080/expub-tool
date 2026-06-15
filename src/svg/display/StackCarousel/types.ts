import type { ReactNode } from "react"
import type { T_Direction8, T_Pivot, I_SkewConfig, I_RotationConfig } from "@svg/types"

/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 1
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 1

/** 可见叠层数下限（闭区间） */
export const MIN_SHOW_STACK_NUM = 2
/** 可见叠层数上限（闭区间） */
export const MAX_SHOW_STACK_NUM = 8
/** 默认可见叠层数 */
export const DEFAULT_SHOW_STACK_NUM = 3

/** tailChild 缺省时的水平偏移（px，向右），与历史 StackCarouselX 默认一致 */
export const DEFAULT_TAIL_OFFSET = 162
/** tailChild 缺省时的最远端缩放，与历史 back 层一致 */
export const DEFAULT_TAIL_SCALE = 0.78

/** 退场配置 */
export interface I_ExitConfig {
  /** 退场方向，默认沿「远离 tail」方向（叠层反向） */
  direction?: T_Direction8
  /** 退场移动距离，默认 √(w²+h²)×1.2（确保完全移出画布） */
  distance?: number
  /** 退场斜切，不传则退出无斜切 */
  skew?: I_SkewConfig
  /** 退场旋转，不传则退出无旋转 */
  rotation?: I_RotationConfig
  /** 退场缩放目标值，默认 1（不缩放） */
  scale?: number
}

/**
 * 用户传入的单项配置
 */
export interface I_StackCarouselItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 SVG 内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
  /** 点击跳转链接（可选） */
  link?: string
  /** 退场配置 */
  exit?: I_ExitConfig
  /** 切换时长（秒），默认 1 */
  switchDuration?: number
  /** 停留时长（秒），默认 1 */
  stayDuration?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

/** 标准化后的退场配置 */
export interface I_NormalizedExitConfig {
  direction: T_Direction8
  distance?: number
  skew?: I_SkewConfig
  rotation?: I_RotationConfig
  scale: number
}

/**
 * 标准化后的配置 — 所有可选字段已填充默认值
 */
export interface I_NormalizedStackItem {
  url?: string
  jsx?: ReactNode
  link?: string
  useItem: boolean
  exit: I_NormalizedExitConfig
  switchDuration: number
  stayDuration: number
  keySplines: string
}

/** 中心（焦点）卡牌：基准尺寸 + 位置，scale 恒为 1 */
export interface I_MainChildConfig {
  /** 卡牌基准宽（scale=1 时的 viewBox 尺寸） */
  w: number
  /** 卡牌基准高 */
  h: number
  /** 中心卡牌正中心 X（viewBox 坐标），默认 viewBox 几何中心 */
  centerX?: number
  /** 中心卡牌正中心 Y（viewBox 坐标），默认 viewBox 几何中心 */
  centerY?: number
}

/** 最远端卡牌：缩放 + 位置；与 mainChild 两点连线决定叠层方向与深度 */
export interface I_TailChildConfig {
  /** 最远端缩放（如 0.2） */
  scale: number
  /** 最远端正中心 X（viewBox 坐标） */
  centerX: number
  /** 最远端正中心 Y（viewBox 坐标） */
  centerY: number
}

/**
 * 单层叠层的覆盖配置（用于 showStackConfig 逐层定制）
 *
 * 两端锚点契约：center 层（最后一项）落 mainChild.center、tail 层（第一项）落
 * tailChild.center。中间层缺省字段走自动公式，传值则逐层覆盖。
 */
export interface I_StackLayerConfig {
  /** 该层缩放；缺省走幂律 scale(i) = tailScale ^ depthRatio（tail=tailScale，center=1） */
  scale?: number
  /** 该层中心沿方向轴的归一化进度：0 = mainChild（center 端），1 = tailChild（tail 端）。
   *  缺省走恒定 peek 分布（露边相等）；传值则直接按进度定位中心，露边不再恒定。 */
  progress?: number
  /** 该层旋转角度（度），缺省 0。卡片循环推进时与 translate/scale 同步层间插值 */
  rotate?: number
  /** 该层旋转中心（child 局部，九宫格或 {x,y}）；缺省 "Center"（= child 几何中心） */
  rotatePivot?: T_Pivot
}
