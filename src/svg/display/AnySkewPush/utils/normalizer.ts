import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import type { T_Direction4, T_Origin } from "@svg/types"
import type { I_SkewConfig, I_AnySkewPushChildItem, I_RotationConfig } from "../types"

export const DEFAULT_STAY_DURATION = 2
export const DEFAULT_SWITCH_DURATION = 2
export const DEFAULT_DIRECTION: T_Direction4 = 'T'
export const DEFAULT_ROTATION_ORIGIN: T_Origin = 'Center'

/** 标准化后的旋转配置（origin 和 angle 已填充默认值） */
export interface I_NormalizedRotationConfig {
  origin: T_Origin
  angle: number
  keySplines?: string
}

/** 标准化单个旋转配置：填充默认 origin 和 angle */
const normalizeRotation = (rotation: I_RotationConfig | undefined): I_NormalizedRotationConfig | undefined => {
  if (isNil(rotation)) return undefined
  return {
    origin: defaultTo(rotation.origin, DEFAULT_ROTATION_ORIGIN),
    angle: defaultTo(rotation.angle, 0),
    keySplines: rotation.keySplines,
  }
}

/** 进入方向取反，作为默认退出方向（T↔B，L↔R） */
export const oppositeDirection = (direction: T_Direction4): T_Direction4 =>
  direction === 'T' ? 'B' : direction === 'B' ? 'T' : direction === 'L' ? 'R' : 'L'

/**
 * 标准化子项配置
 *
 * 将用户传入的 I_AnySkewPushChildItem[] 转换为内部使用的 I_NormalizedChildItem[]。
 * 所有可选字段在此填充默认值，后续计算逻辑无需再处理空值。
 */
export interface I_NormalizedChildItem {
  url?: string
  jsx?: React.ReactNode
  entry: {
    direction: T_Direction4
    skew?: I_SkewConfig
    rotation?: I_NormalizedRotationConfig
  }
  exit: {
    direction: T_Direction4
    skew?: I_SkewConfig
    rotation?: I_NormalizedRotationConfig
  }
  stayDuration: number
  switchDuration: number
}

/** 填充单张图片配置的默认值并校验 */
const fillDefaults = (item: I_AnySkewPushChildItem): I_NormalizedChildItem => {
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
    },
    exit: {
      direction: defaultTo(item.exit?.direction, oppositeDirection(entryDirection)),
      skew: item.exit?.skew,
      rotation: normalizeRotation(item.exit?.rotation),
    },
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
  }
}

/**
 * 标准化子项数组
 *
 * 1. 空数组 → 抛出错误
 * 2. 仅 1 张图 → 自动复制一份（推入效果需要 ≥2 张）
 * 3. 多张图 → 逐个填充默认值
 */
export const normalizeChildItems = (items: I_AnySkewPushChildItem[]): I_NormalizedChildItem[] => {
  if (!items || items.length === 0) {
    throw new Error("`childItems` must not be empty.")
  }

  if (items.length === 1) {
    const normalized = fillDefaults(items[0])
    return [normalized, normalized]
  }

  return items.map(fillDefaults)
}
