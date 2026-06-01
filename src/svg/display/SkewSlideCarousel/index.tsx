import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import type { ReactNode } from "react"

const EASE = "0.42 0 0.58 1"
const DEFAULT_SKEW_ANGLE = 15
const DEFAULT_STEP = 4

export interface I_SkewSlideItem {
  url?: string
  item?: ReactNode
}

const SkewSlideCarousel = (props: {
  canvasSize: { w: number; h: number }
  items: I_SkewSlideItem[]
  skewAngle?: number
  stepDuration?: number
  isReversed?: boolean
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.items?.length) return null

  const { w, h } = props.canvasSize
  const items = props.items
  const N = items.length
  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  // 限制 skewAngle：倾斜后图片宽度 = w + h*tan(θ)，不能超过 foreignObject 容器的合理范围
  // 保守上限：h*tan(θ) <= w，即 θ <= atan(w/h)。正方形画布最大 45°
  const maxAngle = Math.max(1, Math.floor(Math.atan(w / h) * 180 / Math.PI))
  const skewAngle = Math.min(Math.max(rawAngle, 1), maxAngle)
  const step = defaultTo(props.stepDuration, DEFAULT_STEP)
  const dur = N * step
  const reverse = defaultTo(props.isReversed, false)
  const isDev = ExPubGoConfig().mode === 'development'

  // Y 偏移 = h * tan(angle) / 2，与 skewAngle 联动
  const offset = Math.round(h * Math.tan(skewAngle * Math.PI / 180) / 2)
  const yOff = reverse ? offset : -offset

  // translate values：从右斜入 → 中心 → 左斜出 → 停留
  const tx = `${w} ${yOff}; 0 0; ${-w} ${yOff}; ${-w} ${yOff}; ${-w} ${yOff}; ${-w} ${yOff}`

  // skewY values
  const sa = reverse ? skewAngle : -skewAngle
  const sk = `${sa}; 0; ${-sa}; ${-sa}; ${-sa}; ${-sa}`

  const keySplines = `${EASE}; ${EASE}; ${EASE}; ${EASE}; ${EASE}`

  // 6 个 values 对应 5 段，keyTimes 显式控制（避免重复，后三段均分剩余时间）
  const k1 = (step / dur).toFixed(6)
  const k2 = ((2 * step) / dur).toFixed(6)
  const remain = 1 - parseFloat(k2)
  const k3 = (parseFloat(k2) + remain / 3).toFixed(6)
  const k4 = (parseFloat(k3) + remain / 3).toFixed(6)
  const keyTimes = `0; ${k1}; ${k2}; ${k3}; ${k4}; 1`

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'skew-slide-carousel' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`} style={{ display: "block", margin: "0 auto" }} width="100%">
          <g transform={`translate(${w / 2}, ${h})`}>
            {items.map((item, i) => {
              const begin = (i - 1) * step
              const useItem = !!item.item

              return (
                <g key={i} opacity={i === 0 ? 1 : 0}>
                  {/* 瞬间出现 */}
                  <animate attributeName="opacity" values="0; 1" dur="1ms" fill="freeze"
                    begin={`${begin}s`} />
                  {/* 平移 */}
                  <animateTransform attributeName="transform" type="translate"
                    values={tx} keyTimes={keyTimes} keySplines={keySplines} dur={`${dur}s`}
                    calcMode="spline" repeatCount="indefinite"
                    begin={`${begin}s`} fill="freeze" />
                  <g>
                    {/* 斜切 */}
                    <animateTransform attributeName="transform" type="skewY"
                      values={sk} keyTimes={keyTimes} keySplines={keySplines} dur={`${dur}s`}
                      calcMode="spline" repeatCount="indefinite"
                      begin={`${begin}s`} fill="freeze" />
                    <g transform={`translate(${-w / 2}, ${-h})`}>
                      <foreignObject x={0} y={0} width={w + 1} height={h + 1}>
                        {useItem
                          ? item.item
                          : <SvgEx viewBox={`0 0 ${w + 1} ${h + 1}`}
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
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default SkewSlideCarousel
