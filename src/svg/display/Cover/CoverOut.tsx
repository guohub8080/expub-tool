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
 * 动画周期内每张图的时间线：
 *   停留（中心可见） → 滑出（coverDuration） → 屏外等待
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
          {renderOrder.map(i => (
            <CoverOutItem
              key={i}
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

// ── 单项渲染 ──

const CoverOutItem = (props: {
  item: I_NormalizedCoverItem
  index: number
  items: I_NormalizedCoverItem[]
  viewBoxW: number
  viewBoxH: number
  totalDuration: number
}) => {
  const { item, index, items, viewBoxW, viewBoxH, totalDuration } = props

  // 滑出位移
  const slideOut = getExitOffset(item.direction, viewBoxW, viewBoxH)

  // 计算滑出开始时间 = 前面所有图的 (stay + cover) + 当前图的 stay
  let slideOutStartTime = 0
  for (let i = 0; i < index; i++) {
    slideOutStartTime += items[i].stayDuration + items[i].coverDuration
  }
  slideOutStartTime += item.stayDuration

  // 等待段时长 = 总周期 - 可见 - 滑出
  const waitDuration = totalDuration - slideOutStartTime - item.coverDuration

  // 构建 translate 时间线
  const timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[] = []

  // 1. 可见段：在中心停留
  if (slideOutStartTime > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: slideOutStartTime })
  }

  // 2. 滑出段：从中心滑到屏外
  timeline.push({
    toRel: slideOut,
    durationSeconds: item.coverDuration,
    keySplines: item.keySplines,
  })

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
        begin: "0s",
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
