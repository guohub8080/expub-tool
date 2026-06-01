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
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一） */
  jsx?: ReactNode
  /** 进入方向 L/R/T/B，默认 T */
  entryDirection?: T_Direction4
  /** 退出方向 L/R/T/B，默认与进入方向相反（T↔B，L↔R） */
  exitDirection?: T_Direction4
  /** 进入时的 skew 方向（L=正角度 / R=负角度），不传则由全局 isReversed 决定 */
  skewIn?: T_DirectionX
  /** 退出时的 skew 方向，不传则与 skewIn 相反 */
  skewOut?: T_DirectionX
  /** 停留时长（秒），默认 2 */
  stayDuration?: number
  /** 切换动画时长（秒），默认 2 */
  switchDuration?: number
}

// ease-in-out cubic-bezier，用于所有进入/退出动画
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

  // 总动画周期 = 所有图的 (switchDuration + stayDuration) 之和
  const T = items.reduce((s, p) =>
    s + defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH), 0)

  // L → 正 skew 角，R → 负 skew 角，undefined → 由调用方决定默认值
  const resolveSkew = (dir?: T_DirectionX, angle: number = 15) =>
    dir === 'L' ? angle : dir === 'R' ? -angle : undefined

  /**
   * 计算第 i 张图的 SMIL begin 时间。
   *
   * 设计原则：图1的 begin = -sw，使得 t=0 时图1恰好完成进入、处于全屏静止状态。
   * 后续图的 begin 依次累加，但整体减去一个完整周期 T，
   * 确保 t=0 时所有图的动画都已经运行过一轮、处于正确位置——
   * 否则 begin > 0 的图在 t=0 时动画尚未开始，<g> 会停在原点（全屏中心）造成闪烁。
   */
  const getBegin = (i: number) => {
    if (i === 0) return -defaultTo(items[0].switchDuration, DEFAULT_SWITCH)
    let b = defaultTo(items[0].stayDuration, DEFAULT_STAY)
    for (let j = 1; j < i; j++)
      b += defaultTo(items[j].switchDuration, DEFAULT_SWITCH) + defaultTo(items[j].stayDuration, DEFAULT_STAY)
    return b - T
  }

  // 渲染图片内容（url 模式或 jsx 模式），坐标系以画布中心为原点，这里平移回左上角
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
          {/*
            初始 visibility="hidden"，0.05s 后变 visible。
            目的：SMIL 引擎在第一个 paint 之前尚未初始化，若不隐藏，
            各图的 <g> 会在动画接管前短暂停在原点（全屏中心），造成初始闪烁。
          */}
          <g transform={`translate(${itemGap}, ${itemGap})`} visibility="hidden">
            <set attributeName="visibility" to="visible" begin="0.05s" fill="freeze" />
            {/* 坐标系平移到画布中心，所有图的 translate 动画以中心为原点计算 */}
            <g transform={`translate(${contentW / 2}, ${contentH / 2})`}>
              {items.map((item, i) => {
                const dir = defaultTo(item.entryDirection, DEFAULT_DIRECTION)
                const isVertical = dir === 'T' || dir === 'B'
                const isPositiveDir = dir === 'B' || dir === 'R'
                const stay = defaultTo(item.stayDuration, DEFAULT_STAY)
                const sw = defaultTo(item.switchDuration, DEFAULT_SWITCH)
                // 退出时长由下一张图的 switchDuration 决定（下一张进入时覆盖当前图退出）
                const nextSw = defaultTo(items[(i + 1) % N].switchDuration, DEFAULT_SWITCH)
                // hold = 在屏幕外等待下一轮进入的时间
                const holdTime = T - sw - stay - nextSw
                const actualBegin = getBegin(i)

                // skew 角度上限：防止图片边缘超出画布
                const maxAngle = isVertical
                  ? Math.max(1, Math.floor(Math.atan(contentW / contentH) * 180 / Math.PI))
                  : Math.max(1, Math.floor(Math.atan(contentH / contentW) * 180 / Math.PI))
                const skewAngle = Math.min(Math.max(rawAngle, 1), maxAngle)
                const defaultIn = reverse ? skewAngle : -skewAngle
                const itemSkewIn = resolveSkew(item.skewIn, skewAngle) ?? defaultIn
                const itemSkewOut = resolveSkew(item.skewOut, skewAngle) ?? -defaultIn

                // 进入/退出位置（translate 的起点和终点）
                // T/B 方向：skewX + Y 轴位移；L/R 方向：skewY + X 轴位移
                // xOff/yOff 是 skew 造成的横向/纵向补偿偏移，使图片边缘对齐画布边缘
                const exitDir = defaultTo(item.exitDirection, isVertical
                  ? (isPositiveDir ? 'T' : 'B')   // T进→B出，B进→T出
                  : (isPositiveDir ? 'L' : 'R'))   // R进→L出，L进→R出
                const isExitVertical = exitDir === 'T' || exitDir === 'B'
                const isExitPositive = exitDir === 'B' || exitDir === 'R'

                let enterTy: string, exitTy: string, skewType: 'skewX' | 'skewY'
                if (isVertical) {
                  const offset = Math.round(contentW * Math.tan(skewAngle * Math.PI / 180) / 2)
                  const xOff = itemSkewIn > 0 ? -offset : offset
                  enterTy = `${xOff} ${isPositiveDir ? h + 1 : -(h + 1)}`
                  skewType = 'skewX'
                } else {
                  const offset = Math.round(contentH * Math.tan(skewAngle * Math.PI / 180) / 2)
                  const yOff = itemSkewIn > 0 ? -offset : offset
                  enterTy = `${isPositiveDir ? w + 1 : -(w + 1)} ${yOff}`
                  skewType = 'skewY'
                }
                // exitTy 根据 exitDirection 独立计算，不依赖进入方向
                exitTy = isExitVertical
                  ? `0 ${isExitPositive ? -(h + 1) : h + 1}`
                  : `${isExitPositive ? -(w + 1) : w + 1} 0`

                // 4 段时间线：进入 → stay → 退出 → hold（stay=0 时跳过 stay 段，避免 keyTimes 相邻相等）
                // compileTimeline 不过滤 durationSeconds=0 的段，相邻相等的 keyTimes 在 calcMode="spline" 下非法
                const tySegs = [
                  { durationSeconds: sw,       to: '0 0',  keySplines: EASE },
                  ...(stay > 0 ? [{ durationSeconds: stay, to: '0 0', keySplines: EASE }] : []),
                  { durationSeconds: nextSw,   to: exitTy, keySplines: EASE },
                  { durationSeconds: holdTime, to: exitTy, keySplines: EASE },
                ]
                const skSegs = [
                  { durationSeconds: sw,       to: 0,           keySplines: EASE },
                  ...(stay > 0 ? [{ durationSeconds: stay, to: 0, keySplines: EASE }] : []),
                  { durationSeconds: nextSw,   to: itemSkewOut, keySplines: EASE },
                  { durationSeconds: holdTime, to: itemSkewOut, keySplines: EASE },
                ]
                const tyResult = compileTimeline(tySegs, v => v, enterTy)
                const skResult = compileTimeline(skSegs, v => `${v}`, itemSkewIn)

                return (
                  <g key={i}>
                    {/* 外层 translate：控制图片在 Y（或 X）轴上的进入/退出位移 */}
                    <animateTransform attributeName="transform" type="translate"
                      values={tyResult.values} keyTimes={tyResult.keyTimes} keySplines={tyResult.keySplines}
                      dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
                      begin={`${actualBegin}s`} fill="freeze" />
                    <g>
                      {/* 内层 skew：控制图片的斜切角度，与 translate 同步 */}
                      <animateTransform attributeName="transform" type={skewType}
                        values={skResult.values} keyTimes={skResult.keyTimes} keySplines={skResult.keySplines}
                        dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
                        begin={`${actualBegin}s`} fill="freeze" />
                      {renderContent(item)}
                    </g>
                  </g>
                )
              })}

              {/*
                Ghost Layer：图1的视觉副本，渲染在 DOM 最后（SVG z 轴最顶层）。

                问题背景：SVG 使用 painter's algorithm，DOM 靠后的元素覆盖靠前的元素。
                图1在 DOM 第一位（最底层），图N在最后（最顶层）。
                当图N退出、图1进入时，图N在上层会遮住图1，导致图1的进入动画不可见。

                解决方案：在 DOM 末尾放一个与图1完全相同的副本（Ghost），
                只在图1进入的那段时间内可见（visibility: hidden → visible → hidden），
                其余时间隐藏。这样视觉上图1始终能覆盖图N，实现"新图永远盖住旧图"的效果。

                时序：Ghost 的动画周期 = T，begin = 0s。
                - [0, T-sw0)：停在屏幕外，visibility=hidden（图1处于 stay/退出/hold 阶段）
                - [T-sw0, T)：执行与图1完全相同的进入动画，visibility=visible（图1进入阶段）
                - T 时刻：瞬间 hidden，图1已到位，Ghost 完成使命
              */}
              {N > 1 && (() => {
                const item0 = items[0]
                const dir0 = defaultTo(item0.entryDirection, DEFAULT_DIRECTION)
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

                // Ghost 在周期内的 keyTime：从这个时刻开始变 visible（= 图1进入开始）
                const ghostShowKt = ((T - sw0) / T).toFixed(6)

                // Ghost translate：前段停在屏幕外（enterTy），后段执行进入动画（→ 0 0）
                const ghostTy = compileTimeline(
                  [
                    { durationSeconds: T - sw0, to: ghostEnterTy, keySplines: EASE },
                    { durationSeconds: sw0,     to: '0 0',        keySplines: EASE },
                  ],
                  v => v,
                  ghostEnterTy,
                )
                // Ghost skew：前段保持进入角度，后段随进入动画归零
                const ghostSk = compileTimeline(
                  [
                    { durationSeconds: T - sw0, to: skewIn0, keySplines: EASE },
                    { durationSeconds: sw0,     to: 0,       keySplines: EASE },
                  ],
                  v => `${v}`,
                  skewIn0,
                )

                return (
                  <g key="ghost" visibility="hidden">
                    {/* visibility 切换：在图1进入段瞬间变 visible，进入完成后瞬间 hidden */}
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
