import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import sum from "lodash/sum"
import type { I_AnyCarouselChildItem, I_NormalizedCarouselItem, I_NormalizedAnimChannel, I_NormalizedOriginChannel } from "../types"
import {
  DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION, DEFAULT_KEY_SPLINES,
  IDENTITY_SCALE, IDENTITY_OPACITY, IDENTITY_ROTATION, IDENTITY_SKEW,
} from "../types"
import type { I_TimelineKeyframe } from "@smil/timeline/types"

/** 标准化普通动画通道（opacity） */
const normalizeAnimChannel = (
  channel: I_AnyCarouselChildItem['opacity'],
  identityValue: number,
): I_NormalizedAnimChannel | undefined => {
  if (isNil(channel)) return undefined

  const sideValue = defaultTo(channel.sideValue, identityValue)
  const centerValue = defaultTo(channel.centerValue, identityValue)

  let stay: I_NormalizedAnimChannel['stay']
  if (isNil(channel.stay)) {
    stay = 'hold'
  } else if (typeof channel.stay === 'number') {
    stay = { value: channel.stay }
  } else {
    stay = { timeline: channel.stay.timeline }
  }

  // 全部 identity 且无 stay 动画 → 不生成
  if (sideValue === identityValue && centerValue === identityValue && stay === 'hold') {
    return undefined
  }

  return { sideValue, centerValue, stay }
}

/** 标准化带 origin 的动画通道（scale / rotation / skewX / skewY） */
const normalizeOriginChannel = (
  channel: I_AnyCarouselChildItem['scale'],
  identityValue: number,
): I_NormalizedOriginChannel | undefined => {
  if (isNil(channel)) return undefined

  const anim = normalizeAnimChannel(channel, identityValue)
  if (isNil(anim)) return undefined

  return {
    ...anim,
    origin: defaultTo(channel.origin, 'Center'),
  }
}

/** 校验 timeline 总时长不超过 phase duration */
const validateTimelineDurations = (items: I_NormalizedCarouselItem[]): void => {
  const totalDuration = items.reduce((s, item) => s + item.switchDuration + item.stayDuration, 0)
  const n = items.length

  for (let i = 0; i < n; i++) {
    const item = items[i]
    const entryDuration = item.switchDuration
    const exitDuration = items[(i + 1) % n].switchDuration
    const holdDuration = totalDuration - entryDuration - item.stayDuration - exitDuration

    const checks: { timeline: readonly { durationSeconds: number }[] | undefined; max: number; label: string }[] = []

    // 各通道的 stay timeline 校验
    const channels: { config: I_NormalizedAnimChannel | undefined; name: string }[] = [
      { config: item.scale, name: 'scale' },
      { config: item.opacity, name: 'opacity' },
      { config: item.rotation, name: 'rotation' },
      { config: item.skewX, name: 'skewX' },
      { config: item.skewY, name: 'skewY' },
    ]

    for (const { config, name } of channels) {
      if (isDefined(config) && typeof config.stay !== 'string' && 'timeline' in config.stay) {
        checks.push({
          timeline: config.stay.timeline,
          max: item.stayDuration,
          label: `${name} stay`,
        })
      }
    }

    for (const { timeline, max, label } of checks) {
      if (isDefined(timeline)) {
        const total = sum(timeline.map(s => s.durationSeconds))
        if (total > max) {
          throw new Error(`Item ${i + 1} ${label} timeline total (${total}s) must not exceed ${max}s.`)
        }
      }
    }
  }
}

/**
 * 校验并填充单项配置的默认值
 */
const fillDefaults = (item: I_AnyCarouselChildItem): I_NormalizedCarouselItem => {
  if (isNil(item.url) && isNil(item.jsx)) {
    throw new Error("Each childItem must have either `url` or `jsx`.")
  }
  if (isDefined(item.url) && isDefined(item.jsx)) {
    console.warn("`url` is ignored when `jsx` is also provided.")
  }

  return {
    url: item.url,
    jsx: item.jsx,
    useJsx: isDefined(item.jsx),
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    keySplines: defaultTo(item.keySplines, DEFAULT_KEY_SPLINES),
    scale: normalizeOriginChannel(item.scale, IDENTITY_SCALE),
    opacity: normalizeAnimChannel(item.opacity, IDENTITY_OPACITY),
    rotation: normalizeOriginChannel(item.rotation, IDENTITY_ROTATION),
    skewX: normalizeOriginChannel(item.skewX, IDENTITY_SKEW),
    skewY: normalizeOriginChannel(item.skewY, IDENTITY_SKEW),
  }
}

/**
 * 标准化 childItems：
 * - 空/nil → throw
 * - 1 图 → 复制成 2 张做循环
 * - ≥ 2 图 → 逐个填充默认值
 * - 全部 identity 的通道自动剔除
 */
export const normalizeItems = (items?: I_AnyCarouselChildItem[]): I_NormalizedCarouselItem[] => {
  if (isNil(items) || items.length === 0) {
    throw new Error("`childItems` must not be empty.")
  }

  let normalized: I_NormalizedCarouselItem[]
  if (items.length === 1) {
    const single = fillDefaults(items[0])
    normalized = [single, { ...single }]
  } else {
    normalized = items.map(fillDefaults)
  }

  validateTimelineDurations(normalized)
  return normalized
}
