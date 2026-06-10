import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import svgURL from "@utils/svg/svgURL"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import type { I_CanvasBg } from "@svg/types"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate, animateOpacity } from "@smil/index"
import type { I_AbsRelKeyframe, I_TranslateValue } from "@smil/index"
import { normalizeItems, getEntryOffset, getExitOffset, calcTotalDuration } from "./utils"
import type { I_CoverChildItem, I_NormalizedCoverItem } from "./types"

/**
 * CoverIn — 层层覆盖滑入组件
 *
 * 多张图片依次从屏外滑入，覆盖当前画面，形成层层刷新效果。
 * 后渲染的 DOM 元素在 SVG z 轴上方，自然覆盖前一张图。
 *
 * 两阶段动画设计（与原版一致，保证首尾相接）：
 *
 *   阶段 1 — 首轮（repeatCount=1）：
 *     图 0 作为初始静态底图（淡出退场）
 *     图 1..N-1 依次滑入覆盖（一次性动画，fill=freeze）
 *
 *   阶段 2 — 循环（repeatCount=indefinite）：
 *     所有图（0..N-1）循环滑入，begin = firstRoundDuration
 *     阶段 1 结束时阶段 2 立即接管，视觉无缝衔接
 */
const CoverIn = (props: {
  canvasSize: { w: number; h: number }
  childItems: I_CoverChildItem[]
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.childItems) || props.childItems.length === 0) return null

  const { w, h } = props.canvasSize
  const items = normalizeItems(props.childItems)
  const N = items.length
  const loopDuration = calcTotalDuration(items)
  const isDev = ExPubGoConfig().mode === "development"

  // ── 首轮时长 = 图0 停留 + 图1..N-1 的(滑入+停留) ──
  const firstRoundDuration = items[0].stayDuration
    + items.slice(1).reduce((sum, item) => sum + item.coverDuration + item.stayDuration, 0)

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'cover-in' } : {})}
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
          {/* ══════ 阶段 1：首轮 ══════ */}

          {/* 图 0 — 初始静态底图，首轮结束后淡出 */}
          <InitialStaticLayer
            item={items[0]}
            viewBoxW={w}
            viewBoxH={h}
            firstRoundDuration={firstRoundDuration}
          />

          {/* 图 1..N-1 — 首轮依次滑入（一次性） */}
          {items.slice(1).map((item, i) => (
            <SlideOnceLayer
              key={`first-${i}`}
              item={item}
              slideIndex={i}
              firstRoundSlides={items.slice(1)}
              viewBoxW={w}
              viewBoxH={h}
              firstRoundDuration={firstRoundDuration}
              timeOffset={items[0].stayDuration}
            />
          ))}

          {/* ══════ 阶段 2：循环 ══════ */}
          {items.map((item, i) => (
            <SlideLoopLayer
              key={`loop-${i}`}
              item={item}
              index={i}
              items={items}
              viewBoxW={w}
              viewBoxH={h}
              loopDuration={loopDuration}
              firstRoundDuration={firstRoundDuration}
            />
          ))}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

// ── 阶段 1：初始静态底图 ──

const InitialStaticLayer = (props: {
  item: I_NormalizedCoverItem
  viewBoxW: number
  viewBoxH: number
  firstRoundDuration: number
}) => {
  const { item, viewBoxW, viewBoxH, firstRoundDuration } = props
  const fadeTime = item.stayDuration

  const content = renderContent(item, viewBoxW, viewBoxH)

  return (
    <g>
      <foreignObject x={0} y={0} width={viewBoxW} height={viewBoxH}>
        {content}
      </foreignObject>
      {/* 首轮内：停留 → 淡出，一次性 */}
      {animateOpacity({
        initValue: 1,
        timeline: [
          { toAbs: 1, durationSeconds: fadeTime },
          { toAbs: 0, durationSeconds: firstRoundDuration - fadeTime },
        ],
        begin: "0s",
        loopCount: 1,
        isFreeze: true,
      })}
    </g>
  )
}

// ── 阶段 1：首轮滑入（一次性） ──

const SlideOnceLayer = (props: {
  item: I_NormalizedCoverItem
  slideIndex: number
  firstRoundSlides: I_NormalizedCoverItem[]
  viewBoxW: number
  viewBoxH: number
  firstRoundDuration: number
  timeOffset: number
}) => {
  const { item, slideIndex, firstRoundSlides, viewBoxW, viewBoxH, firstRoundDuration, timeOffset } = props

  const entryPos = getEntryOffset(item.direction, viewBoxW, viewBoxH)
  const slideRel = getExitOffset(item.direction, viewBoxW, viewBoxH)

  // 等待时长 = timeOffset + 前面所有首轮图的 (cover + stay)
  let waitDuration = timeOffset
  for (let i = 0; i < slideIndex; i++) {
    waitDuration += firstRoundSlides[i].coverDuration + firstRoundSlides[i].stayDuration
  }
  const stayDuration = item.stayDuration
  const afterDuration = firstRoundDuration - waitDuration - item.coverDuration - stayDuration

  const timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[] = []

  // 等待
  if (waitDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: waitDuration })
  }
  // 滑入
  timeline.push({ toRel: slideRel, durationSeconds: item.coverDuration, keySplines: item.keySplines })
  // 停留
  if (stayDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: stayDuration })
  }
  // 保持到首轮结束
  if (afterDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: afterDuration })
  }

  const content = renderContent(item, viewBoxW, viewBoxH)

  return (
    <g>
      <foreignObject x={entryPos.x} y={entryPos.y} width={viewBoxW} height={viewBoxH}>
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

// ── 阶段 2：循环滑入（无限循环） ──

const SlideLoopLayer = (props: {
  item: I_NormalizedCoverItem
  index: number
  items: I_NormalizedCoverItem[]
  viewBoxW: number
  viewBoxH: number
  loopDuration: number
  firstRoundDuration: number
}) => {
  const { item, index, items, viewBoxW, viewBoxH, loopDuration, firstRoundDuration } = props

  const entryPos = getEntryOffset(item.direction, viewBoxW, viewBoxH)
  const slideRel = getExitOffset(item.direction, viewBoxW, viewBoxH)

  // 等待时长 = 前面所有图的 (cover + stay) 之和
  let waitDuration = 0
  for (let i = 0; i < index; i++) {
    waitDuration += items[i].coverDuration + items[i].stayDuration
  }
  const coveredDuration = loopDuration - waitDuration - item.coverDuration - item.stayDuration

  const timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[] = []

  // 等待
  if (waitDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: waitDuration })
  }
  // 滑入
  timeline.push({ toRel: slideRel, durationSeconds: item.coverDuration, keySplines: item.keySplines })
  // 停留
  if (item.stayDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: item.stayDuration })
  }
  // 被覆盖
  if (coveredDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: coveredDuration })
  }

  const content = renderContent(item, viewBoxW, viewBoxH)

  return (
    <g>
      <foreignObject x={entryPos.x} y={entryPos.y} width={viewBoxW} height={viewBoxH}>
        {content}
      </foreignObject>
      {transformTranslate({
        initValue: { x: 0, y: 0 },
        timeline,
        begin: `${firstRoundDuration}s`,
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

export default CoverIn
