import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import sum from "lodash/sum"
import { DIRECTION_8 } from "@svg/types"
import type { T_Direction8, T_Origin, I_RotationConfig, I_EntryScaleConfig, I_EntryOpacityConfig, I_EntrySkewConfig, I_StayAnimConfig, I_EntryTranslateConfig, I_StayTranslateConfig } from "@svg/types"
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
 * 标准化后的 entry/exit translate 配置
 *
 * - 简单模式：direction + distance，CycleItem 自动计算 offscreen 位置
 * - 高级模式：initValue + timeline，用户自定义位移路径
 */
export interface I_NormalizedTranslateConfig {
  direction: T_Direction8
  distance?: number
  keySplines?: string
  initValue?: { x: number; y: number }
  timeline?: I_TimelineKeyframe<{ x: number; y: number }>[]
}

/**
 * 标准化后的 stay translate 配置
 *
 * - fixedValue: stay 期间保持在该位置
 * - timeline: stay 期间播放自定义位移动画
 */
export interface I_NormalizedStayTranslateConfig {
  fixedValue?: { x: number; y: number }
  timeline?: I_TimelineKeyframe<{ x: number; y: number }>[]
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

/**
 * 标准化 stay 阶段 translate 配置
 *
 * - { x, y } → fixedValue
 * - { timeline } → timeline
 */
const normalizeStayTranslate = (value: I_StayTranslateConfig | undefined): I_NormalizedStayTranslateConfig | undefined => {
  if (isNil(value)) return undefined
  if ('timeline' in value) return { timeline: value.timeline }
  return { fixedValue: { x: value.x, y: value.y } }
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
    translate: I_NormalizedTranslateConfig
    skewX?: I_NormalizedSkewConfig
    skewY?: I_NormalizedSkewConfig
    rotation?: I_NormalizedRotationConfig
    scale?: I_NormalizedScaleConfig
    opacity?: I_NormalizedOpacityConfig
  }
  stay: {
    translate?: I_NormalizedStayTranslateConfig
    rotation?: I_NormalizedStayAnimConfig
    scale?: I_NormalizedStayAnimConfig
    opacity?: I_NormalizedStayAnimConfig
    skewX?: I_NormalizedStayAnimConfig
    skewY?: I_NormalizedStayAnimConfig
  }
  exit: {
    translate: I_NormalizedTranslateConfig
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
        keySplines: item.entry?.translate?.keySplines,
        initValue: item.entry?.translate?.initValue,
        timeline: item.entry?.translate?.timeline,
      },
      skewX: normalizeSkew(item.entry?.skewX),
      skewY: normalizeSkew(item.entry?.skewY),
      rotation: normalizeRotation(item.entry?.rotation),
      scale: normalizeScale(item.entry?.scale),
      opacity: normalizeOpacity(item.entry?.opacity),
    },
    stay: {
      translate: normalizeStayTranslate(item.stay?.translate),
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
        keySplines: item.exit?.translate?.keySplines,
        initValue: item.exit?.translate?.initValue,
        timeline: item.exit?.translate?.timeline,
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
 * 数据驱动：将所有需要校验的 timeline 汇总为 checks 数组，统一循环校验。
 * 新增属性时只需在 checks 数组中加一行即可。
 */
const validateTimelineDurations = (items: I_NormalizedChildItem[]): void => {
  const n = items.length
  for (let i = 0; i < n; i++) {
    const item = items[i]
    const entryDuration = item.switchDuration
    const exitDuration = items[(i + 1) % n].switchDuration

    const checks: { timeline: readonly { durationSeconds: number }[] | undefined; max: number; label: string }[] = [
      // Entry
      { timeline: item.entry.translate.timeline, max: entryDuration, label: 'entry translate' },
      { timeline: item.entry.rotation?.timeline, max: entryDuration, label: 'entry rotation' },
      { timeline: item.entry.scale?.timeline, max: entryDuration, label: 'entry scale' },
      { timeline: item.entry.opacity?.timeline, max: entryDuration, label: 'entry opacity' },
      { timeline: item.entry.skewX?.timeline, max: entryDuration, label: 'entry skewX' },
      { timeline: item.entry.skewY?.timeline, max: entryDuration, label: 'entry skewY' },
      // Exit
      { timeline: item.exit.translate.timeline, max: exitDuration, label: 'exit translate' },
      { timeline: item.exit.rotation?.timeline, max: exitDuration, label: 'exit rotation' },
      { timeline: item.exit.scale?.timeline, max: exitDuration, label: 'exit scale' },
      { timeline: item.exit.opacity?.timeline, max: exitDuration, label: 'exit opacity' },
      { timeline: item.exit.skewX?.timeline, max: exitDuration, label: 'exit skewX' },
      { timeline: item.exit.skewY?.timeline, max: exitDuration, label: 'exit skewY' },
      // Stay
      { timeline: item.stay.translate?.timeline, max: item.stayDuration, label: 'stay translate' },
      { timeline: item.stay.rotation?.timeline, max: item.stayDuration, label: 'stay rotation' },
      { timeline: item.stay.scale?.timeline, max: item.stayDuration, label: 'stay scale' },
      { timeline: item.stay.opacity?.timeline, max: item.stayDuration, label: 'stay opacity' },
      { timeline: item.stay.skewX?.timeline, max: item.stayDuration, label: 'stay skewX' },
      { timeline: item.stay.skewY?.timeline, max: item.stayDuration, label: 'stay skewY' },
    ]

    for (const { timeline, max, label } of checks) {
      if (timeline) {
        const total = sum(timeline.map(s => s.durationSeconds))
        if (total > max) {
          throw new Error(`Item ${i + 1} ${label} timeline total (${total}s) must not exceed ${max}s.`)
        }
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
