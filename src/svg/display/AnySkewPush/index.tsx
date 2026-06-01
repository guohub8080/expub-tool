import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import { normalizeChildItems } from "./utils/normalizer"
import { validateJsxViewBox } from "./utils/validateJsx"
import { calculateTotalDuration } from "./timeline/sequenceCalculator"
import { getOffscreenTranslate } from "./timeline/offsetCalculator"
import SkewPushItem from "./components/SkewPushItem"
import GhostLayer from "./components/GhostLayer"
import type { I_AnySkewPushChildItem } from "./types"

export type { I_SkewConfig, I_AnySkewPushChildItem } from "./types"

/**
 * AnySkewPush — 多图循环"斜切推入"切换组件
 *
 * 效果演示：
 *   图片从不同方向（左/右/上/下）推入画布中心，支持 skew 斜切和 rotate 旋转，
 *   多张图片交替执行形成无限循环。
 *
 * 渲染结构：
 *   SectionEx（根容器 + dev label）
 *   └─ section（overflow 裁剪，隐藏屏幕外的图片）
 *      └─ SvgEx（SVG 画布，viewBox 由 canvasSize 决定）
 *         └─ <g visibility="hidden">（初始隐藏，0.05s 后变 visible，避免 SMIL 初始闪烁）
 *            └─ <g>（坐标系平移到画布中心）
 *               ├─ SkewPushItem × N（每张图独立渲染 + 动画）
 *               └─ GhostLayer（图1副本，解决 z-order 遮挡问题）
 */
const AnySkewPush = (props: {
  /** 画布尺寸 { w, h } */
  canvasSize: { w: number; h: number }
  /** 子项配置数组，每项包含 url 或 jsx + direction / skew / rotation / duration */
  childItems: I_AnySkewPushChildItem[]
  /** 内容与画布边缘间距（像素），默认 0 */
  itemGap?: number
  /** 画布背景：颜色字符串（如 "#fff"）或图片 URL */
  canvasBg?: string
  /** 外间距配置 */
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.childItems?.length) {
    throw new Error("`childItems` must not be empty.")
  }

  const { w, h } = props.canvasSize
  const items = normalizeChildItems(props.childItems)
  const totalDuration = calculateTotalDuration(items)
  const itemGap = defaultTo(props.itemGap, 0)
  const contentW = Math.max(1, w - itemGap * 2)
  const contentH = Math.max(1, h - itemGap * 2)
  const isDev = ExPubGoConfig().mode === 'development'

  // 校验 jsx 模式下最外层 SVG 的 viewBox 是否跟内容区域尺寸一致
  items.forEach(item => {
    if (item.jsx) {
      validateJsxViewBox({ jsx: item.jsx, contentWidth: contentW, contentHeight: contentH })
    }
  })

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-skew-push' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "none", overflow: "hidden", width: "100%", maxWidth: "100%",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }} width="100%">
          {/*
            初始 visibility="hidden"，0.01s 后变 visible。
            目的：SMIL 引擎在第一个 paint 之前尚未初始化，若不隐藏，
            各图的 <g> 会在动画接管前短暂停在原点（全屏中心），造成初始闪烁。
          */}
          <g transform={`translate(${itemGap}, ${itemGap})`} visibility="hidden">
            <set attributeName="visibility" to="visible" begin="0.01s" fill="freeze" />
            {/* 坐标系平移到画布中心，所有图的 translate 动画以中心为原点计算 */}
            <g transform={`translate(${contentW / 2}, ${contentH / 2})`}>
              {items.map((item, i) => (
                <SkewPushItem key={i}
                  item={item} index={i} items={items}
                  totalDuration={totalDuration}
                  contentWidth={contentW} contentHeight={contentH}
                  canvasWidth={w} canvasHeight={h} />
              ))}

              {/* Ghost Layer：图1的视觉副本，解决图N覆盖图1的 z-order 问题 */}
              <GhostLayer
                firstItem={items[0]}
                enterOffscreenTranslate={getOffscreenTranslate({
                  direction: items[0].entryDirection, canvasWidth: w, canvasHeight: h,
                })}
                switchDuration={items[0].switchDuration}
                totalDuration={totalDuration}
                contentWidth={contentW}
                contentHeight={contentH}
              />
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnySkewPush
