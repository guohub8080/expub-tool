import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import { compileTimeline } from "@smil/timeline/compile"
import type { ReactNode } from "react"
import type { T_DirectionX, T_Direction4 } from "../../types"

export interface I_AnySkewPushChildItem {
  url?: string
  jsx?: ReactNode
  direction?: T_Direction4
  skewIn?: T_DirectionX
  skewOut?: T_DirectionX
  stayDuration?: number
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

  const T = items.reduce((s, p) =>
    s + defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH), 0)

  const resolveSkew = (dir?: T_DirectionX, angle: number = 15) =>
    dir === 'L' ? angle : dir === 'R' ? -angle : undefined

  const getBegin = (i: number) => {
    if (i === 0) return -defaultTo(items[0].switchDuration, DEFAULT_SWITCH)
    let b = defaultTo(items[0].stayDuration, DEFAULT_STAY)
    for (let j = 1; j < i; j++)
      b += defaultTo(items[j].switchDuration, DEFAULT_SWITCH) + defaultTo(items[j].stayDuration, DEFAULT_STAY)
    return b - T  // 提前一个完整周期，确保 t=0 时动画已处于正确位置
  }

  const renderContent = (item: I_AnySkewPushChildItem) => (
    <g transform={`translate(${-contentW / 2}, ${-contentH / 2})`}>
      <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
        {item.jsx
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
  )

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
          <g transform={`translate(${itemGap}, ${itemGap})`} visibility="hidden">
            <set attributeName="visibility" to="visible" begin="0.05s" fill="freeze" />
            <g transform={`translate(${contentW / 2}, ${contentH / 2})`}>
              {items.map((item, i) => {
                const dir = defaultTo(item.direction, DEFAULT_DIRECTION)
                const isVertical = dir === 'T' || dir === 'B'
                const isPositiveDir = dir === 'B' || dir === 'R'
                const stay = defaultTo(item.stayDuration, DEFAULT_STAY)
                const sw = defaultTo(item.switchDuration, DEFAULT_SWITCH)
                const nextSw = defaultTo(items[(i + 1) % N].switchDuration, DEFAULT_SWITCH)
                const holdTime = T - sw - stay - nextSw
                const actualBegin = getBegin(i)

                const maxAngle = isVertical
                  ? Math.max(1, Math.floor(Math.atan(contentW / contentH) * 180 / Math.PI))
                  : Math.max(1, Math.floor(Math.atan(contentH / contentW) * 180 / Math.PI))
                const skewAngle = Math.min(Math.max(rawAngle, 1), maxAngle)
                const defaultIn = reverse ? skewAngle : -skewAngle
                const itemSkewIn = resolveSkew(item.skewIn, skewAngle) ?? defaultIn
                const itemSkewOut = resolveSkew(item.skewOut, skewAngle) ?? -defaultIn

                let enterTy: string, exitTy: string, skewType: 'skewX' | 'skewY'
                if (isVertical) {
                  const offset = Math.round(contentW * Math.tan(skewAngle * Math.PI / 180) / 2)
                  const xOff = itemSkewIn > 0 ? -offset : offset
                  enterTy = `${xOff} ${isPositiveDir ? h + 1 : -(h + 1)}`
                  exitTy  = `${xOff} ${isPositiveDir ? -(h + 1) : h + 1}`
                  skewType = 'skewX'
                } else {
                  const offset = Math.round(contentH * Math.tan(skewAngle * Math.PI / 180) / 2)
                  const yOff = itemSkewIn > 0 ? -offset : offset
                  enterTy = `${isPositiveDir ? w + 1 : -(w + 1)} ${yOff}`
                  exitTy  = `${isPositiveDir ? -(w + 1) : w + 1} ${yOff}`
                  skewType = 'skewY'
                }

                const tySegs = [
                  { durationSeconds: sw,      to: '0 0',  keySplines: EASE },
                  ...(stay > 0 ? [{ durationSeconds: stay, to: '0 0', keySplines: EASE }] : []),
                  { durationSeconds: nextSw,  to: exitTy, keySplines: EASE },
                  { durationSeconds: holdTime, to: exitTy, keySplines: EASE },
                ]
                const skSegs = [
                  { durationSeconds: sw,      to: 0,           keySplines: EASE },
                  ...(stay > 0 ? [{ durationSeconds: stay, to: 0, keySplines: EASE }] : []),
                  { durationSeconds: nextSw,  to: itemSkewOut, keySplines: EASE },
                  { durationSeconds: holdTime, to: itemSkewOut, keySplines: EASE },
                ]
                const tyResult = compileTimeline(tySegs, v => v, enterTy)
                const skResult = compileTimeline(skSegs, v => `${v}`, itemSkewIn)

                return (
                  <g key={i}>
                    <animateTransform attributeName="transform" type="translate"
                      values={tyResult.values} keyTimes={tyResult.keyTimes} keySplines={tyResult.keySplines}
                      dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
                      begin={`${actualBegin}s`} fill="freeze" />
                    <g>
                      <animateTransform attributeName="transform" type={skewType}
                        values={skResult.values} keyTimes={skResult.keyTimes} keySplines={skResult.keySplines}
                        dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
                        begin={`${actualBegin}s`} fill="freeze" />
                      {renderContent(item)}
                    </g>
                  </g>
                )
              })}

              {/* Ghost Layer: 图1副本，在图4退出/图1进入期间覆盖图4，每轮循环重复 */}
              {N > 1 && (() => {
                const item0 = items[0]
                const dir0 = defaultTo(item0.direction, DEFAULT_DIRECTION)
                const isVertical0 = dir0 === 'T' || dir0 === 'B'
                const isPositive0 = dir0 === 'B' || dir0 === 'R'
                const sw0 = defaultTo(item0.switchDuration, DEFAULT_SWITCH)

                const maxAngle0 = isVertical0
                  ? Math.max(1, Math.floor(Math.atan(contentW / contentH) * 180 / Math.PI))
                  : Math.max(1, Math.floor(Math.atan(contentH / contentW) * 180 / Math.PI))
                const skewAngle0 = Math.min(Math.max(rawAngle, 1), maxAngle0)
                const defaultIn0 = reverse ? skewAngle0 : -skewAngle0
                const skewIn0 = resolveSkew(item0.skewIn, skewAngle0) ?? defaultIn0

                let ghostEnterTy: string, ghostSkewType: 'skewX' | 'skewY'
                if (isVertical0) {
                  const offset = Math.round(contentW * Math.tan(skewAngle0 * Math.PI / 180) / 2)
                  ghostEnterTy = `${skewIn0 > 0 ? -offset : offset} ${isPositive0 ? h + 1 : -(h + 1)}`
                  ghostSkewType = 'skewX'
                } else {
                  const offset = Math.round(contentH * Math.tan(skewAngle0 * Math.PI / 180) / 2)
                  ghostEnterTy = `${isPositive0 ? w + 1 : -(w + 1)} ${skewIn0 > 0 ? -offset : offset}`
                  ghostSkewType = 'skewY'
                }

                // Ghost 与图1进入段完全同步：begin=T-sw0（每轮），dur=sw0，从 enterTy → 0 0
                // 用 begin 列表实现每轮重复（SMIL 支持分号分隔的多个 begin 时间）
                // 但 SMIL 不支持无限 begin 列表，所以用 dur=T + repeatCount=indefinite 方案：
                // Ghost 的动画周期=T，begin=-sw0（与图1同步），只在进入段做动画，其余时间 visibility=hidden
                const ghostShowKt = ((T - sw0) / T).toFixed(6)

                const ghostTy = compileTimeline(
                  [
                    { durationSeconds: T - sw0, to: ghostEnterTy, keySplines: EASE },
                    { durationSeconds: sw0,      to: '0 0',        keySplines: EASE },
                  ],
                  v => v,
                  ghostEnterTy,
                )
                const ghostSk = compileTimeline(
                  [
                    { durationSeconds: T - sw0, to: skewIn0, keySplines: EASE },
                    { durationSeconds: sw0,      to: 0,       keySplines: EASE },
                  ],
                  v => `${v}`,
                  skewIn0,
                )

                return (
                  <g key="ghost" visibility="hidden">
                    <animate attributeName="visibility"
                      values={`hidden; visible; hidden`}
                      keyTimes={`0; ${ghostShowKt}; 1`}
                      dur={`${T}s`} calcMode="discrete"
                      repeatCount="indefinite" begin="0s" fill="freeze" />
                    <animateTransform attributeName="transform" type="translate"
                      values={ghostTy.values} keyTimes={ghostTy.keyTimes} keySplines={ghostTy.keySplines}
                      dur={`${T}s`} calcMode="spline"
                      repeatCount="indefinite" begin="0s" fill="freeze" />
                    <g>
                      <animateTransform attributeName="transform" type={ghostSkewType}
                        values={ghostSk.values} keyTimes={ghostSk.keyTimes} keySplines={ghostSk.keySplines}
                        dur={`${T}s`} calcMode="spline"
                        repeatCount="indefinite" begin="0s" fill="freeze" />
                      {renderContent(item0)}
                    </g>
                  </g>
                )
              })()}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnySkewPush
