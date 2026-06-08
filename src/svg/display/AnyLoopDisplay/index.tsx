import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from '@utils/fn/isDefined'
import type { I_CanvasBg } from '@svg/types'
import max from "lodash/max"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import { setVisibility } from "@smil/index"
import { normalizeChildItems } from "./utils/normalizer"
import { validateJsxViewBox } from "./utils/validateJsx"
import { buildCyclicTimelines } from "@utils/svg/buildCyclicTimelines"
import { getOffscreenTranslate } from "./timeline/offsetCalculator"
import CycleItem from "./components/CycleItem"
import GhostLayer from "./components/GhostLayer"
import type { I_AnyLoopDisplayChildItem } from "./types"

export type { I_EntrySkewConfig, I_RotationConfig, I_EntryScaleConfig, I_EntryOpacityConfig, I_StayConfig, I_EntryConfig, I_ExitConfig, I_HoldConfig, I_AnyLoopDisplayChildItem } from "./types"

/**
 * AnyLoopDisplay — 多图循环展示组件
 *
 * 效果演示：
 *   图片从不同方向（左/右/上/下/对角线）推入画布，支持 skew / scale / rotate 变换，
 *   多张图片交替执行形成无限循环。
 *
 * 渲染结构：
 *   SectionEx（根容器 + dev label）
 *   └─ section（overflow 裁剪，隐藏屏幕外的图片）
 *      └─ SvgEx（SVG 画布，viewBox 由 canvasSize 决定）
 *         └─ <g visibility="hidden">（初始隐藏，0.01s 后变 visible，避免 SMIL 初始闪烁）
 *            └─ <g>（坐标系平移到 childCanvas 左上角）
 *               └─ <g>（坐标系平移到 childCanvas 中心）
 *                  ├─ CycleItem × N（每张图独立渲染 + 动画）
 *                  └─ GhostLayer（图1副本，解决 z-order 遮挡问题）
 */
const AnyLoopDisplay = (props: {
  /** 画布尺寸 { w, h } */
  canvasSize: { w: number; h: number }
  /** 子项配置数组，每项包含 url 或 jsx + direction / skew / scale / rotation / duration */
  childItems: I_AnyLoopDisplayChildItem[]
  /**
   * 子项画布区域 { x, y, w, h }，定义子内容在主画布中的位置和尺寸。
   * x/y 为左上角坐标，w/h 为内容区域大小。
   * 不传则默认 { x: 0, y: 0, w: canvasSize.w, h: canvasSize.h }（撑满画布）。
   */
  childCanvas?: { x: number; y: number; w: number; h: number }
  /** 画布背景：颜色字符串（如 "#fff"）或图片 URL */
  canvasBg?: I_CanvasBg
  /** 外间距配置 */
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.childItems) || props.childItems.length === 0) {
    throw new Error("`childItems` must not be empty.")
  }

  const { w, h } = props.canvasSize
  const canvas = defaultTo(props.childCanvas, { x: 0, y: 0, w, h })
  const { x: canvasX, y: canvasY, w: contentW, h: contentH } = canvas
  const items = normalizeChildItems(props.childItems)
  const { totalDuration, itemTimelines, ghostTimeline } = buildCyclicTimelines(items)
  const isDev = ExPubGoConfig().mode === 'development'

  // 校验 jsx 模式下最外层 SVG 的 viewBox 是否跟内容区域尺寸一致
  items.forEach(item => {
    if (isDefined(item.jsx)) {
      validateJsxViewBox({ jsx: item.jsx, contentWidth: contentW, contentHeight: contentH })
    }
  })

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-loop-display' } : {})}
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
          <g transform={`translate(${canvasX}, ${canvasY})`} visibility="hidden">
            {setVisibility({ to: "visible", begin: "0.01s", isFreeze: true })}
            {/* 坐标系平移到 childCanvas 中心，所有图的 translate 动画以中心为原点计算 */}
            <g transform={`translate(${contentW / 2}, ${contentH / 2})`}>
              {items.map((item, i) => (
                <CycleItem key={i}
                  item={item} timeline={itemTimelines[i]}
                  totalDuration={totalDuration}
                  contentWidth={contentW} contentHeight={contentH}
                  canvasWidth={w} canvasHeight={h} />
              ))}

              {/* Ghost Layer：图1的视觉副本，解决图N覆盖图1的 z-order 问题 */}
              {ghostTimeline && (
                <GhostLayer
                  firstItem={items[0]}
                  enterOffscreenTranslate={
                    // 高级模式取 initValue，简单模式由 direction 计算 offscreen
                    items[0].entry.translate.timeline
                      ? (defaultTo(items[0].entry.translate.initValue, { x: 0, y: 0 }))
                      : getOffscreenTranslate({
                          direction: items[0].entry.translate.direction, canvasWidth: w, canvasHeight: h,
                          bufferMultiplier: defaultTo(items[0].entry.translate.distance, max([1, defaultTo(items[0].entry.scale?.initValue, 1)])),
                        })
                  }
                  ghostTimeline={ghostTimeline}
                  totalDuration={totalDuration}
                  contentWidth={contentW}
                  contentHeight={contentH}
                />
              )}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnyLoopDisplay
