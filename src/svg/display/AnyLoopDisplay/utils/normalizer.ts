import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import sum from "lodash/sum"
import { DIRECTION_8 } from "@svg/types"
import type { T_Direction8, T_Origin, I_RotationConfig, I_EntryScaleConfig, I_EntryOpacityConfig, I_EntrySkewConfig, I_StayAnimConfig } from "@svg/types"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_AnyLoopDisplayChildItem } from "../types"

export const DEFAULT_STAY_DURATION = 2
export const DEFAULT_SWITCH_DURATION = 2
const DEFAULT_DIRECTION: T_Direction8 = DIRECTION_8.Top
export const DEFAULT_TRANSFORM_ORIGIN: T_Origin = 'Center'

/**
 * 标准化后的旋转配置
 *
 * 两种模式：
 * - 简单模式：只有 initValue + keySplines，CycleItem 自动生成单步动画
 * - 高级模式：有 timeline，CycleItem 直接使用用户自定义的多段动画
 */
export interface I_NormalizedRotationConfig {
  childCanvasOrigin: T_Origin
  /** 起始旋转角度，简单模式下来自 angle，高级模式下来自 initValue */
  initValue: number
  /** 缓动曲线，仅简单模式生效 */
  keySplines?: string
  /** 自定义动画路径，存在时为高级模式 */
  timeline?: I_TimelineKeyframe<number>[]
}

/**
 * 标准化后的缩放配置
 *
 * 两种模式：
 * - 简单模式：只有 initValue + keySplines，CycleItem 自动生成单步动画
 * - 高级模式：有 timeline，CycleItem 直接使用用户自定义的多段动画
 */
export interface I_NormalizedScaleConfig {
  childCanvasOrigin: T_Origin
  /** 起始缩放值，简单模式下来自 from，高级模式下来自 initValue */
  initValue: number
  /** 缓动曲线，仅简单模式生效 */
  keySplines?: string
  /** 自定义动画路径，存在时为高级模式 */
  timeline?: I_TimelineKeyframe<number>[]
}

/**
 * 标准化后的透明度配置
 *
 * 两种模式：
 * - 简单模式：只有 initValue + keySplines，CycleItem 自动生成单步动画
 * - 高级模式：有 timeline，CycleItem 直接使用用户自定义的多段动画
 */
export interface I_NormalizedOpacityConfig {
  /** 起始透明度，简单模式下来自 from，高级模式下来自 initValue */
  initValue: number
  /** 缓动曲线，仅简单模式生效 */
  keySplines?: string
  /** 自定义动画路径，存在时为高级模式 */
  timeline?: I_TimelineKeyframe<number>[]
}

/**
 * 标准化后的斜切配置（skewX 或 skewY 通用）
 *
 * 两种模式：
 * - 简单模式：只有 initValue + keySplines，CycleItem 自动生成单步动画
 * - 高级模式：有 timeline，CycleItem 直接使用用户自定义的多段动画
 */
export interface I_NormalizedSkewConfig {
  /** 起始斜切角度（度），简单模式下来自 from，高级模式下来自 initValue */
  initValue: number
  /** 缓动曲线，仅简单模式生效 */
  keySplines?: string
  /** 自定义动画路径，存在时为高级模式 */
  timeline?: I_TimelineKeyframe<number>[]
}

/**
 * 标准化后的 stay 阶段动画配置
 *
 * - fixedValue: stay 期间保持在该值
 * - timeline: stay 期间播放自定义动画
 */
export interface I_NormalizedStayAnimConfig {
  /** 固定值模式 */
  fixedValue?: number
  /** 自定义动画路径 */
  timeline?: I_TimelineKeyframe<number>[]
}

/**
 * 标准化单个旋转配置
 *
 * 两种输入模式：
 * - 简单模式：只传 angle（作为 initValue）
 * - 高级模式：传 initValue + timeline
 */
const normalizeRotation = (rotation: I_RotationConfig | undefined): I_NormalizedRotationConfig | undefined => {
  if (isNil(rotation)) return undefined

  const hasTimeline = !isNil(rotation.timeline)

  return {
    childCanvasOrigin: defaultTo(rotation.childCanvasOrigin, DEFAULT_TRANSFORM_ORIGIN),
    initValue: hasTimeline ? defaultTo(rotation.initValue, 0) : defaultTo(rotation.angle, 0),
    keySplines: hasTimeline ? undefined : rotation.keySplines,
    timeline: hasTimeline ? rotation.timeline : undefined,
  }
}

/**
 * 标准化单个缩放配置
 *
 * 两种输入模式：
 * - 简单模式：只传 from（作为 initValue）
 * - 高级模式：传 initValue + timeline
 */
const normalizeScale = (scale: I_EntryScaleConfig | undefined): I_NormalizedScaleConfig | undefined => {
  if (isNil(scale)) return undefined

  const hasTimeline = !isNil(scale.timeline)

  return {
    childCanvasOrigin: defaultTo(scale.childCanvasOrigin, DEFAULT_TRANSFORM_ORIGIN),
    initValue: hasTimeline ? defaultTo(scale.initValue, 1) : defaultTo(scale.from, 1),
    keySplines: hasTimeline ? undefined : scale.keySplines,
    timeline: hasTimeline ? scale.timeline : undefined,
  }
}

/**
 * 标准化单个透明度配置
 *
 * 两种输入模式：
 * - 简单模式：只传 from（作为 initValue）
 * - 高级模式：传 initValue + timeline
 */
const normalizeOpacity = (opacity: I_EntryOpacityConfig | undefined): I_NormalizedOpacityConfig | undefined => {
  if (isNil(opacity)) return undefined

  const hasTimeline = !isNil(opacity.timeline)

  return {
    initValue: hasTimeline ? defaultTo(opacity.initValue, 1) : defaultTo(opacity.from, 1),
    keySplines: hasTimeline ? undefined : opacity.keySplines,
    timeline: hasTimeline ? opacity.timeline : undefined,
  }
}

/**
 * 标准化单个斜切配置（skewX 或 skewY 通用）
 *
 * 两种输入模式：
 * - 简单模式：只传 from（作为 initValue）
 * - 高级模式：传 initValue + timeline
 */
const normalizeSkew = (skew: I_EntrySkewConfig | undefined): I_NormalizedSkewConfig | undefined => {
  if (isNil(skew)) return undefined

  const hasTimeline = !isNil(skew.timeline)

  return {
    initValue: hasTimeline ? defaultTo(skew.initValue, 0) : defaultTo(skew.from, 0),
    keySplines: hasTimeline ? undefined : skew.keySplines,
    timeline: hasTimeline ? skew.timeline : undefined,
  }
}

/**
 * 标准化 stay 阶段动画配置
 *
 * - 数字 → fixedValue
 * - { timeline } → timeline
 */
const normalizeStayAnim = (value: I_StayAnimConfig | undefined): I_NormalizedStayAnimConfig | undefined => {
  if (isNil(value)) return undefined
  if (typeof value === 'number') return { fixedValue: value }
  if (value.timeline) return { timeline: value.timeline }
  return undefined
}

/** 进入方向取反，作为默认退出方向（T↔B，L↔R，TL↔BR，TR↔BL） */
export const oppositeDirection = (direction: T_Direction8): T_Direction8 => {
  const map: Record<T_Direction8, T_Direction8> = { T: 'B', B: 'T', L: 'R', R: 'L', TL: 'BR', TR: 'BL', BL: 'TR', BR: 'TL' }
  return map[direction]
}

/**
 * 标准化子项配置
 *
 * 将用户传入的 I_AnyLoopDisplayChildItem[] 转换为内部使用的 I_NormalizedChildItem[]。
 * 所有可选字段在此填充默认值，后续计算逻辑无需再处理空值。
 */
export interface I_NormalizedChildItem {
  url?: string
  jsx?: React.ReactNode
  entry: {
    translate: {
      direction: T_Direction8
      distance?: number
    }
    skewX?: I_NormalizedSkewConfig
    skewY?: I_NormalizedSkewConfig
    rotation?: I_NormalizedRotationConfig
    scale?: I_NormalizedScaleConfig
    opacity?: I_NormalizedOpacityConfig
  }
  stay: {
    rotation?: I_NormalizedStayAnimConfig
    scale?: I_NormalizedStayAnimConfig
    opacity?: I_NormalizedStayAnimConfig
    skewX?: I_NormalizedStayAnimConfig
    skewY?: I_NormalizedStayAnimConfig
  }
  exit: {
    translate: {
      direction: T_Direction8
      distance?: number
    }
    skewX?: I_NormalizedSkewConfig
    skewY?: I_NormalizedSkewConfig
    rotation?: I_NormalizedRotationConfig
    scale?: I_NormalizedScaleConfig
    opacity?: I_NormalizedOpacityConfig
  }
  stayDuration: number
  switchDuration: number
}

/** 填充单张图片配置的默认值并校验 */
const fillDefaults = (item: I_AnyLoopDisplayChildItem): I_NormalizedChildItem => {
  if (!item.url && !item.jsx) {
    throw new Error("Each childItem must have either `url` or `jsx`. Both cannot be empty.")
  }

  const entryDirection = defaultTo(item.entry?.translate?.direction, DEFAULT_DIRECTION)

  return {
    url: item.url,
    jsx: item.jsx,
    entry: {
      translate: {
        direction: entryDirection,
        distance: item.entry?.translate?.distance,
      },
      skewX: normalizeSkew(item.entry?.skewX),
      skewY: normalizeSkew(item.entry?.skewY),
      rotation: normalizeRotation(item.entry?.rotation),
      scale: normalizeScale(item.entry?.scale),
      opacity: normalizeOpacity(item.entry?.opacity),
    },
    stay: {
      rotation: normalizeStayAnim(item.stay?.rotation),
      scale: normalizeStayAnim(item.stay?.scale),
      opacity: normalizeStayAnim(item.stay?.opacity),
      skewX: normalizeStayAnim(item.stay?.skewX),
      skewY: normalizeStayAnim(item.stay?.skewY),
    },
    exit: {
      translate: {
        direction: defaultTo(item.exit?.translate?.direction, oppositeDirection(entryDirection)),
        distance: item.exit?.translate?.distance,
      },
      skewX: normalizeSkew(item.exit?.skewX),
      skewY: normalizeSkew(item.exit?.skewY),
      rotation: normalizeRotation(item.exit?.rotation),
      scale: normalizeScale(item.exit?.scale),
      opacity: normalizeOpacity(item.exit?.opacity),
    },
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
  }
}

/**
 * 校验所有子项的 timeline 总时长不超过对应的 phase duration
 *
 * - entry timeline 总时长 ≤ item.switchDuration（entry duration）
 * - exit timeline 总时长 ≤ nextItem.switchDuration（exit duration）
 * - 在 normalizer 阶段尽早报错，避免到渲染时才发现
 */
const validateTimelineDurations = (items: I_NormalizedChildItem[]): void => {
  const n = items.length
  for (let i = 0; i < n; i++) {
    const item = items[i]
    const entryDuration = item.switchDuration
    const exitDuration = items[(i + 1) % n].switchDuration

    // Entry rotation
    if (item.entry.rotation?.timeline) {
      const total = sum(item.entry.rotation.timeline.map(s => s.durationSeconds))
      if (total > entryDuration) {
        throw new Error(`Item ${i + 1} entry rotation timeline total (${total}s) must not exceed entry duration (${entryDuration}s).`)
      }
    }

    // Entry scale
    if (item.entry.scale?.timeline) {
      const total = sum(item.entry.scale.timeline.map(s => s.durationSeconds))
      if (total > entryDuration) {
        throw new Error(`Item ${i + 1} entry scale timeline total (${total}s) must not exceed entry duration (${entryDuration}s).`)
      }
    }

    // Exit rotation
    if (item.exit.rotation?.timeline) {
      const total = sum(item.exit.rotation.timeline.map(s => s.durationSeconds))
      if (total > exitDuration) {
        throw new Error(`Item ${i + 1} exit rotation timeline total (${total}s) must not exceed exit duration (${exitDuration}s).`)
      }
    }

    // Exit scale
    if (item.exit.scale?.timeline) {
      const total = sum(item.exit.scale.timeline.map(s => s.durationSeconds))
      if (total > exitDuration) {
        throw new Error(`Item ${i + 1} exit scale timeline total (${total}s) must not exceed exit duration (${exitDuration}s).`)
      }
    }

    // Entry opacity
    if (item.entry.opacity?.timeline) {
      const total = sum(item.entry.opacity.timeline.map(s => s.durationSeconds))
      if (total > entryDuration) {
        throw new Error(`Item ${i + 1} entry opacity timeline total (${total}s) must not exceed entry duration (${entryDuration}s).`)
      }
    }

    // Exit opacity
    if (item.exit.opacity?.timeline) {
      const total = sum(item.exit.opacity.timeline.map(s => s.durationSeconds))
      if (total > exitDuration) {
        throw new Error(`Item ${i + 1} exit opacity timeline total (${total}s) must not exceed exit duration (${exitDuration}s).`)
      }
    }

    // Entry skewX
    if (item.entry.skewX?.timeline) {
      const total = sum(item.entry.skewX.timeline.map(s => s.durationSeconds))
      if (total > entryDuration) {
        throw new Error(`Item ${i + 1} entry skewX timeline total (${total}s) must not exceed entry duration (${entryDuration}s).`)
      }
    }

    // Exit skewX
    if (item.exit.skewX?.timeline) {
      const total = sum(item.exit.skewX.timeline.map(s => s.durationSeconds))
      if (total > exitDuration) {
        throw new Error(`Item ${i + 1} exit skewX timeline total (${total}s) must not exceed exit duration (${exitDuration}s).`)
      }
    }

    // Entry skewY
    if (item.entry.skewY?.timeline) {
      const total = sum(item.entry.skewY.timeline.map(s => s.durationSeconds))
      if (total > entryDuration) {
        throw new Error(`Item ${i + 1} entry skewY timeline total (${total}s) must not exceed entry duration (${entryDuration}s).`)
      }
    }

    // Exit skewY
    if (item.exit.skewY?.timeline) {
      const total = sum(item.exit.skewY.timeline.map(s => s.durationSeconds))
      if (total > exitDuration) {
        throw new Error(`Item ${i + 1} exit skewY timeline total (${total}s) must not exceed exit duration (${exitDuration}s).`)
      }
    }

    // Stay rotation
    if (item.stay.rotation?.timeline) {
      const total = sum(item.stay.rotation.timeline.map(s => s.durationSeconds))
      if (total > item.stayDuration) {
        throw new Error(`Item ${i + 1} stay rotation timeline total (${total}s) must not exceed stay duration (${item.stayDuration}s).`)
      }
    }

    // Stay scale
    if (item.stay.scale?.timeline) {
      const total = sum(item.stay.scale.timeline.map(s => s.durationSeconds))
      if (total > item.stayDuration) {
        throw new Error(`Item ${i + 1} stay scale timeline total (${total}s) must not exceed stay duration (${item.stayDuration}s).`)
      }
    }

    // Stay opacity
    if (item.stay.opacity?.timeline) {
      const total = sum(item.stay.opacity.timeline.map(s => s.durationSeconds))
      if (total > item.stayDuration) {
        throw new Error(`Item ${i + 1} stay opacity timeline total (${total}s) must not exceed stay duration (${item.stayDuration}s).`)
      }
    }

    // Stay skewX
    if (item.stay.skewX?.timeline) {
      const total = sum(item.stay.skewX.timeline.map(s => s.durationSeconds))
      if (total > item.stayDuration) {
        throw new Error(`Item ${i + 1} stay skewX timeline total (${total}s) must not exceed stay duration (${item.stayDuration}s).`)
      }
    }

    // Stay skewY
    if (item.stay.skewY?.timeline) {
      const total = sum(item.stay.skewY.timeline.map(s => s.durationSeconds))
      if (total > item.stayDuration) {
        throw new Error(`Item ${i + 1} stay skewY timeline total (${total}s) must not exceed stay duration (${item.stayDuration}s).`)
      }
    }
  }
}

export const normalizeChildItems = (items: I_AnyLoopDisplayChildItem[]): I_NormalizedChildItem[] => {
  if (!items || items.length === 0) {
    throw new Error("`childItems` must not be empty.")
  }

  let normalized: I_NormalizedChildItem[]
  if (items.length === 1) {
    const single = fillDefaults(items[0])
    normalized = [single, single]
  } else {
    normalized = items.map(fillDefaults)
  }

  validateTimelineDurations(normalized)
  return normalized
}
