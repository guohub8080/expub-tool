import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import { compileTimeline } from "@smil/timeline/compile"
import { renderSkewAnim, renderRotateAnim, renderGhostLayer } from "./animations"
import { oppositeDir, getBegin, getOffscreenTy, DEFAULT_STAY, DEFAULT_SWITCH, DEFAULT_DIRECTION } from "./timeline"
import type { I_AnySkewPushChildItem } from "./types"

export type { I_SkewConfig, I_AnySkewPushChildItem } from "./types"

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
                // 退出时长由下一张图的 switchDuration 决定（下一张进入时覆盖当前图退出）
                const nextSw   = defaultTo(items[(i + 1) % N].switchDuration, DEFAULT_SWITCH)
                // hold = 在屏幕外等待下一轮进入的时间
                const holdTime = T - sw - stay - nextSw
                const begin    = getBegin(i, items, T)
                const enterTy  = getOffscreenTy(dir, w, h)
                const exitTy   = getOffscreenTy(exitDir, w, h)

                // translate 4段时间线：进入 → stay → 退出 → hold
                // stay=0 时跳过 stay 段，避免 keyTimes 相邻相等（calcMode=spline 下非法）
                const tySegs = [
                  { durationSeconds: sw,       to: '0 0',  keySplines: EASE },
                  ...(stay > 0 ? [{ durationSeconds: stay, to: '0 0', keySplines: EASE }] : []),
                  { durationSeconds: nextSw,   to: exitTy, keySplines: EASE },
                  { durationSeconds: holdTime, to: exitTy, keySplines: EASE },
                ]
                const tyResult = compileTimeline(tySegs, v => v, enterTy)

                return (
                  <g key={i}>
                    {/* 外层 translate：控制图片的进入/退出位移 */}
                    <animateTransform attributeName="transform" type="translate"
                      values={tyResult.values} keyTimes={tyResult.keyTimes} keySplines={tyResult.keySplines}
                      dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
                      begin={`${begin}s`} fill="freeze" />
                    <g>
                      {/* 可选变换：skew 和 rotate，不传时不渲染对应的 animateTransform */}
                      {renderSkewAnim(item.entrySkew, item.exitSkew, stay, sw, nextSw, holdTime, begin, T)}
                      {renderRotateAnim(item.entryRotation, item.exitRotation, stay, sw, nextSw, holdTime, begin, T)}
                      {renderContent(item)}
                    </g>
                  </g>
                )
              })}

              {N > 1 && renderGhostLayer(
                items[0],
                getOffscreenTy(defaultTo(items[0].entryDirection, DEFAULT_DIRECTION), w, h),
                defaultTo(items[0].switchDuration, DEFAULT_SWITCH),
                T,
                renderContent,
              )}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnySkewPush
