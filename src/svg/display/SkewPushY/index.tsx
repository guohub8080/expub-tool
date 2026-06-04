import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import max from "lodash/max"
import min from "lodash/min"
import floor from "lodash/floor"
import round from "lodash/round"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import type { ReactNode } from "react"
import type { T_DirectionX } from "../../types"

export interface I_SkewPushChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
  /** 进入方向，默认 L。L = 正角度，R = 负角度 */
  skewIn?: T_DirectionX
  /** 退出方向，默认 R。L = 正角度，R = 负角度 */
  skewOut?: T_DirectionX
  /** 停留时长（秒），默认 2 */
  stayDuration?: number
  /** 切换动画时长（秒），默认 2 */
  switchDuration?: number
}

const EASE = "0.42 0 0.58 1"
const DEFAULT_SKEW_ANGLE = 15
const DEFAULT_STAY = 2
const DEFAULT_SWITCH = 2

const SkewPushY = (props: {
  canvasSize: { w: number; h: number }
  childItems: I_SkewPushChildItem[]
  skewAngle?: number
  itemGap?: number
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.childItems?.length) return null

  const { w, h } = props.canvasSize
  const items = props.childItems
  const N = items.length
  const itemGap = defaultTo(props.itemGap, 0)

  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  const contentW = max([1, w - itemGap * 2])
  const contentH = max([1, h - itemGap * 2])
  const maxAngle = max([1, floor(Math.atan(contentH / contentW) * 180 / Math.PI)])
  const skewAngle = min([max([rawAngle, 1]), maxAngle])

  const isDev = ExPubGoConfig().mode === 'development'

  const slotDurations = items.map(p =>
    defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH)
  )
  const T = slotDurations.reduce((a, b) => a + b, 0)

  const slotStarts = slotDurations.reduce<number[]>((acc, d, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + slotDurations[i - 1])
    return acc
  }, [])

  const offset = round(contentW * Math.tan(skewAngle * Math.PI / 180) / 2)

  const defaultIn = skewAngle
  const defaultOut = -skewAngle
  const resolveSkew = (dir?: T_DirectionX) =>
    dir === 'L' ? skewAngle : dir === 'R' ? -skewAngle : undefined

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
                const useItem = !!item.jsx
                const stay = defaultTo(item.stayDuration, DEFAULT_STAY)
                const sw = defaultTo(item.switchDuration, DEFAULT_SWITCH)
                const nextSw = defaultTo(items[(i + 1) % N].switchDuration, DEFAULT_SWITCH)
                const slotStart = slotStarts[i]
                // 参考 AnyPush 的 delay 逻辑
                // i=0: begin = -sw_0
                // i>0: begin = stay_0 + Σ_{j=1}^{i-1}(sw_j + stay_j)
                let actualBegin: number
                if (i === 0) {
                  actualBegin = -sw
                } else {
                  actualBegin = defaultTo(items[0].stayDuration, DEFAULT_STAY)
                  for (let j = 1; j < i; j++) {
                    actualBegin += defaultTo(items[j].switchDuration, DEFAULT_SWITCH)
                      + defaultTo(items[j].stayDuration, DEFAULT_STAY)
                  }
                }

                const k1 = (sw / T).toFixed(6)
                const k2 = ((sw + stay) / T).toFixed(6)
                const k3 = ((sw + stay + nextSw) / T).toFixed(6)
                const keyTimes = `0; ${k1}; ${k2}; ${k3}; 1`
                const keySplines = `${EASE}; ${EASE}; ${EASE}; ${EASE}`

                const itemSkewIn = resolveSkew(item.skewIn) ?? defaultIn
                const itemSkewOut = resolveSkew(item.skewOut) ?? defaultOut
                const itemXOff = itemSkewIn > 0 ? -offset : offset
                const ty = `${itemXOff} ${h + 1}; 0 0; 0 0; ${itemXOff} ${-(h + 1)}; ${itemXOff} ${-(h + 1)}`
                const sk = `${itemSkewIn}; 0; 0; ${itemSkewOut}; ${itemSkewOut}`

                return (
                  <g key={i}>
                    <animateTransform attributeName="transform" type="translate"
                      values={ty} keyTimes={keyTimes} keySplines={keySplines} dur={`${T}s`}
                      calcMode="spline" repeatCount="indefinite"
                      begin={`${actualBegin}s`} fill="freeze" />
                    <g>
                      <animateTransform attributeName="transform" type="skewX"
                        values={sk} keyTimes={keyTimes} keySplines={keySplines} dur={`${T}s`}
                        calcMode="spline" repeatCount="indefinite"
                        begin={`${actualBegin}s`} fill="freeze" />
                      <g transform={`translate(${-contentW / 2}, ${-contentH / 2})`}>
                        <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
                          {useItem
                            ? item.jsx
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
