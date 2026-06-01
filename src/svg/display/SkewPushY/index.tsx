import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import type { ReactNode } from "react"
import type { I_SkewSlideItem } from "../SkewSlideCarousel"
import type { T_DirectionX } from "../../types"

export type { I_SkewSlideItem }

const EASE = "0.42 0 0.58 1"
const DEFAULT_SKEW_ANGLE = 15
const DEFAULT_STEP = 4

const SkewPushY = (props: {
  canvasSize: { w: number; h: number }
  items: I_SkewSlideItem[]
  skewAngle?: number
  stepDuration?: number
  isReversed?: boolean
  itemGap?: number
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.items?.length) return null

  const { w, h } = props.canvasSize
  const items = props.items
  const N = items.length
  const itemGap = defaultTo(props.itemGap, 0)

  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  const contentW = Math.max(1, w - itemGap * 2)
  const contentH = Math.max(1, h - itemGap * 2)
  const maxAngle = Math.max(1, Math.floor(Math.atan(contentH / contentW) * 180 / Math.PI))
  const skewAngle = Math.min(Math.max(rawAngle, 1), maxAngle)

  const step = defaultTo(props.stepDuration, DEFAULT_STEP)
  const dur = N * step
  const reverse = defaultTo(props.isReversed, false)
  const isDev = ExPubGoConfig().mode === 'development'

  const offset = Math.round(contentW * Math.tan(skewAngle * Math.PI / 180) / 2)

  const defaultIn = reverse ? skewAngle : -skewAngle
  const defaultOut = -defaultIn
  const resolveSkew = (dir?: T_DirectionX) =>
    dir === 'L' ? skewAngle : dir === 'R' ? -skewAngle : undefined

  const keySplines = `${EASE}; ${EASE}; ${EASE}`
  const k1 = (step / dur).toFixed(6)
  const k2 = ((2 * step) / dur).toFixed(6)
  const keyTimes = `0; ${k1}; ${k2}; 1`

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'skew-push-y' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto" }} width="100%">
          <g transform={`translate(${itemGap}, ${itemGap})`}>
            <g transform={`translate(${contentW / 2}, ${contentH / 2})`}>
              {items.map((item, i) => {
                const begin = (i - 1) * step
                const useItem = !!item.item
                const itemSkewIn = resolveSkew(item.skewIn) ?? defaultIn
                const itemSkewOut = resolveSkew(item.skewOut) ?? defaultOut
                const itemXOff = itemSkewIn > 0 ? -offset : offset
                const ty = `${itemXOff} ${h}; 0 0; ${itemXOff} ${-h}; ${itemXOff} ${-h}`
                const sk = `${itemSkewIn}; 0; ${itemSkewOut}; ${itemSkewOut}`

                return (
                  <g key={i} opacity={i === 0 ? 1 : 0}>
                    <animate attributeName="opacity" values="0; 1" dur="1ms" fill="freeze"
                      begin={`${begin}s`} />
                    <animateTransform attributeName="transform" type="translate"
                      values={ty} keyTimes={keyTimes} keySplines={keySplines} dur={`${dur}s`}
                      calcMode="spline" repeatCount="indefinite"
                      begin={`${begin}s`} fill="freeze" />
                    <g>
                      <animateTransform attributeName="transform" type="skewX"
                        values={sk} keyTimes={keyTimes} keySplines={keySplines} dur={`${dur}s`}
                        calcMode="spline" repeatCount="indefinite"
                        begin={`${begin}s`} fill="freeze" />
                      <g transform={`translate(${-contentW / 2}, ${-contentH / 2})`}>
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

export default SkewPushY
