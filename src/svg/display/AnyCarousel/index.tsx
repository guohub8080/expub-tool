import React from 'react'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import isPlainObject from 'lodash/isPlainObject'
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
import { isDefined } from '@utils/fn/isDefined'
import type { T_Origin } from '@svg/types'
import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { I_TranslateValue } from '@smil/animateTransform/translate'
import { normalizeItems } from './utils/normalizer'
import { calcEntryOffset, calcExitOffset, toSwitchPhases } from './timeline/offsetCalculator'
import { buildCyclicTimelines } from '@utils/svg/buildCyclicTimelines'
import type { I_AnyCarouselChildItem, I_NormalizedCarouselItem, I_NormalizedAnimChannel, I_NormalizedOriginChannel, I_NormalizedTranslateChannel } from './types'
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

// ── 通道 timeline 构建 ──

const resolveStayValue = (stay: I_NormalizedAnimChannel['stay'], centerValue: number): number => {
  if (stay === 'hold') return centerValue
  if ('value' in stay) return stay.value
  if ('timeline' in stay && stay.timeline.length > 0) return stay.timeline[stay.timeline.length - 1].toAbs
  return centerValue
}

/** 构建 item 的 translate timeline（4 阶段） */
function buildTranslateTimeline(params: {
  entryDuration: number
  stayDuration: number
  exitDuration: number
  holdDuration: number
  entryOffset: { x: number; y: number }
  exitOffset: { x: number; y: number }
  translateConfig: I_NormalizedTranslateChannel
  keySplines: string
}): I_TimelineKeyframe<Partial<I_TranslateValue>>[] {
  const { entryDuration, stayDuration, exitDuration, holdDuration, entryOffset, exitOffset, translateConfig, keySplines } = params
  const timeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  const spl = defaultTo(translateConfig.keySplines, keySplines)

  // 1. entry：从 entryOffset 滑到中心
  timeline.push({ toAbs: { x: 0, y: 0 }, durationSeconds: entryDuration, keySplines: spl })

  // 2. stay
  if (translateConfig.stay === 'hold') {
    timeline.push({ toAbs: { x: 0, y: 0 }, durationSeconds: stayDuration })
  } else if ('value' in translateConfig.stay) {
    timeline.push({ toAbs: translateConfig.stay.value, durationSeconds: stayDuration })
  } else {
    for (const seg of translateConfig.stay.timeline) {
      timeline.push({ toAbs: seg.toAbs, durationSeconds: seg.durationSeconds, keySplines: seg.keySplines })
    }
    // 如果 timeline 总时长 < stayDuration，补 hold
    const total = translateConfig.stay.timeline.reduce((s, seg) => s + seg.durationSeconds, 0)
    const remaining = stayDuration - total
    if (remaining > 0) {
      const lastVal = translateConfig.stay.timeline[translateConfig.stay.timeline.length - 1].toAbs
      timeline.push({ toAbs: lastVal, durationSeconds: remaining })
    }
  }

  // 3. exit：从中心滑到 exitOffset
  timeline.push({ toAbs: exitOffset, durationSeconds: exitDuration, keySplines: spl })

  // 4. hold：停在 exitOffset
  if (holdDuration > 0) {
    timeline.push({ toAbs: exitOffset, durationSeconds: holdDuration })
  }

  return timeline
}

/** 构建单通道的 4 阶段 timeline（scale / opacity / rotation / skew） */
function buildChannelTimeline(params: {
  entryDuration: number
  stayDuration: number
  exitDuration: number
  holdDuration: number
  channel: I_NormalizedAnimChannel
  keySplines: string
}): I_TimelineKeyframe<number>[] {
  const { entryDuration, stayDuration, exitDuration, holdDuration, channel, keySplines } = params
  const { sideValue, centerValue, stay } = channel
  const timeline: I_TimelineKeyframe<number>[] = []

  // 1. entry：sideValue → centerValue
  timeline.push({ toAbs: centerValue, durationSeconds: entryDuration, keySplines })

  // 2. stay
  const stayTarget = resolveStayValue(stay, centerValue)
  if (stay === 'hold') {
    timeline.push({ toAbs: stayTarget, durationSeconds: stayDuration })
  } else if ('value' in stay) {
    timeline.push({ toAbs: stay.value, durationSeconds: stayDuration })
  } else {
    for (const seg of stay.timeline) {
      timeline.push({ toAbs: seg.toAbs, durationSeconds: seg.durationSeconds, keySplines: seg.keySplines })
    }
    const total = stay.timeline.reduce((s, seg) => s + seg.durationSeconds, 0)
    const remaining = stayDuration - total
    if (remaining > 0) {
      timeline.push({ toAbs: stay.timeline[stay.timeline.length - 1].toAbs, durationSeconds: remaining })
    }
  }

  // 3. exit：centerValue → sideValue
  timeline.push({ toAbs: sideValue, durationSeconds: exitDuration, keySplines })

  // 4. hold
  if (holdDuration > 0) {
    timeline.push({ toAbs: sideValue, durationSeconds: holdDuration })
  }

  return timeline
}

/** 构建 scale 的 translate 补偿 timeline */
function buildScaleTranslateTimeline(params: {
  entryDuration: number
  stayDuration: number
  exitDuration: number
  holdDuration: number
  scaleConfig: I_NormalizedOriginChannel
  itemW: number
  itemH: number
  keySplines: string
}): I_TimelineKeyframe<Partial<I_TranslateValue>>[] {
  const { entryDuration, stayDuration, exitDuration, holdDuration, scaleConfig, itemW, itemH, keySplines } = params
  const { sideValue, centerValue, stay } = scaleConfig
  const timeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []

  const scaleEntry = buildChannelTimeline({ entryDuration, stayDuration, exitDuration, holdDuration, channel: scaleConfig, keySplines })

  for (const seg of scaleEntry) {
    const s = seg.toAbs
    timeline.push({ toAbs: { x: -itemW * (s - 1) / 2, y: -itemH * (s - 1) / 2 }, durationSeconds: seg.durationSeconds, keySplines: seg.keySplines })
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

/** 构建单个 item 的全部动画层 */
const buildAnimLayers = (params: {
  item: I_NormalizedCarouselItem
  itemW: number
  itemH: number
  entryOffset: { x: number; y: number }
  exitOffset: { x: number; y: number }
  entryDuration: number
  stayDuration: number
  exitDuration: number
  holdDuration: number
  begin: number
  totalDuration: number
}): React.ReactNode => {
  const {
    item, itemW, itemH, entryOffset, exitOffset,
    entryDuration, stayDuration, exitDuration, holdDuration,
    begin, totalDuration,
  } = params

  const content = (
    <foreignObject x={0} y={0} width={itemW} height={itemH}>
      {renderContent(item, itemW, itemH)}
    </foreignObject>
  )

  let result: React.ReactNode = content
  const { opacity, rotation, scale, skewX, skewY, translate: translateConfig } = item
  const ks = item.keySplines

  // ── translate：每个 item 自己的进出位移 ──
  const translateTimeline = buildTranslateTimeline({
    entryDuration, stayDuration, exitDuration, holdDuration,
    entryOffset, exitOffset, translateConfig, keySplines: ks,
  })
  const translateInit = entryOffset
  const translateAnim = transformTranslate({
    initValue: translateInit,
    timeline: translateTimeline,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
    isAdditive: false,
  })

  // ── opacity ──
  if (isDefined(opacity)) {
    const chTimeline = buildChannelTimeline({ entryDuration, stayDuration, exitDuration, holdDuration, channel: opacity, keySplines: ks })
    // opacity 用 <animate> 而非 animateTransform
    result = (
      <g>
        <animate
          attributeName="opacity"
          values={[opacity.sideValue, ...chTimeline.map(s => s.toAbs)].join(';')}
          keyTimes={buildKeyTimes(chTimeline)}
          keySplines={chTimeline.map(s => s.keySplines || '0 0 1 1').join(';')}
          dur={`${totalDuration}s`}
          calcMode="spline"
          repeatCount="indefinite"
          begin={`${begin}s`}
          fill="freeze"
        />
        {content}
      </g>
    )
  }

  // ── rotation ──
  if (isDefined(rotation)) {
    const [ox, oy] = resolveOrigin(rotation.origin, itemW, itemH)
    const chTimeline = buildChannelTimeline({ entryDuration, stayDuration, exitDuration, holdDuration, channel: rotation, keySplines: ks })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformRotate({
            initValue: rotation.sideValue,
            timeline: chTimeline,
            origin: [0, 0],
            begin: `${begin}s`,
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
    const chTimeline = buildChannelTimeline({ entryDuration, stayDuration, exitDuration, holdDuration, channel: scale, keySplines: ks })
    const translateComp = buildScaleTranslateTimeline({ entryDuration, stayDuration, exitDuration, holdDuration, scaleConfig: scale, itemW, itemH, keySplines: ks })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformScaleRaw({
            initValue: scale.sideValue,
            timeline: chTimeline,
            begin: `${begin}s`,
            loopCount: 0,
            isFreeze: true,
            isAdditive: false,
          })}
          <g transform={`translate(${-ox}, ${-oy})`}>
            <g>
              {transformTranslate({
                initValue: { x: -itemW * (scale.sideValue - 1) / 2, y: -itemH * (scale.sideValue - 1) / 2 },
                timeline: translateComp,
                begin: `${begin}s`,
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
    const chTimeline = buildChannelTimeline({ entryDuration, stayDuration, exitDuration, holdDuration, channel: skewY, keySplines: ks })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformSkewY({
            initValue: skewY.sideValue,
            timeline: chTimeline,
            begin: `${begin}s`,
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
    const chTimeline = buildChannelTimeline({ entryDuration, stayDuration, exitDuration, holdDuration, channel: skewX, keySplines: ks })
    result = (
      <g transform={`translate(${ox}, ${oy})`}>
        <g>
          {transformSkewX({
            initValue: skewX.sideValue,
            timeline: chTimeline,
            begin: `${begin}s`,
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

  return (
    <g>
      {translateAnim}
      {result}
    </g>
  )
}

// ── 辅助 ──

function buildKeyTimes(timeline: I_TimelineKeyframe<number>[]): string {
  const totalDur = timeline.reduce((s, seg) => s + seg.durationSeconds, 0)
  const times: string[] = ['0']
  let acc = 0
  for (const seg of timeline) {
    acc += seg.durationSeconds
    times.push((acc / totalDur).toFixed(6))
  }
  return times.join(';')
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
  const actualAngle = isReversed ? angle + 180 : angle

  // 每个 item 的 entry/exit 偏移
  const getOffsets = (item: I_NormalizedCarouselItem) => {
    const dist = item.translate.distance
    return {
      entryOffset: calcEntryOffset(actualAngle, itemW, itemH, gap, dist),
      exitOffset: calcExitOffset(actualAngle, itemW, itemH, gap, dist),
    }
  }

  const { totalDuration, itemTimelines, ghostTimeline } = buildCyclicTimelines(toSwitchPhases(items))

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
          <g transform={`translate(${(viewBoxW - itemW) / 2}, ${(viewBoxH - itemH) / 2})`}>
            <g visibility="hidden">
              <set attributeName="visibility" to="visible" begin="0.01s" fill="freeze" />

              {items.map((item, i) => {
                const tl = itemTimelines[i]
                const { entryOffset, exitOffset } = getOffsets(item)

                return (
                  <g key={i}>
                    {buildAnimLayers({
                      item, itemW, itemH, entryOffset, exitOffset,
                      entryDuration: tl.entryDuration,
                      stayDuration: tl.stayDuration,
                      exitDuration: tl.exitDuration,
                      holdDuration: tl.holdDuration,
                      begin: tl.begin,
                      totalDuration,
                    })}
                  </g>
                )
              })}

              {/* Ghost layer：item 0 的副本，解决 z-order 问题 */}
              {ghostTimeline && (
                <g>
                  {buildAnimLayers({
                    item: items[0], itemW, itemH,
                    entryOffset: getOffsets(items[0]).entryOffset,
                    exitOffset: getOffsets(items[0]).exitOffset,
                    entryDuration: ghostTimeline.entryDuration,
                    stayDuration: 0,
                    exitDuration: 0,
                    holdDuration: ghostTimeline.holdDuration,
                    begin: ghostTimeline.begin,
                    totalDuration,
                  })}
                </g>
              )}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnyCarousel
