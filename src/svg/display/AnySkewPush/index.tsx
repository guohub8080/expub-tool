import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import { compileTimeline } from "@smil/timeline/compile"
import { renderSkewAnim, renderRotateAnim } from "./animations"
import { oppositeDir, getBegin, getOffscreenTy, DEFAULT_STAY, DEFAULT_SWITCH, DEFAULT_DIRECTION } from "./timeline"
import type { I_AnySkewPushChildItem } from "./types"

export type { I_SkewConfig, I_AnySkewPushChildItem } from "./types"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const EASE = "0.42 0 0.58 1"

const AnySkewPush = (props: {
  canvasSize: { w: number; h: number }
  childItems: I_AnySkewPushChildItem[]
  itemGap?: number
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.childItems?.length) return null

  const { w, h } = props.canvasSize
  const items = props.childItems
  const N = items.length
  const itemGap = defaultTo(props.itemGap, 0)
  const contentW = Math.max(1, w - itemGap * 2)
  const contentH = Math.max(1, h - itemGap * 2)
  const isDev = ExPubGoConfig().mode === 'development'

  // 总动画周期 = 所有图的 (switchDuration + stayDuration) 之和
  const T = items.reduce((s, p) =>
    s + defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH), 0)

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

  /**
   * Ghost Layer：图1的视觉副本，渲染在 DOM 最后（SVG z 轴最顶层）。
   *
   * 问题背景：SVG 使用 painter's algorithm，DOM 靠后的元素覆盖靠前的元素。
   * 图1在 DOM 第一位（最底层），图N在最后（最顶层）。
   * 当图N退出、图1进入时，图N在上层会遮住图1，导致图1的进入动画不可见。
   *
   * 解决方案：在 DOM 末尾放一个与图1完全相同的副本（Ghost），
   * 只在图1进入的那段时间内可见（visibility: hidden → visible → hidden），
   * 其余时间隐藏。这样视觉上图1始终能覆盖图N，实现"新图永远盖住旧图"的效果。
   */
  const renderGhostLayer = () => {
    if (N <= 1) return null

    const item0    = items[0]
    const dir0     = defaultTo(item0.entryDirection, DEFAULT_DIRECTION)
    const sw0      = defaultTo(item0.switchDuration, DEFAULT_SWITCH)
    const enterTy0 = getOffscreenTy(dir0, w, h)

    const ghostShowKt = ((T - sw0) / T).toFixed(6)

    const ghostTy = compileTimeline(
      [
        { durationSeconds: T - sw0, to: enterTy0, keySplines: EASE },
        { durationSeconds: sw0,     to: '0 0',    keySplines: EASE },
      ],
      v => v,
      enterTy0,
    )

    const ghostSkewAnim = item0.entrySkew && (() => {
      const result = compileTimeline(
        [
          { durationSeconds: T - sw0, to: item0.entrySkew!.angle, keySplines: EASE },
          { durationSeconds: sw0,     to: 0,                      keySplines: EASE },
        ],
        v => `${v}`,
        item0.entrySkew!.angle,
      )
      return (
        <animateTransform attributeName="transform" type={`skew${item0.entrySkew!.type}` as 'skewX' | 'skewY'}
          values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
          dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
      )
    })()

    const ghostRotateAnim = !isNil(item0.entryRotation) && (() => {
      const result = compileTimeline(
        [
          { durationSeconds: T - sw0, to: item0.entryRotation!, keySplines: EASE },
          { durationSeconds: sw0,     to: 0,                    keySplines: EASE },
        ],
        v => `${v} 0 0`,
        item0.entryRotation!,
      )
      return (
        <animateTransform attributeName="transform" type="rotate"
          values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
          dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
      )
    })()

    return (
      <g key="ghost" visibility="hidden">
        <animate attributeName="visibility"
          values="hidden; visible; hidden"
          keyTimes={`0; ${ghostShowKt}; 1`}
          dur={`${T}s`} calcMode="discrete"
          repeatCount="indefinite" begin="0s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate"
          values={ghostTy.values} keyTimes={ghostTy.keyTimes} keySplines={ghostTy.keySplines}
          dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
        <g>
          {ghostSkewAnim}
          {ghostRotateAnim}
          {renderContent(item0)}
        </g>
      </g>
    )
  }

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
                const dir      = defaultTo(item.entryDirection, DEFAULT_DIRECTION)
                const exitDir  = defaultTo(item.exitDirection, oppositeDir(dir))
                const stay     = defaultTo(item.stayDuration, DEFAULT_STAY)
                const sw       = defaultTo(item.switchDuration, DEFAULT_SWITCH)
                const nextSw   = defaultTo(items[(i + 1) % N].switchDuration, DEFAULT_SWITCH)
                const holdTime = T - sw - stay - nextSw
                const begin    = getBegin(i, items, T)
                const enterTy  = getOffscreenTy(dir, w, h)
                const exitTy   = getOffscreenTy(exitDir, w, h)

                const tySegs = [
                  { durationSeconds: sw,       to: '0 0',  keySplines: EASE },
                  ...(stay > 0 ? [{ durationSeconds: stay, to: '0 0', keySplines: EASE }] : []),
                  { durationSeconds: nextSw,   to: exitTy, keySplines: EASE },
                  { durationSeconds: holdTime, to: exitTy, keySplines: EASE },
                ]
                const tyResult = compileTimeline(tySegs, v => v, enterTy)

                return (
                  <g key={i}>
                    <animateTransform attributeName="transform" type="translate"
                      values={tyResult.values} keyTimes={tyResult.keyTimes} keySplines={tyResult.keySplines}
                      dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
                      begin={`${begin}s`} fill="freeze" />
                    <g>
                      {renderSkewAnim(item.entrySkew, item.exitSkew, stay, sw, nextSw, holdTime, begin, T)}
                      {renderRotateAnim(item.entryRotation, item.exitRotation, stay, sw, nextSw, holdTime, begin, T)}
                      {renderContent(item)}
                    </g>
                  </g>
                )
              })}

              {renderGhostLayer()}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnySkewPush
