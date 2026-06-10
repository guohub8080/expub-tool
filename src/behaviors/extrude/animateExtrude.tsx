import { animateAttribute } from '@smil/animate/attribute'
import type { I_AnimateAttributeConfig } from '@smil/animate/attribute'
import defaultTo from 'lodash/defaultTo'
import { isDefined } from '@utils/fn/isDefined'
import { getEaseBezier } from '@smil/bezier/getEaseBezier'

/**
 * animateExtrude — 挤出动画的 width <animate> 标签生成器
 *
 * 纯 SMIL 原语：只生成 `<animate attributeName="width">` 标签，
 * 将 timeline 中的 toHeight 转为百分比（toHeight / initHeight * 100%），
 * 用于配合外层 SVG viewBox 实现从上往下的"挤出展开"效果。
 *
 * 使用方式：
 *   <svg viewBox={`0 0 ${canvasWidth} ${initHeight}`}>
 *     {animateExtrude({ initHeight, timeline, ... })}
 *   </svg>
 */
export interface I_ExtrudeConfig {
  /** 初始高度（px），toHeight 会除以它得到百分比 */
  initHeight: number
  /** 动画关键帧 */
  timeline: {
    /** 目标高度（px），内部转为百分比 */
    toHeight: number
    durationSeconds: number
    keySplines?: string
  }[]
  /** 动画开始时间，默认 "0s" */
  begin?: string
  /** 是否冻结最后一帧，默认 true */
  isFreeze?: boolean
  /** 循环次数，0 = indefinite */
  loopCount?: number
  /** 原生 SMIL 属性覆盖 */
  native?: I_AnimateAttributeConfig<string>['native']
}

export function animateExtrude(config: I_ExtrudeConfig) {
  const defaultSplines = getEaseBezier({ isOut: true })

  const timeline = config.timeline.map(seg => ({
    toAbs: `${100 * (seg.toHeight / config.initHeight)}%`,
    durationSeconds: seg.durationSeconds,
    keySplines: defaultTo(seg.keySplines, defaultSplines),
  }))

  const hasKeySplines = config.timeline.some(seg => isDefined(seg.keySplines))

  return animateAttribute<string>({
    attributeName: 'width',
    initValue: '100%',
    timeline,
    begin: config.begin,
    calcMode: hasKeySplines ? 'spline' : 'linear',
    isFreeze: defaultTo(config.isFreeze, true),
    loopCount: defaultTo(config.loopCount, 1),
    native: config.native,
  })
}
