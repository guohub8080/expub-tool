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
import { transformTranslate } from "@smil/index"
import type { I_AbsRelKeyframe, I_TranslateValue } from "@smil/index"
import { normalizeItems, getEntryOffset, getExitOffset, calcTotalDuration } from "./utils"
import type { I_CoverChildItem, I_NormalizedCoverItem } from "./types"

/**
 * CoverIn — 层层覆盖滑入组件
 *
 * 多张图片依次从屏外滑入，覆盖当前画面，形成层层刷新效果。
 * 后渲染的 DOM 元素在 SVG z 轴上方，自然覆盖前一张图。
 *
 * 动画周期内每张图的时间线：
 *   等待（屏外） → 滑入（switchDuration） → 停留 → 被后续图覆盖（停在中心）
 *
 * 周期结束时所有图通过 SMIL repeat 自动重置到 initValue（屏外），
 * 与下一轮的等待段无缝衔接。
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
  const totalDuration = calcTotalDuration(items)
  const isDev = ExPubGoConfig().mode === "development"

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
          {items.map((item, i) => (
            <CoverInItem
              key={i}
              item={item}
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

const CoverInItem = (props: {
  item: I_NormalizedCoverItem
  index: number
  items: I_NormalizedCoverItem[]
  viewBoxW: number
  viewBoxH: number
  totalDuration: number
}) => {
  const { item, index, items, viewBoxW, viewBoxH, totalDuration } = props

  // 进入偏移（foreignObject 的初始 x/y，屏外位置）
  const entryPos = getEntryOffset(item.direction, viewBoxW, viewBoxH)
  // 滑入位移（从屏外到中心的相对位移）
  const slideRel = getExitOffset(item.direction, viewBoxW, viewBoxH)

  // 计算等待时长 = 前面所有图的 (cover + stay) 之和
  let waitDuration = 0
  for (let i = 0; i < index; i++) {
    waitDuration += items[i].coverDuration + items[i].stayDuration
  }

  // 被覆盖时长 = 总周期 - 等待 - 滑入 - 停留
  const coveredDuration = totalDuration - waitDuration - item.coverDuration - item.stayDuration

  // 构建 translate 时间线（使用 toRel 模式，isAdditive=true）
  const timeline: I_AbsRelKeyframe<Partial<I_TranslateValue>>[] = []

  // 1. 等待段：在屏外等待（translate 不动）
  if (waitDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: waitDuration })
  }

  // 2. 滑入段：从屏外滑到中心
  timeline.push({
    toRel: slideRel,
    durationSeconds: item.coverDuration,
    keySplines: item.keySplines,
  })

  // 3. 停留段：在中心不动
  if (item.stayDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: item.stayDuration })
  }

  // 4. 被覆盖段：继续停在中心
  if (coveredDuration > 0) {
    timeline.push({ toRel: { x: 0, y: 0 }, durationSeconds: coveredDuration })
  }

  const content = item.useJsx
    ? item.jsx
    : <SvgEx viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
        style={{
          display: "block",
          backgroundImage: svgURL(item.url!),
          backgroundSize: "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        width="100%"
      />

  return (
    <g>
      <foreignObject x={entryPos.x} y={entryPos.y} width={viewBoxW} height={viewBoxH}>
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

export default CoverIn
