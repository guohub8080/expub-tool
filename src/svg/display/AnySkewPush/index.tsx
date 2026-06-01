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

const serializeXY = (v: [number, number]) => `${v[0]} ${v[1]}`
const serializeNum = (v: number) => `${v}`

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

  // 计算每张图的 actualBegin（与原逻辑一致）
  const getBegin = (i: number) => {
    if (i === 0) return -defaultTo(items[0].switchDuration, DEFAULT_SWITCH)
    let b = defaultTo(items[0].stayDuration, DEFAULT_STAY)
    for (let j = 1; j < i; j++)
      b += defaultTo(items[j].switchDuration, DEFAULT_SWITCH) + defaultTo(items[j].stayDuration, DEFAULT_STAY)
    return b
  }

  // 计算每张图的 translate/skew 进入/退出值
  const getItemGeometry = (item: I_AnySkewPushChildItem, nextItem: I_AnySkewPushChildItem) => {
    const dir = defaultTo(item.direction, DEFAULT_DIRECTION)
    const isVertical = dir === 'T' || dir === 'B'
    const isPositiveDir = dir === 'B' || dir === 'R'
    const nextDir = defaultTo(nextItem.direction, DEFAULT_DIRECTION)
    const nextIsPositive = nextDir === 'B' || nextDir === 'R'
    const nextIsVertical = nextDir === 'T' || nextDir === 'B'

    const maxAngle = isVertical
      ? Math.max(1, Math.floor(Math.atan(contentW / contentH) * 180 / Math.PI))
      : Math.max(1, Math.floor(Math.atan(contentH / contentW) * 180 / Math.PI))
    const skewAngle = Math.min(Math.max(rawAngle, 1), maxAngle)
    const defaultIn = reverse ? skewAngle : -skewAngle
    const itemSkewIn = resolveSkew(item.skewIn, skewAngle) ?? defaultIn
    const itemSkewOut = resolveSkew(item.skewOut, skewAngle) ?? -defaultIn

    // next item's exit angle (for this item's exit skew)
    const nextMaxAngle = nextIsVertical
      ? Math.max(1, Math.floor(Math.atan(contentW / contentH) * 180 / Math.PI))
      : Math.max(1, Math.floor(Math.atan(contentH / contentW) * 180 / Math.PI))
    const nextSkewAngle = Math.min(Math.max(rawAngle, 1), nextMaxAngle)
    const nextDefaultIn = reverse ? nextSkewAngle : -nextSkewAngle
    const nextSkewOut = resolveSkew(nextItem.skewOut, nextSkewAngle) ?? -nextDefaultIn

    let enterTy: [number, number]
    let exitTy: [number, number]
    let skewType: 'skewX' | 'skewY'

    if (isVertical) {
      const offset = Math.round(contentW * Math.tan(skewAngle * Math.PI / 180) / 2)
      const xOff = itemSkewIn > 0 ? -offset : offset
      enterTy = [xOff, isPositiveDir ? h + 1 : -(h + 1)]
      // exit direction follows next item's push direction
      const nextOffset = Math.round(contentW * Math.tan(nextSkewAngle * Math.PI / 180) / 2)
      const nextXOff = nextSkewOut > 0 ? -nextOffset : nextOffset
      exitTy = [nextXOff, nextIsPositive ? -(h + 1) : h + 1]
      skewType = 'skewX'
    } else {
      const offset = Math.round(contentH * Math.tan(skewAngle * Math.PI / 180) / 2)
      const yOff = itemSkewIn > 0 ? -offset : offset
      enterTy = [isPositiveDir ? w + 1 : -(w + 1), yOff]
      const nextOffset = Math.round(contentH * Math.tan(nextSkewAngle * Math.PI / 180) / 2)
      const nextYOff = nextSkewOut > 0 ? -nextOffset : nextOffset
      exitTy = [nextIsPositive ? -(w + 1) : w + 1, nextYOff]
      skewType = 'skewY'
    }

    return { enterTy, exitTy, itemSkewIn, itemSkewOut, skewType, skewAngle, nextSkewOut }
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
          <g transform={`translate(${itemGap}, ${itemGap})`}>
            <g transform={`translate(${contentW / 2}, ${contentH / 2})`}>
              {items.map((item, i) => {
                const nextItem = items[(i + 1) % N]
                const stay = defaultTo(item.stayDuration, DEFAULT_STAY)
                const sw = defaultTo(item.switchDuration, DEFAULT_SWITCH)
                const nextSw = defaultTo(nextItem.switchDuration, DEFAULT_SWITCH)
                const holdTime = T - sw - stay - nextSw
                const actualBegin = getBegin(i)
                const { enterTy, exitTy, itemSkewIn, itemSkewOut, skewType } = getItemGeometry(item, nextItem)

                const tyResult = compileTimeline(
                  [
                    { durationSeconds: sw,       to: [0, 0] as [number, number],  keySplines: EASE },
                    { durationSeconds: stay,      to: [0, 0] as [number, number],  keySplines: EASE },
                    { durationSeconds: nextSw,    to: exitTy,                      keySplines: EASE },
                    { durationSeconds: holdTime,  to: exitTy,                      keySplines: EASE },
                  ],
                  serializeXY,
                  enterTy,
                )

                const skResult = compileTimeline(
                  [
                    { durationSeconds: sw,       to: 0,          keySplines: EASE },
                    { durationSeconds: stay,      to: 0,          keySplines: EASE },
                    { durationSeconds: nextSw,    to: itemSkewOut, keySplines: EASE },
                    { durationSeconds: holdTime,  to: itemSkewOut, keySplines: EASE },
                  ],
                  serializeNum,
                  itemSkewIn,
                )

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

              {/* Ghost Layer: 图1副本，在图4退出/图1进入期间覆盖图4 */}
              {N > 1 && (() => {
                const firstItem = items[0]
                const sw0 = defaultTo(firstItem.switchDuration, DEFAULT_SWITCH)
                const stay0 = defaultTo(firstItem.stayDuration, DEFAULT_STAY)
                const nextSw0 = defaultTo(items[1].switchDuration, DEFAULT_SWITCH)
                const holdTime0 = T - sw0 - stay0 - nextSw0
                const { enterTy, itemSkewIn, skewType } = getItemGeometry(firstItem, items[1])

                // Ghost 时间线与图1完全一致，但 visibility 只在进入段末尾可见
                // 用 compileTimeline 生成与图1相同的 translate/skew
                const ghostTy = compileTimeline(
                  [
                    { durationSeconds: sw0,       to: [0, 0] as [number, number], keySplines: EASE },
                    { durationSeconds: stay0,      to: [0, 0] as [number, number], keySplines: EASE },
                    { durationSeconds: nextSw0,    to: enterTy,                    keySplines: EASE },
                    { durationSeconds: holdTime0,  to: enterTy,                    keySplines: EASE },
                  ],
                  serializeXY,
                  enterTy,
                )

                const ghostSk = compileTimeline(
                  [
                    { durationSeconds: sw0,       to: 0,          keySplines: EASE },
                    { durationSeconds: stay0,      to: 0,          keySplines: EASE },
                    { durationSeconds: nextSw0,    to: itemSkewIn, keySplines: EASE },
                    { durationSeconds: holdTime0,  to: itemSkewIn, keySplines: EASE },
                  ],
                  serializeNum,
                  itemSkewIn,
                )

                // visibility: 只在进入段 [T-sw0, T) 可见
                const ghostShowKt = ((T - sw0) / T).toFixed(6)
                const ghostHideKt = ((T - 0.001) / T).toFixed(6)

                return (
                  <g key="ghost" visibility="hidden">
                    <animate attributeName="visibility"
                      values={`hidden; hidden; visible; hidden`}
                      keyTimes={`0; ${ghostShowKt}; ${ghostHideKt}; 1`}
                      dur={`${T}s`} calcMode="discrete"
                      repeatCount="indefinite" begin={`${-sw0}s`} fill="freeze" />
                    <animateTransform attributeName="transform" type="translate"
                      values={ghostTy.values} keyTimes={ghostTy.keyTimes} keySplines={ghostTy.keySplines}
                      dur={`${T}s`} calcMode="spline"
                      repeatCount="indefinite" begin={`${-sw0}s`} fill="freeze" />
                    <g>
                      <animateTransform attributeName="transform" type={skewType}
                        values={ghostSk.values} keyTimes={ghostSk.keyTimes} keySplines={ghostSk.keySplines}
                        dur={`${T}s`} calcMode="spline"
                        repeatCount="indefinite" begin={`${-sw0}s`} fill="freeze" />
                      {renderContent(firstItem)}
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
