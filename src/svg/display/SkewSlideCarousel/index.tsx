import type { ReactNode } from 'react'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import max from 'lodash/max'
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import type { I_CanvasBg } from '@svg/types'
import { transformTranslate, transformSkewX, transformSkewY } from '@smil/index'
import svgURL from "@utils/svg/svgURL"
import { isDefined } from '@utils/fn/isDefined'
import { DEFAULT_EASE, DEFAULT_SKEW_ANGLE, DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION, clampSkewAngle, getCrossCompensation } from './utils'
import type { I_TimelineKeyframe } from '@smil/timeline/types'

export interface I_SkewSlideCarouselChildItem {
  url?: string
  jsx?: ReactNode
  switchDuration?: number
  stayDuration?: number
}

export interface I_SkewSlideCarouselProps {
  canvasSize: { w: number; h: number }
  childCanvasSize?: { w: number; h: number }
  gap?: number
  skewAngle?: number
  axis?: 'X' | 'Y'
  isReversed?: boolean
  childItems: I_SkewSlideCarouselChildItem[]
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}

/**
 * SkewSlideCarousel — CoverFlow 风格斜切轮播
 *
 * 同时显示三个面（左 peek / 中心 / 右 peek），切换时像传送带平滑滑过。
 * 架构与 CoverFlowX 一致：N+3 个 slot + 外层 additive translate。
 */
const SkewSlideCarousel = (props: I_SkewSlideCarouselProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.childItems) || props.childItems.length === 0) return null

  const { w, h } = props.canvasSize
  const axis = defaultTo(props.axis, 'X')
  const isReversed = defaultTo(props.isReversed, false)
  const gap = defaultTo(props.gap, 0)

  // ── 内容尺寸 ──
  const childCanvas = defaultTo(props.childCanvasSize, { w, h })
  const contentW = max([1, childCanvas.w])!
  const contentH = max([1, childCanvas.h])!

  // ── 斜切角度 ──
  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  const skewAngle = clampSkewAngle(rawAngle, contentW, contentH, axis)

  // ── 面尺寸（slot 间距） ──
  const faceW = axis === 'X' ? contentW + gap : contentW
  const faceH = contentH

  // ── 交叉轴补偿 ──
  const crossComp = getCrossCompensation(axis, contentW, contentH, skewAngle)
  const signedCrossComp = isReversed ? crossComp : -crossComp

  // ── skew 角度（左/右 peek 面） ──
  const rightAngle = axis === 'X'
    ? (isReversed ? skewAngle : -skewAngle)
    : (isReversed ? -skewAngle : skewAngle)
  const leftAngle = -rightAngle

  // ── skew origin（相对于 slot 内容） ──
  const originX = faceW / 2
  const originY = axis === 'X' ? contentH : 0
  const contentOffsetX = -contentW / 2
  const contentOffsetY = axis === 'X' ? -contentH : 0

  // ── Slot 布局 ──
  const slotStep = axis === 'X' ? faceW : faceH
  const centerMain = axis === 'X' ? (w - faceW) / 2 : (h - faceH) / 2
  const slotCross = axis === 'X' ? (h - contentH) / 2 : (w - contentW) / 2

  const items = props.childItems
  const N = items.length
  const isDev = ExPubGoConfig().mode === 'development'

  // N+3 slots：边缘 slot[0] 左 peek、slot[N+2] 右 peek，不做动画
  const slots: { item: typeof items[0]; mainPos: number; activeIdx: number; isEdge: boolean }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N
    const mainPos = isReversed
      ? centerMain + slotStep - i * slotStep
      : centerMain - slotStep + i * slotStep
    slots.push({
      item: items[itemIdx],
      mainPos,
      activeIdx: i - 1,
      isEdge: i === 0 || i === N + 2,
    })
  }

  // ── 外层 translate timeline（移动所有 slot） ──
  const outerTimeline: I_TimelineKeyframe<{ x: number; y: number }>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const delta = (i + 1) * slotStep
    const sign = isReversed ? 1 : -1
    const target = axis === 'X'
      ? { x: sign * delta, y: 0 }
      : { x: 0, y: sign * delta }
    outerTimeline.push({
      toAbs: target,
      durationSeconds: defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION),
      keySplines: DEFAULT_EASE,
    })
    outerTimeline.push({
      toAbs: target,
      durationSeconds: defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    })
  }

  const compVec = axis === 'X'
    ? { x: 0, y: signedCrossComp }
    : { x: signedCrossComp, y: 0 }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': `skew-slide-carousel-${axis.toLowerCase()}` } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }} width="100%">
          <g>
            {slots.map((slot, si) => {
              const slotX = axis === 'X' ? slot.mainPos : slotCross
              const slotY = axis === 'Y' ? slot.mainPos : slotCross

              // 内容渲染
              const content = isDefined(slot.item.jsx)
                ? slot.item.jsx
                : <SvgEx viewBox={`0 0 ${contentW + 1} ${contentH + 1}`}
                    style={{
                      backgroundImage: svgURL(slot.item.url!), backgroundSize: "cover",
                      backgroundPosition: "50% 50%", backgroundRepeat: "no-repeat",
                      width: "100%", display: "block", boxSizing: "border-box",
                    }} />

              // ── 边缘 slot：静态 skew + 静态补偿 ──
              if (slot.isEdge) {
                const edgeAngle = si === 0 ? leftAngle : rightAngle
                const skewTransform = axis === 'Y' ? `skewX(${edgeAngle})` : `skewY(${edgeAngle})`
                const compTransform = axis === 'X'
                  ? `translate(0, ${signedCrossComp})`
                  : `translate(${signedCrossComp}, 0)`
                return (
                  <g key={si} transform={`translate(${slotX}, ${slotY})`}>
                    <g transform={compTransform}>
                      <g transform={`translate(${originX}, ${originY})`}>
                        <g transform={skewTransform}>
                          <g transform={`translate(${contentOffsetX}, ${contentOffsetY})`}>
                            <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
                              {content}
                            </foreignObject>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                )
              }

              // ── 非边缘 slot：动画 skew + 动画补偿 ──
              const { initValue: skewInit, timeline: skewTL } = buildSlotSkewTimeline(
                slot.activeIdx, N, items, rightAngle, leftAngle,
              )
              const { initValue: compInit, timeline: compTL } = buildSlotCompTimeline(
                slot.activeIdx, N, items, compVec,
              )

              const skewAnimConfig = {
                initValue: skewInit,
                timeline: skewTL,
                begin: '0s' as const,
                loopCount: 0 as const,
                isFreeze: true,
                isAdditive: false,
              }

              return (
                <g key={si} transform={`translate(${slotX}, ${slotY})`}>
                  <g>
                    {transformTranslate({
                      initValue: compInit,
                      timeline: compTL,
                      begin: '0s',
                      loopCount: 0,
                      isFreeze: true,
                      isAdditive: false,
                    })}
                    <g transform={`translate(${originX}, ${originY})`}>
                      <g>
                        {axis === 'Y'
                          ? transformSkewX(skewAnimConfig)
                          : transformSkewY(skewAnimConfig)}
                        <g transform={`translate(${contentOffsetX}, ${contentOffsetY})`}>
                          <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
                            {content}
                          </foreignObject>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              )
            })}
            {/* 外层 translate：additive 移动所有 slot */}
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

// ── Per-slot timeline builders ──

function getSegParams(seg: number, N: number, items: I_SkewSlideCarouselChildItem[]) {
  const itemIdx = Math.floor(seg / 2) % N
  const item = items[itemIdx]
  const isSwitch = seg % 2 === 0
  return {
    dur: isSwitch
      ? defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION)
      : defaultTo(item.stayDuration, DEFAULT_STAY_DURATION),
    splines: isSwitch ? DEFAULT_EASE : undefined,
  }
}

/**
 * 构建 slot 的 skew timeline。
 *
 * activeIdx=0 → 初始 center，立即退出到 left peek
 * activeIdx=k → 在 step (k-1) 进入 center，step k 退出到 left peek
 */
function buildSlotSkewTimeline(
  activeIdx: number,
  N: number,
  items: I_SkewSlideCarouselChildItem[],
  rightAngle: number,
  leftAngle: number,
): { initValue: number; timeline: I_TimelineKeyframe<number>[] } {
  const totalSegs = N * 2
  const timeline: I_TimelineKeyframe<number>[] = []

  if (activeIdx === 0) {
    for (let seg = 0; seg < totalSegs; seg++) {
      const { dur, splines } = getSegParams(seg, N, items)
      timeline.push({ toAbs: leftAngle, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
    }
    return { initValue: 0, timeline }
  }

  const enterSeg = (activeIdx - 1) * 2
  const holdSeg = enterSeg + 1
  const exitSeg = enterSeg + 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const { dur, splines } = getSegParams(seg, N, items)
    let target: number
    if (seg < enterSeg) target = rightAngle
    else if (seg === enterSeg) target = 0
    else if (seg === holdSeg) target = 0
    else if (seg === exitSeg) target = leftAngle
    else target = leftAngle

    timeline.push({ toAbs: target, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return { initValue: rightAngle, timeline }
}

/**
 * 构建 slot 的交叉轴补偿 timeline。
 * 补偿量与 skew 同步：有 skew → compVec，无 skew → zero。
 */
function buildSlotCompTimeline(
  activeIdx: number,
  N: number,
  items: I_SkewSlideCarouselChildItem[],
  compVec: { x: number; y: number },
): { initValue: { x: number; y: number }; timeline: I_TimelineKeyframe<{ x: number; y: number }>[] } {
  const totalSegs = N * 2
  const timeline: I_TimelineKeyframe<{ x: number; y: number }>[] = []
  const zeroVec = { x: 0, y: 0 }

  if (activeIdx === 0) {
    for (let seg = 0; seg < totalSegs; seg++) {
      const { dur, splines } = getSegParams(seg, N, items)
      timeline.push({ toAbs: compVec, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
    }
    return { initValue: zeroVec, timeline }
  }

  const enterSeg = (activeIdx - 1) * 2
  const holdSeg = enterSeg + 1
  const exitSeg = enterSeg + 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const { dur, splines } = getSegParams(seg, N, items)
    let target: { x: number; y: number }
    if (seg < enterSeg) target = compVec
    else if (seg <= holdSeg) target = zeroVec
    else target = compVec

    timeline.push({ toAbs: target, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return { initValue: compVec, timeline }
}

export default SkewSlideCarousel
