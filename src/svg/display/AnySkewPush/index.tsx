import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import type { ReactNode } from "react"
import type { T_DirectionX, T_Direction4 } from "../../types"

export interface I_AnySkewPushChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
  /** 推入方向 L/R/T/B，默认 T */
  direction?: T_Direction4
  /** 进入 skew 方向，不传则继承全局 isReversed */
  skewIn?: T_DirectionX
  /** 退出 skew 方向，不传则与 skewIn 相反 */
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
const DEFAULT_DIRECTION: T_Direction4 = 'T'

const AnySkewPush = (props: {
  canvasSize: { w: number; h: number }
  childItems: I_AnySkewPushChildItem[]
  skewAngle?: number
  isReversed?: boolean
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
  const contentW = Math.max(1, w - itemGap * 2)
  const contentH = Math.max(1, h - itemGap * 2)
  const reverse = defaultTo(props.isReversed, false)
  const isDev = ExPubGoConfig().mode === 'development'

  const slotDurations = items.map(p =>
    defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH)
  )
  const T = slotDurations.reduce((a, b) => a + b, 0)

  const slotStarts = slotDurations.reduce<number[]>((acc, d, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + slotDurations[i - 1])
    return acc
  }, [])

  const resolveSkew = (dir?: T_DirectionX, angle: number = 15) =>
    dir === 'L' ? angle : dir === 'R' ? -angle : undefined

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-skew-push' } : {})}
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
                const dir = defaultTo(item.direction, DEFAULT_DIRECTION)
                const isVertical = dir === 'T' || dir === 'B'
                const isPositiveDir = dir === 'B' || dir === 'R'

                const useItem = !!item.jsx
                const stay = defaultTo(item.stayDuration, DEFAULT_STAY)
                const sw = defaultTo(item.switchDuration, DEFAULT_SWITCH)
                const nextSw = defaultTo(items[(i + 1) % N].switchDuration, DEFAULT_SWITCH)

                // begin 参考 AnyPush
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

                // skew 角度限制
                const maxAngle = isVertical
                  ? Math.max(1, Math.floor(Math.atan(contentW / contentH) * 180 / Math.PI))
                  : Math.max(1, Math.floor(Math.atan(contentH / contentW) * 180 / Math.PI))
                const skewAngle = Math.min(Math.max(rawAngle, 1), maxAngle)

                const defaultIn = reverse ? skewAngle : -skewAngle
                const defaultOut = -defaultIn
                const itemSkewIn = resolveSkew(item.skewIn, skewAngle) ?? defaultIn
                const itemSkewOut = resolveSkew(item.skewOut, skewAngle) ?? defaultOut

                // 生成 translate / skew 值
                let ty: string
                let sk: string
                let skewType: 'skewX' | 'skewY'

                if (isVertical) {
                  // T/B: skewX + y 方向 translate
                  const offset = Math.round(contentW * Math.tan(skewAngle * Math.PI / 180) / 2)
                  const xOff = itemSkewIn > 0 ? -offset : offset
                  const enterY = isPositiveDir ? h + 1 : -(h + 1)
                  const exitY = isPositiveDir ? -(h + 1) : h + 1
                  ty = `${xOff} ${enterY}; 0 0; 0 0; ${xOff} ${exitY}; ${xOff} ${exitY}`
                  sk = `${itemSkewIn}; 0; 0; ${itemSkewOut}; ${itemSkewOut}`
                  skewType = 'skewX'
                } else {
                  // L/R: skewY + x 方向 translate
                  const offset = Math.round(contentH * Math.tan(skewAngle * Math.PI / 180) / 2)
                  const yOff = itemSkewIn > 0 ? -offset : offset
                  const enterX = isPositiveDir ? w + 1 : -(w + 1)
                  const exitX = isPositiveDir ? -(w + 1) : w + 1
                  ty = `${enterX} ${yOff}; 0 0; 0 0; ${exitX} ${yOff}; ${exitX} ${yOff}`
                  sk = `${itemSkewIn}; 0; 0; ${itemSkewOut}; ${itemSkewOut}`
                  skewType = 'skewY'
                }

                return (
                  <g key={i}>
                    <animateTransform attributeName="transform" type="translate"
                      values={ty} keyTimes={keyTimes} keySplines={keySplines} dur={`${T}s`}
                      calcMode="spline" repeatCount="indefinite"
                      begin={`${actualBegin}s`} fill="freeze" />
                    <g>
                      <animateTransform attributeName="transform" type={skewType}
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

export default AnySkewPush
