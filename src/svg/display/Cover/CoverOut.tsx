import defaultTo from "lodash/defaultTo"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import svgURL from "@utils/svg/svgURL"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import type { I_CanvasBg } from "@svg/types"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate } from "@smil/index"
import type { I_AbsRelKeyframe, I_TranslateValue } from "@smil/index"
import { normalizeItems, getExitOffset, calcTotalDuration } from "./utils"
import type { I_CoverChildItem, I_NormalizedCoverItem } from "./types"

/**
 * CoverOut — 层层覆盖滑出组件
 *
 * 多张图片叠加显示，依次滑出退场，露出下层图片。
 * 渲染顺序倒序（图 N 在最下，图 0 在最上），利用 SVG painter's algorithm。
 *
 * 两阶段动画设计（与 CoverIn 一致，保证首尾相接）：
 *
 *   阶段 1 — 首轮（repeatCount=1）：
 *     所有图在中心，依次滑出退场（一次性，fill=freeze）
 *
 *   阶段 2 — 循环（repeatCount=indefinite）：
 *     所有图循环滑出，begin = totalDuration
 *     阶段 1 结束时阶段 2 立即接管，视觉无缝衔接
 */
const CoverOut = (props: {
  canvasSize: { w: number; h: number }
  childItems: I_CoverChildItem[]
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))

  const { w, h } = props.canvasSize
  const items = normalizeItems(props.childItems)
  const N = items.length
  const totalDuration = calcTotalDuration(items)
  const isDev = ExPubGoConfig().mode === "development"

  // 渲染顺序倒序：图 N-1 在最下，图 0 在最上
  const renderOrder = [...Array(N).keys()].reverse()

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'cover-out' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "none", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult,
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }}
          width="100%"
        >
          {/* 底层静态图 0：最后一张滑走后露出，循环无缝 */}
          <g>
            <foreignObject x={0} y={0} width={w} height={h}>
              {renderContent(items[0], w, h)}
            </foreignObject>
          </g>

          {/* ══════ 阶段 1：首轮 ══════ */}
          {renderOrder.map(i => (
            <CoverOutOnceItem
              key={`first-${i}`}
              item={items[i]}
              index={i}
              items={items}
              viewBoxW={w}
              viewBoxH={h}
              totalDuration={totalDuration}
            />
          ))}

          {/* ══════ 阶段 2：循环 ══════ */}
          {renderOrder.map(i => (
            <CoverOutLoopItem
              key={`loop-${i}`}
              item={items[i]}
              index={i}
              items={items}
              viewBoxW={w}
              viewBoxH={h}
              totalDuration={totalDuration}
            />
          ))}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

// ── 阶段 1：首轮滑出（一次性） ──

const CoverOutOnceItem = (props: {
  item: I_NormalizedCoverItem
  index: number
  items: I_NormalizedCoverItem[]
  viewBoxW: number
  viewBoxH: number
  totalDuration: number
}) => {
  const { item, index, items, viewBoxW, viewBoxH, totalDuration } = props

  const slideOut = getExitOffset(item.direction, viewBoxW, viewBoxH)

  // 滑出开始时间 = 前面所有图的 (stay + cover) + 当前图的 stay
  let slideOutStartTime = 0
  for (let i = 0; i < index; i++) {
    slideOutStartTime += items[i].stayDuration + items[i].coverDuration
  }
  slideOutStartTime += item.stayDuration

  const afterDuration = totalDuration - slideOutStartTime - item.coverDuration

  const timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[] = []

  // 1. 可见段：在中心停留
  if (slideOutStartTime > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: slideOutStartTime })
  }
  // 2. 滑出段
  timeline.push({ toRel: slideOut, durationSeconds: item.coverDuration, keySplines: item.keySplines })
  // 3. 保持到首轮结束
  if (afterDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: afterDuration })
  }

  const content = renderContent(item, viewBoxW, viewBoxH)

  return (
    <g>
      <foreignObject x={0} y={0} width={viewBoxW} height={viewBoxH}>
        {content}
      </foreignObject>
      {transformTranslate({
        initValue: { x: 0, y: 0 },
        timeline,
        begin: "0s",
        loopCount: 1,
        isFreeze: true,
        isAdditive: true,
      })}
    </g>
  )
}

// ── 阶段 2：循环滑出（无限循环） ──

const CoverOutLoopItem = (props: {
  item: I_NormalizedCoverItem
  index: number
  items: I_NormalizedCoverItem[]
  viewBoxW: number
  viewBoxH: number
  totalDuration: number
}) => {
  const { item, index, items, viewBoxW, viewBoxH, totalDuration } = props

  const slideOut = getExitOffset(item.direction, viewBoxW, viewBoxH)

  // 滑出开始时间
  let slideOutStartTime = 0
  for (let i = 0; i < index; i++) {
    slideOutStartTime += items[i].stayDuration + items[i].coverDuration
  }
  slideOutStartTime += item.stayDuration

  const waitDuration = totalDuration - slideOutStartTime - item.coverDuration

  const timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[] = []

  // 1. 可见段：在中心停留
  if (slideOutStartTime > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: slideOutStartTime })
  }
  // 2. 滑出段
  timeline.push({ toRel: slideOut, durationSeconds: item.coverDuration, keySplines: item.keySplines })
  // 3. 等待段：在屏外等待
  if (waitDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: waitDuration })
  }

  const content = renderContent(item, viewBoxW, viewBoxH)

  return (
    <g>
      <foreignObject x={0} y={0} width={viewBoxW} height={viewBoxH}>
        {content}
      </foreignObject>
      {transformTranslate({
        initValue: { x: 0, y: 0 },
        timeline,
        begin: `${totalDuration}s`,
        loopCount: 0,
        isFreeze: true,
        isAdditive: true,
      })}
    </g>
  )
}

// ── 渲染内容 ──

const renderContent = (item: I_NormalizedCoverItem, w: number, h: number) => {
  if (item.useJsx) return item.jsx
  return (
    <SvgEx viewBox={`0 0 ${w} ${h}`}
      style={{
        display: "block",
        backgroundImage: svgURL(item.url!),
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      width="100%"
    />
  )
}

export default CoverOut
