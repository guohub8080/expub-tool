import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import max from 'lodash/max'
import min from 'lodash/min'
import floor from 'lodash/floor'
import round from 'lodash/round'
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { setVisibility } from '@smil/index'
import { transformTranslate } from '@smil/index'
import { transformSkewY } from '@smil/index'
import svgURL from "@utils/svg/svgURL"
import { isDefined } from '@utils/fn/isDefined'
import { buildCyclicTimelines } from '@utils/svg/buildCyclicTimelines'
import type { I_ItemTimeline } from '@utils/svg/buildCyclicTimelines'
import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { I_SkewSlideCarouselChildItem } from '../types'
import { EASE, DEFAULT_SKEW_ANGLE, DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from '../types'

export type { I_SkewSlideCarouselChildItem } from '../types'

/**
 * SkewSlideCarouselX — 横向斜切轮播（skewY + translate X）
 *
 * 每张图独立 4 阶段动画：entry → stay → exit → hold
 * translate 和 skewY 严格同步，共享 duration、keySplines、begin 偏移。
 *
 * 渲染结构（每个 item）：
 *   <g>                    ← translate（进入/退出位移 + Y 补偿）
 *     <animateTransform translate/>
 *     <g>                  ← skew origin
 *       <animateTransform skewY/>
 *       <g>                ← content positioning
 *         <foreignObject>
 */
const SkewSlideCarouselX = (props: {
  canvasSize: { w: number; h: number }
  childCanvasSize?: { w: number; h: number }
  gap?: number
  skewAngle?: number
  isReversed?: boolean
  childItems: I_SkewSlideCarouselChildItem[]
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.childItems) || props.childItems.length === 0) return null

  const { w, h } = props.canvasSize
  const isReversed = defaultTo(props.isReversed, false)
  const gap = defaultTo(props.gap, 0)

  // ── 内容尺寸 ──
  const childCanvas = defaultTo(props.childCanvasSize, { w, h })
  const contentW = max([1, childCanvas.w])!
  const contentH = max([1, childCanvas.h])!

  // ── 斜切角度限制 ──
  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  const maxAngle = max([1, floor(Math.atan(contentW / contentH) * 180 / Math.PI)])!
  const skewAngle = min([max([rawAngle, 1]), maxAngle])!

  // ── 面宽度（translate 距离） ──
  const faceW = contentW + gap

  // ── Y 补偿：skewY 让内容绕底边倾斜，translate Y 偏移保持视觉中心稳定 ──
  const offset = round(contentH / 2 * Math.tan(skewAngle * Math.PI / 180))
  const yOff = isReversed ? offset : -offset

  // ── skew 角度方向 ──
  const entryAngle = isReversed ? skewAngle : -skewAngle
  const exitAngle = isReversed ? -skewAngle : skewAngle

  // ── skew origin：底边中心 ──
  const originX = faceW / 2
  const originY = contentH

  // ── 面在画布中的居中偏移 ──
  const offsetX = (w - faceW) / 2
  const offsetY = (h - contentH) / 2

  // ── 构建时间轴 ──
  const items = props.childItems
  const switchItems = items.map(item => ({
    switchDuration: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
    stayDuration: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
  }))
  const { totalDuration, itemTimelines } = buildCyclicTimelines(switchItems)

  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'skew-slide-carousel-x' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }} width="100%">
          <g transform={`translate(${offsetX}, ${offsetY})`} visibility="hidden">
            {setVisibility({ to: "visible", begin: "0.01s", isFreeze: true })}
            <g transform={`translate(${originX}, ${originY})`}>
              {items.map((item, i) => (
                <SkewSlideItemX
                  key={i}
                  url={item.url}
                  jsx={item.jsx}
                  timeline={itemTimelines[i]}
                  totalDuration={totalDuration}
                  contentW={contentW}
                  contentH={contentH}
                  faceW={faceW}
                  yOff={yOff}
                  entryAngle={entryAngle}
                  exitAngle={exitAngle}
                />
              ))}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

// ── 单项渲染 ──

const SkewSlideItemX = (props: {
  url?: string
  jsx?: React.ReactNode
  timeline: I_ItemTimeline
  totalDuration: number
  contentW: number
  contentH: number
  faceW: number
  yOff: number
  entryAngle: number
  exitAngle: number
}) => {
  const { url, jsx, timeline, contentW, contentH, faceW, yOff, entryAngle, exitAngle } = props
  const { begin, entryDuration, stayDuration, exitDuration, holdDuration } = timeline

  // ── translate 4 阶段 ──
  const entryTranslate = { x: faceW, y: yOff }
  const exitTranslate = { x: -faceW, y: yOff }
  const center = { x: 0, y: 0 }

  const translateTimeline: I_TimelineKeyframe<{ x: number; y: number }>[] = []
  if (entryDuration > 0) translateTimeline.push({ durationSeconds: entryDuration, toAbs: center, keySplines: EASE })
  if (stayDuration > 0) translateTimeline.push({ durationSeconds: stayDuration, toAbs: center, keySplines: EASE })
  if (exitDuration > 0) translateTimeline.push({ durationSeconds: exitDuration, toAbs: exitTranslate, keySplines: EASE })
  if (holdDuration > 0) translateTimeline.push({ durationSeconds: holdDuration, toAbs: exitTranslate, keySplines: EASE })

  // ── skewY 4 阶段 ──
  const skewTimeline: I_TimelineKeyframe<number>[] = []
  if (entryDuration > 0) skewTimeline.push({ durationSeconds: entryDuration, toAbs: 0, keySplines: EASE })
  if (stayDuration > 0) skewTimeline.push({ durationSeconds: stayDuration, toAbs: 0, keySplines: EASE })
  if (exitDuration > 0) skewTimeline.push({ durationSeconds: exitDuration, toAbs: exitAngle, keySplines: EASE })
  if (holdDuration > 0) skewTimeline.push({ durationSeconds: holdDuration, toAbs: exitAngle, keySplines: EASE })

  // ── 内容 ──
  const content = isDefined(jsx)
    ? jsx
    : <SvgEx viewBox={`0 0 ${contentW + 1} ${contentH + 1}`}
        style={{
          backgroundImage: svgURL(url!), backgroundSize: "cover",
          backgroundPosition: "50% 50%", backgroundRepeat: "no-repeat",
          width: "100%", display: "block", boxSizing: "border-box",
        }} />

  return (
    <g>
      {transformTranslate({
        initValue: entryTranslate,
        timeline: translateTimeline,
        begin: `${begin}s`,
        loopCount: 0,
        isFreeze: true,
        isAdditive: false,
      })}
      <g>
        {transformSkewY({
          initValue: entryAngle,
          timeline: skewTimeline,
          begin: `${begin}s`,
          loopCount: 0,
          isFreeze: true,
          isAdditive: false,
        })}
        <g transform={`translate(${-contentW / 2}, ${-contentH})`}>
          <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
            {content}
          </foreignObject>
        </g>
      </g>
    </g>
  )
}

export default SkewSlideCarouselX
