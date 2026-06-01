import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import { getEaseBezier } from "@smil/bezier"

const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })

const DEFAULT_STAY   = 1.3
const DEFAULT_SWITCH = 0.7

export interface I_SpinZoomItem {
  url: string
  stayDuration?: number
  switchDuration?: number
  keySplines?: string
}

const SpinZoomCarousel = (props: {
  canvasSize: { w: number; h: number }
  pics: I_SpinZoomItem[]
  minScale?: number
  isReversedSpin?: boolean
  spinCount?: number
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.pics?.length) return null

  const { w, h } = props.canvasSize
  const cx = w / 2
  const cy = h / 2
  const pics = props.pics
  const N = pics.length
  const minScale = defaultTo(props.minScale, 0.55)
  const reverseRot = defaultTo(props.isReversedSpin, false)
  const spinCount = defaultTo(props.spinCount, 1)
  const isDev = ExPubGoConfig().mode === 'development'

  // 每个 slot 的时长 = stayDuration + switchDuration
  const slotDurations = pics.map(p => defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH))
  const T = slotDurations.reduce((a, b) => a + b, 0)

  // 每个 slot 的起始时间（累积）
  const slotStarts = slotDurations.reduce<number[]>((acc, d, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + slotDurations[i - 1])
    return acc
  }, [])

  const kt = (t: number) => t / T

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'spin-zoom-carousel' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`} style={{ display: "block", margin: "0 auto" }} width="100%">
          {pics.map((pic, i) => {
            const currIdx = i
            const nextIdx = (i + 1) % N
            const stay      = defaultTo(pic.stayDuration, DEFAULT_STAY)
            const sw        = defaultTo(pic.switchDuration, DEFAULT_SWITCH)
            const slotStart = slotStarts[i]
            const rotStart  = slotStart + stay
            const scaleMid  = rotStart + sw / 2
            const rotEnd    = rotStart + sw
            const slotEnd   = slotStart + stay + sw

            // slot 整体 discrete opacity
            // 第一个 slot 从 0 就显示；最后一个 slot 显示后不消失
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

            // 旋转：[rotStart, rotEnd] 内 0→N×360（isReversedSpin 时反向）
            const endAngle = spinCount * 360 * (reverseRot ? -1 : 1)
            const rotKT = `0; ${kt(rotStart)}; ${kt(rotEnd)}; 1`
            const rotV  = `0 0 0; 0 0 0; ${endAngle} 0 0; ${endAngle} 0 0`

            // 缩放：[rotStart, scaleMid, rotEnd] 内 1→minScale→1
            const scaleKT = `0; ${kt(rotStart)}; ${kt(scaleMid)}; ${kt(rotEnd)}; 1`
            const scaleV  = `1 1; 1 1; ${minScale} ${minScale}; 1 1; 1 1`

            // 当前图淡出：rotStart 开始，rotEnd 消失（stay 阶段完全静止）
            const currKT = `0; ${kt(rotStart)}; ${kt(rotEnd)}; 1`
            const currV  = `1; 1; 0; 0`

            // 下一张淡入：从 rotStart 开始，到 slotEnd 完全显示
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
                      {/* 下一张（淡入） */}
                      <g opacity={0}>
                        <animate attributeName="opacity" values={nextV} keyTimes={nextKT}
                          keySplines={spline3} dur={`${T}s`} calcMode="spline"
                          repeatCount="indefinite" begin="0s" fill="freeze" />
                        <g transform={`translate(${-cx} ${-cy})`}>
                          <foreignObject x={0} y={0} width="100%" height="100%">
                            <SvgEx viewBox={`0 0 ${w} ${h}`}
                              style={{ backgroundImage: svgURL(pics[nextIdx].url), backgroundSize: "cover" }} />
                          </foreignObject>
                        </g>
                      </g>
                      {/* 当前图（淡出） */}
                      <g opacity={1}>
                        <animate attributeName="opacity" values={currV} keyTimes={currKT}
                          keySplines={spline3} dur={`${T}s`} calcMode="spline"
                          repeatCount="indefinite" begin="0s" fill="freeze" />
                        <g transform={`translate(${-cx} ${-cy})`}>
                          <foreignObject x={0} y={0} width="100%" height="100%">
                            <SvgEx viewBox={`0 0 ${w} ${h}`}
                              style={{ backgroundImage: svgURL(pics[currIdx].url), backgroundSize: "cover" }} />
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
