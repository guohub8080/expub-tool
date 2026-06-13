import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import sum from "lodash/sum"
import type { I_AnyCarouselChildItem, I_NormalizedCarouselItem, I_NormalizedAnimChannel, I_NormalizedOriginChannel, I_NormalizedTranslateChannel } from "../types"
import {
  DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION, DEFAULT_KEY_SPLINES,
  IDENTITY_SCALE, IDENTITY_OPACITY, IDENTITY_ROTATION, IDENTITY_SKEW,
} from "../types"

// ── 通道标准化 ──

const normalizeAnimChannel = (
  channel: I_AnyCarouselChildItem['opacity'],
  identityValue: number,
): I_NormalizedAnimChannel | undefined => {
  if (isNil(channel)) return undefined

  const sideValue = defaultTo(channel.sideValue, identityValue)
  const centerValue = defaultTo(channel.centerValue, identityValue)
  const exitValue = defaultTo(channel.exitValue, centerValue)

  let stay: I_NormalizedAnimChannel['stay']
  if (isNil(channel.stay)) {
    stay = 'hold'
  } else if (typeof channel.stay === 'number') {
    stay = { value: channel.stay }
  } else {
    stay = { timeline: channel.stay.timeline }
  }

  if (sideValue === identityValue && centerValue === identityValue && exitValue === identityValue && stay === 'hold') return undefined

  return { sideValue, centerValue, exitValue, stay }
}

const normalizeOriginChannel = (
  channel: I_AnyCarouselChildItem['scale'],
  identityValue: number,
): I_NormalizedOriginChannel | undefined => {
  if (isNil(channel)) return undefined
  const anim = normalizeAnimChannel(channel, identityValue)
  if (isNil(anim)) return undefined
  return { ...anim, origin: defaultTo(channel.origin, 'Center') }
}

const normalizeTranslateChannel = (
  channel: I_AnyCarouselChildItem['translate'],
): I_NormalizedTranslateChannel => {
  if (isNil(channel)) {
    return { stay: 'hold' }
  }

  let stay: I_NormalizedTranslateChannel['stay']
  if (isNil(channel.stay)) {
    stay = 'hold'
  } else if ('x' in channel.stay) {
    stay = { value: channel.stay as { x: number; y: number } }
  } else {
    stay = { timeline: channel.stay.timeline }
  }

  return { stay }
}

// ── 校验 ──

const validateTimelineDurations = (items: I_NormalizedCarouselItem[]): void => {
  const totalDuration = items.reduce((s, item) => s + item.switchDuration + item.stayDuration, 0)
  const n = items.length

  for (let i = 0; i < n; i++) {
    const item = items[i]
    const stayDuration = item.stayDuration

    const channels: { config: I_NormalizedAnimChannel | undefined; name: string }[] = [
      { config: item.scale, name: 'scale' },
      { config: item.opacity, name: 'opacity' },
      { config: item.rotation, name: 'rotation' },
      { config: item.skewX, name: 'skewX' },
      { config: item.skewY, name: 'skewY' },
    ]

    for (const { config, name } of channels) {
      if (isDefined(config) && typeof config.stay !== 'string' && 'timeline' in config.stay) {
        const total = sum(config.stay.timeline.map(s => s.durationSeconds))
        if (total > stayDuration) {
          throw new Error(`Item ${i + 1} ${name} stay timeline total (${total}s) must not exceed ${stayDuration}s.`)
        }
      }
    }

    // translate stay timeline
    if (typeof item.translate.stay !== 'string' && 'timeline' in item.translate.stay) {
      const total = sum(item.translate.stay.timeline.map(s => s.durationSeconds))
      if (total > stayDuration) {
        throw new Error(`Item ${i + 1} translate stay timeline total (${total}s) must not exceed ${stayDuration}s.`)
      }
    }
  }
}

// ── fillDefaults ──

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
    translate: normalizeTranslateChannel(item.translate),
    scale: normalizeOriginChannel(item.scale, IDENTITY_SCALE),
    opacity: normalizeAnimChannel(item.opacity, IDENTITY_OPACITY),
    rotation: normalizeOriginChannel(item.rotation, IDENTITY_ROTATION),
    skewX: normalizeOriginChannel(item.skewX, IDENTITY_SKEW),
    skewY: normalizeOriginChannel(item.skewY, IDENTITY_SKEW),
  }
}

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
