import SectionEx from "@html/basicEx/SectionEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import { getEaseBezier } from "@smil/bezier"
import type { ReactNode } from "react"

const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })

const DEFAULT_STAY   = 1.3
const DEFAULT_SWITCH = 0.7
const DEFAULT_PEAK_SCALE = 0.55

export interface I_SpinZoomItem {
  url?: string
  item?: ReactNode
  stayDuration?: number
  switchDuration?: number
  keySplines?: string
}

const SpinZoomCarousel = (props: {
  canvasSize: { w: number; h: number }
  items: I_SpinZoomItem[]
  peakScale?: number
  isReversedSpin?: boolean
  spinCount?: number
  canvasBg?: I_CanvasBg
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.items?.length) return null

  const { w, h } = props.canvasSize
  const cx = w / 2
  const cy = h / 2
  const items = props.items
  const N = items.length
  const peakScale = defaultTo(props.peakScale, DEFAULT_PEAK_SCALE)
  const reverseRot = defaultTo(props.isReversedSpin, false)
  const spinCount = defaultTo(props.spinCount, 1)
  const isDev = ExPubGoConfig().mode === 'development'

  const slotDurations = items.map(p => defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH))
  const T = slotDurations.reduce((a, b) => a + b, 0)

  const slotStarts = slotDurations.reduce<number[]>((acc, d, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + slotDurations[i - 1])
    return acc
  }, [])

  const kt = (t: number) => t / T

  const renderContent = (pic: I_SpinZoomItem) => {
    if (pic.item) return pic.item
    return (
      <SvgEx viewBox={`0 0 ${w} ${h}`}
        style={{ backgroundImage: svgURL(pic.url!), backgroundSize: "cover" }} />
    )
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'spin-zoom-carousel' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`} style={{
          display: "block", margin: "0 auto",
          ...resolveCanvasBg(props.canvasBg),
        }} width="100%">
          {items.map((pic, i) => {
            const nextIdx = (i + 1) % N
            const stay      = defaultTo(pic.stayDuration, DEFAULT_STAY)
            const sw        = defaultTo(pic.switchDuration, DEFAULT_SWITCH)
            const slotStart = slotStarts[i]
            const rotStart  = slotStart + stay
            const scaleMid  = rotStart + sw / 2
            const rotEnd    = rotStart + sw
            const slotEnd   = slotStart + stay + sw

            const isFirst = i === 0
            const isLast  = i === N - 1
            let slotKT: string
            let slotV: string
            if (isFirst && isLast) {
              slotKT = `0; 1`
              slotV  = `1; 1`
            } else if (isFirst) {
              slotKT = `0; ${kt(rotEnd)}; ${kt(slotEnd)}; 1`
              slotV  = `1; 1; 0; 0`
            } else if (isLast) {
              slotKT = `0; ${kt(slotStart)}; ${kt(rotEnd)}; 1`
              slotV  = `0; 1; 1; 1`
            } else {
              slotKT = `0; ${kt(slotStart)}; ${kt(rotEnd)}; ${kt(slotEnd)}; 1`
              slotV  = `0; 1; 1; 0; 0`
            }

            const endAngle = spinCount * 360 * (reverseRot ? -1 : 1)
            const rotKT = `0; ${kt(rotStart)}; ${kt(rotEnd)}; 1`
            const rotV  = `0 0 0; 0 0 0; ${endAngle} 0 0; ${endAngle} 0 0`

            const scaleKT = `0; ${kt(rotStart)}; ${kt(scaleMid)}; ${kt(rotEnd)}; 1`
            const scaleV  = `1 1; 1 1; ${peakScale} ${peakScale}; 1 1; 1 1`

            const currKT = `0; ${kt(rotStart)}; ${kt(rotEnd)}; 1`
            const currV  = `1; 1; 0; 0`

            const nextKT = `0; ${kt(rotStart)}; ${kt(slotEnd)}; 1`
            const nextV  = `0; 0; 1; 1`

            const spline3 = `${EASE_IN_OUT}; ${EASE_IN_OUT}; ${EASE_IN_OUT}`
            const sp = defaultTo(pic.keySplines, EASE_IN_OUT)
            const spinSpline3 = `${sp}; ${sp}; ${sp}`
            const spinSpline4 = `${sp}; ${sp}; ${sp}; ${sp}`

            return (
              <g key={i} transform={`translate(${cx} ${cy})`} opacity={isFirst ? 1 : 0}>
                <animate attributeName="opacity" values={slotV} keyTimes={slotKT}
                  dur={`${T}s`} calcMode="discrete" repeatCount="indefinite" begin="0s" fill="freeze" />
                <g>
                  <animateTransform attributeName="transform" type="rotate"
                    values={rotV} keyTimes={rotKT} keySplines={spinSpline3}
                    dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
                  <g>
                    <animateTransform attributeName="transform" type="scale"
                      values={scaleV} keyTimes={scaleKT} keySplines={spinSpline4}
                      dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
                    <g>
                      <g opacity={0}>
                        <animate attributeName="opacity" values={nextV} keyTimes={nextKT}
                          keySplines={spline3} dur={`${T}s`} calcMode="spline"
                          repeatCount="indefinite" begin="0s" fill="freeze" />
                        <g transform={`translate(${-cx} ${-cy})`}>
                          <foreignObject x={0} y={0} width="100%" height="100%">
                            {renderContent(items[nextIdx])}
                          </foreignObject>
                        </g>
                      </g>
                      <g opacity={1}>
                        <animate attributeName="opacity" values={currV} keyTimes={currKT}
                          keySplines={spline3} dur={`${T}s`} calcMode="spline"
                          repeatCount="indefinite" begin="0s" fill="freeze" />
                        <g transform={`translate(${-cx} ${-cy})`}>
                          <foreignObject x={0} y={0} width="100%" height="100%">
                            {renderContent(pic)}
                          </foreignObject>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            )
          })}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default SpinZoomCarousel
