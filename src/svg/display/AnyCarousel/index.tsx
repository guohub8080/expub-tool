import React from 'react'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import floor from 'lodash/floor'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { transformTranslate } from '@smil/index'
import { transformScaleRaw } from '@smil/index'
import { transformRotate } from '@smil/index'
import { transformSkewX } from '@smil/index'
import { transformSkewY } from '@smil/index'
import isPlainObject from 'lodash/isPlainObject'
import { isDefined } from '@utils/fn/isDefined'
import type { T_Origin } from '@svg/types'
import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { I_TranslateValue } from '@smil/animateTransform/translate'
import { normalizeItems } from './utils/normalizer'
import { calcStepVector, calcCenterPosition, toSwitchPhases } from './timeline/offsetCalculator'
import { buildCyclicTimelines } from '@utils/svg/buildCyclicTimelines'
import type { I_AnyCarouselChildItem, I_NormalizedCarouselItem, I_NormalizedAnimChannel, I_NormalizedOriginChannel } from './types'
import { DEFAULT_ANGLE, DEFAULT_ITEM_GAP } from './types'

// ── origin 解析 ──

const resolveOrigin = (origin: T_Origin, w: number, h: number): [number, number] => {
  if (isPlainObject(origin)) {
    const { x, y } = origin as { x: number; y: number }
    return [x, y]
  }
  const grid: Record<string, [number, number]> = {
    TopLeft: [0, 0], Top: [w / 2, 0], TopRight: [w, 0],
    Left: [0, h / 2], Center: [w / 2, h / 2], Right: [w, h / 2],
    BottomLeft: [0, h], Bottom: [w / 2, h], BottomRight: [w, h],
  }
  return grid[origin as string]
}

// ── slot timeline 构建 ──

const resolveStayValue = (stay: I_NormalizedAnimChannel['stay'], centerValue: number): number => {
  if (stay === 'hold') return centerValue
  if ('value' in stay) return stay.value
  if ('timeline' in stay && stay.timeline.length > 0) {
    return stay.timeline[stay.timeline.length - 1].toAbs
  }
  return centerValue
}

/**
 * 计算 slot 在某段的目标值
 *
 * activeIdx=0（初始中心）：initValue=centerValue，seg=0 缩回 sideValue
 * 其他 slot：在 enterSeg 到达 centerValue，staySeg 停留，exitSeg 缩回
 */
const calcSegTarget = (
  seg: number, activeIdx: number, N: number,
  sideValue: number, centerValue: number, stay: I_NormalizedAnimChannel['stay'],
): number => {
  if (activeIdx === 0) {
    if (seg === 0) return sideValue
    if (seg === 1) return resolveStayValue(stay, centerValue)
    return sideValue
  }
  const enterSeg = (activeIdx - 1) * 2
  const staySeg = enterSeg + 1
  const exitSeg = enterSeg + 2
  if (seg === enterSeg) return centerValue
  if (seg === staySeg) return resolveStayValue(stay, centerValue)
  if (seg === exitSeg) return sideValue
  return sideValue
}

/** 构建 slot 单通道的 N×2 段 timeline */
function buildSlotChannelTimeline(params: {
  activeIdx: number
  N: number
  items: I_NormalizedCarouselItem[]
  channel: I_NormalizedAnimChannel
}): I_TimelineKeyframe<number>[] {
  const { activeIdx, N, items, channel } = params
  const { sideValue, centerValue, stay } = channel
  const totalSegs = N * 2
  const timeline: I_TimelineKeyframe<number>[] = []

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const splines = isSwitch ? item.keySplines : undefined

    timeline.push({
      toAbs: calcSegTarget(seg, activeIdx, N, sideValue, centerValue, stay),
      durationSeconds: dur,
      ...(splines ? { keySplines: splines } : {}),
    })
  }

  return timeline
}

/** 构建 scale 的 translate 补偿 timeline */
function buildSlotTranslateTimeline(params: {
  activeIdx: number
  N: number
  items: I_NormalizedCarouselItem[]
  scaleConfig: I_NormalizedOriginChannel
  itemW: number
  itemH: number
}): I_TimelineKeyframe<Partial<I_TranslateValue>>[] {
  const { activeIdx, N, items, scaleConfig, itemW, itemH } = params
  const { sideValue, centerValue, stay } = scaleConfig
  const totalSegs = N * 2
  const timeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const splines = isSwitch ? item.keySplines : undefined

    const scaleAtSeg = calcSegTarget(seg, activeIdx, N, sideValue, centerValue, stay)
    const dx = -itemW * (scaleAtSeg - 1) / 2
    const dy = -itemH * (scaleAtSeg - 1) / 2

    timeline.push({ toAbs: { x: dx, y: dy }, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }

  return timeline
}

// ── slot 布局 ──

interface ISlotInfo {
  itemIdx: number
  x: number
  y: number
}

/**
 * 生成 N+5 个 slot（比 N+3 多 2 个副本，保证循环首尾 peek 一致）
 *
 * slot[1]..slot[N] 对应 items[0]..items[N-1]，依次到达中心位置
 * slot[0]、slot[N+1]..slot[N+4] 为边界副本
 */
function buildSlotLayout(params: {
  N: number
  center: { x: number; y: number }
  step: { x: number; y: number }
  isReversed: boolean
}): ISlotInfo[] {
  const { N, center, step, isReversed } = params
  const totalSlots = N + 5
  const slots: ISlotInfo[] = []
  const sign = isReversed ? -1 : 1

  for (let i = 0; i < totalSlots; i++) {
    const itemIdx = (i - 1 + N * 10) % N // slot[1] = items[0]
    const offset = i - 1 // slot[1] offset = 0（中心）
    slots.push({
      itemIdx,
      x: center.x - sign * offset * step.x,
      y: center.y - sign * offset * step.y,
    })
  }

  return slots
}

/**
 * slot 是否为边界（不做动画，不生成 Ghost）
 *
 * N+5 布局：前 2 个 + 后 2 个为边界
 */
const isEdgeSlot = (si: number, totalSlots: number): boolean => {
  return si < 2 || si >= totalSlots - 2
}

// ── opacity 辅助 ──

function buildOpacityKeyTimes(N: number, items: I_NormalizedCarouselItem[]): string {
  const totalSegs = N * 2
  let totalDur = 0
  const durs: number[] = []
  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]
    const dur = seg % 2 === 0 ? item.switchDuration : item.stayDuration
    durs.push(dur)
    totalDur += dur
  }
  const times: string[] = ['0']
  let acc = 0
  for (let seg = 0; seg < totalSegs; seg++) {
    acc += durs[seg]
    times.push((acc / totalDur).toFixed(6))
  }
  return times.join(';')
}

function buildOpacityKeySplines(
  activeIdx: number, N: number, items: I_NormalizedCarouselItem[], channel: I_NormalizedAnimChannel,
): string {
  const { sideValue, centerValue } = channel
  const totalSegs = N * 2
  const defaultSpline = "0.42 0 0.58 1"
  const linearSpline = "0 0 1 1"
  const splines: string[] = []

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]

    const cur = calcSegTarget(seg, activeIdx, N, sideValue, centerValue, channel.stay)
    const prev = seg === 0
      ? (activeIdx === 0 ? centerValue : sideValue)
      : calcSegTarget(seg - 1, activeIdx, N, sideValue, centerValue, channel.stay)

    splines.push(cur !== prev ? (item.keySplines || defaultSpline) : linearSpline)
  }

  return splines.join(';')
}

function buildOpacityValues(
  activeIdx: number, N: number, items: I_NormalizedCarouselItem[], channel: I_NormalizedAnimChannel,
): string {
  const { sideValue, centerValue, stay } = channel
  const totalSegs = N * 2
  const values: string[] = [String(activeIdx === 0 ? centerValue : sideValue)]

  for (let seg = 0; seg < totalSegs; seg++) {
    values.push(String(calcSegTarget(seg, activeIdx, N, sideValue, centerValue, stay)))
  }

  return values.join(';')
}

/** 构建 Ghost 层的 opacity timeline（只在对应 slot 到达中心时可见） */
function buildGhostOpacityValues(
  activeIdx: number, N: number, items: I_NormalizedCarouselItem[],
): string {
  const totalSegs = N * 2
  // initValue：初始中心（activeIdx=0）时为 1，否则为 0
  const values: string[] = [String(activeIdx === 0 ? 1 : 0)]

  for (let seg = 0; seg < totalSegs; seg++) {
    // slot 在 enter+stay 段（到达中心期间）opacity=1，其余=0
    if (activeIdx === 0) {
      values.push(seg <= 1 ? '1' : '0')
    } else {
      const enterSeg = (activeIdx - 1) * 2
      const staySeg = enterSeg + 1
      values.push(seg === enterSeg || seg === staySeg ? '1' : '0')
    }
  }

  return values.join(';')
}

function buildGhostOpacityKeySplines(
  activeIdx: number, N: number, items: I_NormalizedCarouselItem[],
): string {
  const totalSegs = N * 2
  const discreteSpline = "0 0 1 1"
  const splines: string[] = []

  for (let seg = 0; seg < totalSegs; seg++) {
    splines.push(discreteSpline)
  }

  return splines.join(';')
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

/** 构建 slot 的动画层（scale / opacity / rotation / skewX / skewY） */
const buildAnimLayers = (params: {
  item: I_NormalizedCarouselItem
  activeIdx: number
  isInitCenter: boolean
  N: number
  items: I_NormalizedCarouselItem[]
  itemW: number
  itemH: number
  totalDuration: number
  content: React.ReactNode
}): React.ReactNode => {
  const { item, activeIdx, isInitCenter, N, items, itemW, itemH, totalDuration, content } = params
  const { opacity, rotation, scale, skewX, skewY } = item
  let result = content

  // ── opacity ──
  if (isDefined(opacity)) {
    result = (
      <g>
        <animate
          attributeName="opacity"
          values={buildOpacityValues(activeIdx, N, items, opacity)}
          keyTimes={buildOpacityKeyTimes(N, items)}
          keySplines={buildOpacityKeySplines(activeIdx, N, items, opacity)}
          dur={`${totalDuration}s`}
          calcMode="spline"
          repeatCount="indefinite"
          begin="0s"
          fill="freeze"
        />
        {result}
      </g>
    )
  }

  // ── rotation ──
  if (isDefined(rotation)) {
    const [ox, oy] = resolveOrigin(rotation.origin, itemW, itemH)
    const rotTimeline = buildSlotChannelTimeline({ activeIdx, N, items, channel: rotation })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformRotate({
            initValue: isInitCenter ? rotation.centerValue : rotation.sideValue,
            timeline: rotTimeline,
            origin: [0, 0],
            begin: '0s',
            loopCount: 0,
            isFreeze: true,
            isAdditive: false,
          })}
          <g transform={`translate(${-ox}, ${-oy})`}>
            {result}
          </g>
        </g>
      </g>
    )
  }

  // ── scale ──
  if (isDefined(scale)) {
    const [ox, oy] = resolveOrigin(scale.origin, itemW, itemH)
    const scaleTimeline = buildSlotChannelTimeline({ activeIdx, N, items, channel: scale })
    const translateTimeline = buildSlotTranslateTimeline({ activeIdx, N, items, scaleConfig: scale, itemW, itemH })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformScaleRaw({
            initValue: isInitCenter ? scale.centerValue : scale.sideValue,
            timeline: scaleTimeline,
            begin: '0s',
            loopCount: 0,
            isFreeze: true,
            isAdditive: false,
          })}
          <g transform={`translate(${-ox}, ${-oy})`}>
            <g>
              {transformTranslate({
                initValue: isInitCenter
                  ? { x: -itemW * (scale.centerValue - 1) / 2, y: -itemH * (scale.centerValue - 1) / 2 }
                  : { x: 0, y: 0 },
                timeline: translateTimeline,
                begin: '0s',
                loopCount: 0,
                isFreeze: true,
                isAdditive: false,
              })}
              {result}
            </g>
          </g>
        </g>
      </g>
    )
  }

  // ── skewY ──
  if (isDefined(skewY)) {
    const [ox, oy] = resolveOrigin(skewY.origin, itemW, itemH)
    const skewTimeline = buildSlotChannelTimeline({ activeIdx, N, items, channel: skewY })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformSkewY({
            initValue: isInitCenter ? skewY.centerValue : skewY.sideValue,
            timeline: skewTimeline,
            begin: '0s',
            loopCount: 0,
            isFreeze: true,
            isAdditive: false,
          })}
          <g transform={`translate(${-ox}, ${-oy})`}>
            {result}
          </g>
        </g>
      </g>
    )
  }

  // ── skewX ──
  if (isDefined(skewX)) {
    const [ox, oy] = resolveOrigin(skewX.origin, itemW, itemH)
    const skewTimeline = buildSlotChannelTimeline({ activeIdx, N, items, channel: skewX })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformSkewX({
            initValue: isInitCenter ? skewX.centerValue : skewX.sideValue,
            timeline: skewTimeline,
            begin: '0s',
            loopCount: 0,
            isFreeze: true,
            isAdditive: false,
          })}
          <g transform={`translate(${-ox}, ${-oy})`}>
            {result}
          </g>
        </g>
      </g>
    )
  }

  return result
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
  const gap = defaultTo(props.itemGap, DEFAULT_ITEM_GAP)
  const isReversed = defaultTo(props.isReversed, false)
  const isDev = ExPubGoConfig().mode === 'development'

  const items = normalizeItems(props.childItems)
  const N = items.length

  const step = calcStepVector(angle, itemW, itemH, gap)
  const center = calcCenterPosition(viewBoxW, viewBoxH, itemW, itemH)
  const slots = buildSlotLayout({ N, center, step, isReversed })
  const totalSlots = N + 5
  const { totalDuration } = buildCyclicTimelines(toSwitchPhases(items))

  // outerTranslate timeline
  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const delta = i + 1
    const target = isReversed
      ? { x: -delta * step.x, y: -delta * step.y }
      : { x: delta * step.x, y: delta * step.y }
    outerTimeline.push({ toAbs: target, durationSeconds: item.switchDuration, keySplines: item.keySplines })
    outerTimeline.push({ toAbs: target, durationSeconds: item.stayDuration })
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-carousel' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult,
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }}
          width="100%"
        >
          <g>
            {/* ══════ 普通 slot（含边界副本）══════ */}
            {slots.map((slot, si) => {
              const activeIdx = si - 1
              const edge = isEdgeSlot(si, totalSlots)
              const isInitCenter = activeIdx === 0
              const item = items[slot.itemIdx]

              const baseContent = (
                <foreignObject x={0} y={0} width={itemW} height={itemH}>
                  {renderContent(item, itemW, itemH)}
                </foreignObject>
              )

              const content = edge
                ? baseContent
                : buildAnimLayers({
                    item, activeIdx, isInitCenter, N, items, itemW, itemH, totalDuration,
                    content: baseContent,
                  })

              return (
                <g key={`slot-${si}`} transform={`translate(${slot.x},${slot.y})`}>
                  {content}
                </g>
              )
            })}

            {/* ══════ Ghost 层（z 序最高，只在对应 slot 到达中心时可见）══════ */}
            {slots.slice(1, N + 1).map((slot, gi) => {
              const activeIdx = gi // slot[1] → activeIdx=0, slot[2] → activeIdx=1, ...
              const isInitCenter = activeIdx === 0
              const item = items[slot.itemIdx]

              const baseContent = (
                <foreignObject x={0} y={0} width={itemW} height={itemH}>
                  {renderContent(item, itemW, itemH)}
                </foreignObject>
              )

              const animatedContent = buildAnimLayers({
                item, activeIdx, isInitCenter, N, items, itemW, itemH, totalDuration,
                content: baseContent,
              })

              return (
                <g key={`ghost-${gi}`} transform={`translate(${slot.x},${slot.y})`}>
                  <g>
                    <animate
                      attributeName="opacity"
                      values={buildGhostOpacityValues(activeIdx, N, items)}
                      keyTimes={buildOpacityKeyTimes(N, items)}
                      keySplines={buildGhostOpacityKeySplines(activeIdx, N, items)}
                      dur={`${totalDuration}s`}
                      calcMode="spline"
                      repeatCount="indefinite"
                      begin="0s"
                      fill="freeze"
                    />
                    {animatedContent}
                  </g>
                </g>
              )
            })}

            {/* outerTranslate */}
            {transformTranslate({
              initValue: { x: 0, y: 0 },
              timeline: outerTimeline,
              begin: '0s',
              loopCount: 0,
              isFreeze: true,
              isAdditive: true,
            })}
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnyCarousel
