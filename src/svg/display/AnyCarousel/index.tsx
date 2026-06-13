import React from 'react'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { isDefined } from '@utils/fn/isDefined'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import {
  transformTranslate,
  transformScale,
  transformRotate,
  transformSkewX,
  transformSkewY,
  animateOpacity,
} from '@smil/index'
import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { I_TranslateValue } from '@smil/animateTransform/translate'
import { normalizeItems } from './utils/normalizer'
import { resolveRotationOrigin } from './utils/rotationOrigin'
import { calcSlotPositions, calcExitOffset } from './timeline/offsetCalculator'
import type {
  I_AnyCarouselChildItem,
  I_NormalizedCarouselItem,
  I_NormalizedAnimChannel,
  I_NormalizedOriginChannel,
  I_NormalizedTranslateChannel,
} from './types'
import { DEFAULT_ANGLE } from './types'

// ── slot 位置计算 ──

/**
 * 计算 slot 在段边界处的位置
 *
 * 公式：enterBoundary(slotIndex, position) = (position === startPos) ? 0 : 2 × (itemCount + position - slotIndex)
 * position(slotIndex, boundary) = max { position ≥ startPos | boundary ≥ enterBoundary(slotIndex, position) }
 */
const getSlotPosition = (slotIndex: number, itemCount: number, boundary: number): number => {
  const startPos = Math.max(0, slotIndex - itemCount)
  for (let pos = 3; pos >= startPos; pos--) {
    const enterPos = (pos === startPos) ? 0 : 2 * (itemCount + pos - slotIndex)
    if (boundary >= enterPos) return pos
  }
  return startPos
}

// ── timeline 构建 ──

interface I_SlotTimelineSegment {
  durationSeconds: number
  keySplines: string
  isCenterHold: boolean
  toPos: number
}

/** 枚举一个 slot 在完整周期内的所有 segment */
const enumerateSlotSegments = (
  slotIndex: number,
  itemCount: number,
  items: I_NormalizedCarouselItem[],
): I_SlotTimelineSegment[] => {
  const totalSegs = itemCount * 2
  const segments: I_SlotTimelineSegment[] = []

  for (let seg = 0; seg < totalSegs; seg++) {
    const rhythmItem = items[Math.floor(seg / 2) % itemCount]
    const isSwitch = seg % 2 === 0
    const toPos = getSlotPosition(slotIndex, itemCount, seg + 1)
    const fromPos = getSlotPosition(slotIndex, itemCount, seg)

    segments.push({
      durationSeconds: isSwitch ? rhythmItem.switchDuration : rhythmItem.stayDuration,
      keySplines: rhythmItem.keySplines,
      isCenterHold: fromPos === 2 && toPos === 2,
      toPos,
    })
  }

  return segments
}

/** 把 stay 配置展开到一段 center hold 时长内 */
const expandStayTimeline = <T, >(
  stay: { value: T } | { timeline: I_TimelineKeyframe<T>[] } | 'hold',
  baseValue: T,
  duration: number,
  keySplines: string,
): I_TimelineKeyframe<T>[] => {
  if (stay === 'hold') {
    return [{ toAbs: baseValue, durationSeconds: duration }]
  }

  if ('value' in stay) {
    return [{ toAbs: stay.value, durationSeconds: duration, keySplines }]
  }

  const result: I_TimelineKeyframe<T>[] = []
  let remaining = duration
  for (const kf of stay.timeline) {
    result.push({
      toAbs: kf.toAbs,
      durationSeconds: kf.durationSeconds,
      keySplines: defaultTo(kf.keySplines, keySplines),
    })
    remaining -= kf.durationSeconds
  }
  if (remaining > 0) {
    const lastToAbs = stay.timeline.length > 0 ? stay.timeline[stay.timeline.length - 1].toAbs : baseValue
    result.push({ toAbs: lastToAbs, durationSeconds: remaining })
  }
  return result
}

/** 构建单个 slot 的数值通道 timeline */
const buildSlotValueTimeline = <T, >(
  segments: I_SlotTimelineSegment[],
  valueAt: (pos: number) => T,
  stay: { value: T } | { timeline: I_TimelineKeyframe<T>[] } | 'hold',
  initValue: T,
): I_TimelineKeyframe<T>[] => {
  const timeline: I_TimelineKeyframe<T>[] = []

  for (const seg of segments) {
    if (seg.isCenterHold && stay !== 'hold') {
      const centerValue = valueAt(2)
      const expanded = expandStayTimeline(stay, centerValue, seg.durationSeconds, seg.keySplines)
      timeline.push(...expanded)
    } else {
      timeline.push({ toAbs: valueAt(seg.toPos), durationSeconds: seg.durationSeconds, keySplines: seg.keySplines })
    }
  }

  return timeline
}

/** 构建单个 slot 的主 translate timeline（含 stay 叠加） */
const buildSlotTranslateTimeline = (
  segments: I_SlotTimelineSegment[],
  positions: Partial<I_TranslateValue>[],
  stay: I_NormalizedTranslateChannel['stay'],
  initValue: Partial<I_TranslateValue>,
): I_TimelineKeyframe<Partial<I_TranslateValue>>[] => {
  const timeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []

  for (const seg of segments) {
    if (seg.isCenterHold && stay !== 'hold') {
      const centerValue = positions[2]
      if ('value' in stay) {
        timeline.push({
          toAbs: { x: (centerValue.x ?? 0) + stay.value.x, y: (centerValue.y ?? 0) + stay.value.y },
          durationSeconds: seg.durationSeconds,
          keySplines: seg.keySplines,
        })
      } else {
        let remaining = seg.durationSeconds
        for (const kf of stay.timeline) {
          timeline.push({
            toAbs: { x: (centerValue.x ?? 0) + kf.toAbs.x, y: (centerValue.y ?? 0) + kf.toAbs.y },
            durationSeconds: kf.durationSeconds,
            keySplines: defaultTo(kf.keySplines, seg.keySplines),
          })
          remaining -= kf.durationSeconds
        }
        if (remaining > 0) {
          const last = stay.timeline.length > 0 ? stay.timeline[stay.timeline.length - 1].toAbs : { x: 0, y: 0 }
          timeline.push({
            toAbs: { x: (centerValue.x ?? 0) + last.x, y: (centerValue.y ?? 0) + last.y },
            durationSeconds: remaining,
          })
        }
      }
    } else {
      timeline.push({ toAbs: positions[seg.toPos], durationSeconds: seg.durationSeconds, keySplines: seg.keySplines })
    }
  }

  return timeline
}

// ── 渲染内容 ──

const renderContent = (item: I_NormalizedCarouselItem, w: number, h: number) => {
  if (item.useJsx) return item.jsx
  return (
    <SvgEx viewBox={`0 0 ${w} ${h}`}
      style={{
        display: 'block',
        backgroundImage: svgURL(item.url as string),
        backgroundSize: '100% auto',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
      width="100%"
    />
  )
}

// ── 主组件 ──

const AnyCarousel = (props: {
  canvasSize: { w: number; h: number }
  childItems: I_AnyCarouselChildItem[]
  itemCanvasSize?: { w: number; h: number }
  angle?: number
  itemGap?: number
  isReversed?: boolean
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.childItems) || props.childItems.length === 0) return null

  const { w: viewBoxW, h: viewBoxH } = props.canvasSize
  const canvas = defaultTo(props.itemCanvasSize, props.canvasSize)
  const { w: itemW, h: itemH } = canvas
  const angle = defaultTo(props.angle, DEFAULT_ANGLE)
  const isReversed = defaultTo(props.isReversed, false)
  const isDev = ExPubGoConfig().mode === 'development'

  const actualAngle = isReversed ? angle + 180 : angle

  const items = normalizeItems(props.childItems)
  const N = items.length
  const totalSlots = N + 3

  const gap = defaultTo(props.itemGap, 0)
  const positions = calcSlotPositions(actualAngle, itemW, itemH, gap)
  const exitOffset = calcExitOffset(actualAngle, viewBoxW, viewBoxH, itemW, itemH, gap)
  const fullPositions = [...positions]
  fullPositions[3] = exitOffset

  const contentOffsetX = -itemW / 2
  const contentOffsetY = -itemH / 2

  // ── 渲染单个 slot ──
  const renderSlot = (slotIndex: number) => {
    const itemIdx = (N + 1 - slotIndex + N * 10) % N
    const item = items[itemIdx]
    const startPos = Math.max(0, slotIndex - N)
    const segments = enumerateSlotSegments(slotIndex, N, items)

    const translateTimeline = buildSlotTranslateTimeline(
      segments,
      fullPositions,
      item.translate.stay,
      fullPositions[startPos],
    )

    const valueAtForChannel = (channel: I_NormalizedAnimChannel | undefined, pos: number): number => {
      if (isNil(channel)) return 1
      if (pos === 2) return channel.centerValue
      if (pos === 3) return channel.exitValue
      return channel.sideValue
    }

    const scaleTimeline = isNil(item.scale) ? undefined : buildSlotValueTimeline(
      segments,
      pos => valueAtForChannel(item.scale, pos),
      item.scale.stay,
      valueAtForChannel(item.scale, startPos),
    )

    const opacityTimeline = isNil(item.opacity) ? undefined : buildSlotValueTimeline(
      segments,
      pos => valueAtForChannel(item.opacity, pos),
      item.opacity.stay,
      valueAtForChannel(item.opacity, startPos),
    )

    const rotationTimeline = isNil(item.rotation) ? undefined : buildSlotValueTimeline(
      segments,
      pos => valueAtForChannel(item.rotation, pos),
      item.rotation.stay,
      valueAtForChannel(item.rotation, startPos),
    )

    const skewXTimeline = isNil(item.skewX) ? undefined : buildSlotValueTimeline(
      segments,
      pos => valueAtForChannel(item.skewX, pos),
      item.skewX.stay,
      valueAtForChannel(item.skewX, startPos),
    )

    const skewYTimeline = isNil(item.skewY) ? undefined : buildSlotValueTimeline(
      segments,
      pos => valueAtForChannel(item.skewY, pos),
      item.skewY.stay,
      valueAtForChannel(item.skewY, startPos),
    )

    const rotationOrigin = isNil(item.rotation)
      ? undefined
      : resolveRotationOrigin({ origin: item.rotation.origin, cardWidth: itemW, cardHeight: itemH })

    const scaleOrigin = isNil(item.scale)
      ? undefined
      : resolveRotationOrigin({ origin: item.scale.origin, cardWidth: itemW, cardHeight: itemH })

    return (
      <g key={slotIndex}>
        {transformTranslate({
          initValue: fullPositions[startPos],
          timeline: translateTimeline,
          begin: '0s',
          loopCount: 0,
          isFreeze: true,
          isAdditive: false,
        })}
        <g>
          {isDefined(opacityTimeline) && animateOpacity({
            initValue: valueAtForChannel(item.opacity, startPos),
            timeline: opacityTimeline,
            begin: '0s',
            loopCount: 0,
            isFreeze: true,
          })}
          <g>
            {isDefined(scaleTimeline) && isDefined(scaleOrigin) && transformScale({
              initValue: valueAtForChannel(item.scale, startPos),
              timeline: scaleTimeline,
              origin: scaleOrigin,
              begin: '0s',
              loopCount: 0,
              isFreeze: true,
              isAdditive: false,
            })}
            <g transform={`translate(${contentOffsetX}, ${contentOffsetY})`}>
              <g>
                {isDefined(skewXTimeline) && transformSkewX({
                  initValue: valueAtForChannel(item.skewX, startPos),
                  timeline: skewXTimeline,
                  begin: '0s',
                  loopCount: 0,
                  isFreeze: true,
                  isAdditive: false,
                })}
                <g>
                  {isDefined(skewYTimeline) && transformSkewY({
                    initValue: valueAtForChannel(item.skewY, startPos),
                    timeline: skewYTimeline,
                    begin: '0s',
                    loopCount: 0,
                    isFreeze: true,
                    isAdditive: false,
                  })}
                  <g>
                    {isDefined(rotationTimeline) && isDefined(rotationOrigin) && transformRotate({
                      initValue: valueAtForChannel(item.rotation, startPos),
                      timeline: rotationTimeline,
                      origin: rotationOrigin,
                      begin: '0s',
                      loopCount: 0,
                      isFreeze: true,
                      isAdditive: false,
                    })}
                    <foreignObject x={0} y={0} width={itemW} height={itemH}>
                      {renderContent(item, itemW, itemH)}
                    </foreignObject>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    )
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-carousel' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "none", overflow: "hidden", width: "100%", maxWidth: "100%",
        textAlign: "center", lineHeight: 0, ...spacingResult,
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }}
          width="100%"
        >
          <g transform={`translate(${viewBoxW / 2}, ${viewBoxH / 2})`}>
            <g visibility="hidden">
              <set attributeName="visibility" to="visible" begin="0.01s" fill="freeze" />
              {/* center slot 最后渲染，确保 center item 始终在最上层 */}
              {Array.from({ length: totalSlots }, (_, i) => i)
                .filter(i => i !== N + 1)
                .concat([N + 1])
                .map(i => renderSlot(i))}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnyCarousel
