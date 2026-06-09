import SectionEx from "@html/basicEx/SectionEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import SvgEx from "@html/basicEx/SvgEx"
import max from "lodash/max"
import min from "lodash/min"
import floor from "lodash/floor"
import round from "lodash/round"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import type { I_SkewSlideItem } from "../types"
import type { T_DirectionX } from "../../../types"
import { EASE, DEFAULT_SKEW_ANGLE, DEFAULT_STEP } from "../types"

export type { I_SkewSlideItem } from "../types"

const DEFAULT_SKEW_IN: T_DirectionX = 'L'
const DEFAULT_SKEW_OUT: T_DirectionX = 'R'

const SkewSlideCarouselY = (props: {
  canvasSize: { w: number; h: number }
  items: I_SkewSlideItem[]
  skewAngle?: number
  stepDuration?: number
  itemGap?: number
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.items) || props.items.length === 0) return null

  const { w, h } = props.canvasSize
  const items = props.items
  const N = items.length
  const itemGap = defaultTo(props.itemGap, 0)

  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  const contentW = max([1, w - itemGap * 2])
  const contentH = max([1, h - itemGap * 2])
  const maxAngle = max([1, floor(Math.atan(contentW / contentH) * 180 / Math.PI)])
  const skewAngle = min([max([rawAngle, 1]), maxAngle])

  const step = defaultTo(props.stepDuration, DEFAULT_STEP)
  const dur = N * step
  const isDev = ExPubGoConfig().mode === 'development'

  const offset = round(contentW * Math.tan(skewAngle * Math.PI / 180) / 2)

  // buffer: foreignObject 多 1px，skewX 在左/右边缘额外贡献 offset px（= contentW/2 × tan(angle)）
  const exitBuffer = offset + 1
  const entryY = h + exitBuffer
  const exitY = -(h + exitBuffer)

  const keySplines = `${EASE}; ${EASE}; ${EASE}`
  const k1 = (step / dur).toFixed(6)
  const k2 = ((2 * step) / dur).toFixed(6)
  const keyTimes = `0; ${k1}; ${k2}; 1`

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'skew-slide-carousel-y' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }} width="100%">
          <g transform={`translate(${itemGap}, ${itemGap})`}>
            <g transform={`translate(${contentW / 2}, 0)`}>
              {items.map((item, i) => {
                const begin = (i - 1) * step
                const useItem = !!item.item
                const dirIn = defaultTo(item.skewIn, DEFAULT_SKEW_IN)
                const dirOut = defaultTo(item.skewOut, DEFAULT_SKEW_OUT)
                const entrySkewAngle = dirIn === 'L' ? skewAngle : -skewAngle
                const horizontalCompensate = dirIn === 'L' ? -offset : offset
                const exitSkewAngle = dirOut === 'L' ? skewAngle : -skewAngle
                const translateValues = `${horizontalCompensate} ${entryY}; 0 0; ${horizontalCompensate} ${exitY}; ${horizontalCompensate} ${exitY}`
                const skewValues = `${entrySkewAngle}; 0; ${exitSkewAngle}; ${exitSkewAngle}`

                return (
                  <g key={i} opacity={i === 0 ? 1 : 0}>
                    <animate attributeName="opacity" values="0; 1" dur="1ms" fill="freeze"
                      begin={`${begin}s`} />
                    <animateTransform attributeName="transform" type="translate"
                      values={translateValues} keyTimes={keyTimes} keySplines={keySplines} dur={`${dur}s`}
                      calcMode="spline" repeatCount="indefinite"
                      begin={`${begin}s`} fill="freeze" />
                    <g>
                      <animateTransform attributeName="transform" type="skewX"
                        values={skewValues} keyTimes={keyTimes} keySplines={keySplines} dur={`${dur}s`}
                        calcMode="spline" repeatCount="indefinite"
                        begin={`${begin}s`} fill="freeze" />
                      <g transform={`translate(${-contentW / 2}, 0)`}>
                        <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
                          {useItem
                            ? item.item
                            : <SvgEx viewBox={`0 0 ${contentW + 1} ${contentH + 1}`}
                                style={{
                                  backgroundImage: svgURL(item.url!), backgroundSize: "cover",
                                  backgroundPosition: "50% 50%", backgroundRepeat: "no-repeat",
                                  width: "100%", display: "block", boxSizing: "border-box",
                                }} />
                          }
                        </foreignObject>
                      </g>
                    </g>
                  </g>
                )
              })}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default SkewSlideCarouselY
