import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { DIRECTION_8 } from "@svg/types"
import type { T_Direction8, T_Origin, I_SkewConfig, I_RotationConfig, I_EntryScaleConfig } from "@svg/types"
import type { I_AnyLoopDisplayChildItem } from "../types"

export const DEFAULT_STAY_DURATION = 2
export const DEFAULT_SWITCH_DURATION = 2
const DEFAULT_DIRECTION: T_Direction8 = DIRECTION_8.Top
export const DEFAULT_TRANSFORM_ORIGIN: T_Origin = 'Center'

/** 标准化后的旋转配置（childCanvasOrigin 和 angle 已填充默认值） */
export interface I_NormalizedRotationConfig {
  childCanvasOrigin: T_Origin
  angle: number
  keySplines?: string
}

/** 标准化后的缩放配置（childCanvasOrigin 和 scale 已填充默认值） */
export interface I_NormalizedScaleConfig {
  childCanvasOrigin: T_Origin
  scale: number
  keySplines?: string
}

/** 标准化单个旋转配置：填充默认 childCanvasOrigin 和 angle */
const normalizeRotation = (rotation: I_RotationConfig | undefined): I_NormalizedRotationConfig | undefined => {
  if (isNil(rotation)) return undefined
  return {
    childCanvasOrigin: defaultTo(rotation.childCanvasOrigin, DEFAULT_TRANSFORM_ORIGIN),
    angle: defaultTo(rotation.angle, 0),
    keySplines: rotation.keySplines,
  }
}

/** 标准化单个缩放配置：填充默认 childCanvasOrigin 和 scale */
const normalizeScale = (scale: I_EntryScaleConfig | undefined): I_NormalizedScaleConfig | undefined => {
  if (isNil(scale)) return undefined
  return {
    childCanvasOrigin: defaultTo(scale.childCanvasOrigin, DEFAULT_TRANSFORM_ORIGIN),
    scale: defaultTo(scale.scale, 1),
    keySplines: scale.keySplines,
  }
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
    direction: T_Direction8
    skew?: I_SkewConfig
    rotation?: I_NormalizedRotationConfig
    scale?: I_NormalizedScaleConfig
  }
  exit: {
    direction: T_Direction8
    skew?: I_SkewConfig
    rotation?: I_NormalizedRotationConfig
    scale?: I_NormalizedScaleConfig
  }
  stayDuration: number
  switchDuration: number
  distance?: number
}

/** 填充单张图片配置的默认值并校验 */
const fillDefaults = (item: I_AnyLoopDisplayChildItem): I_NormalizedChildItem => {
  if (!item.url && !item.jsx) {
    throw new Error("Each childItem must have either `url` or `jsx`. Both cannot be empty.")
  }

  const entryDirection = defaultTo(item.entry?.direction, DEFAULT_DIRECTION)

  return {
    url: item.url,
    jsx: item.jsx,
    entry: {
      direction: entryDirection,
      skew: item.entry?.skew,
      rotation: normalizeRotation(item.entry?.rotation),
      scale: normalizeScale(item.entry?.scale),
    },
    exit: {
      direction: defaultTo(item.exit?.direction, oppositeDirection(entryDirection)),
      skew: item.exit?.skew,
      rotation: normalizeRotation(item.exit?.rotation),
      scale: normalizeScale(item.exit?.scale),
    },
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
    distance: item.distance,
  }
}

/**
 * 标准化子项数组
 *
 * 1. 空数组 → 抛出错误
 * 2. 仅 1 张图 → 自动复制一份（推入效果需要 ≥2 张）
 * 3. 多张图 → 逐个填充默认值
 */
export const normalizeChildItems = (items: I_AnyLoopDisplayChildItem[]): I_NormalizedChildItem[] => {
  if (!items || items.length === 0) {
    throw new Error("`childItems` must not be empty.")
  }

  if (items.length === 1) {
    const normalized = fillDefaults(items[0])
    return [normalized, normalized]
  }

  return items.map(fillDefaults)
}
