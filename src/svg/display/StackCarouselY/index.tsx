import React from "react"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate, transformScaleRaw } from "@smil/index"
import svgURL from "@utils/svg/svgURL"
import type { I_StackCarouselItem, I_NormalizedStackItem } from "../StackCarouselX/types"
import { normalizeItems } from "../StackCarouselX/utils/normalizer"
import { buildSlotTimelines } from "../StackCarouselX/timeline/slotTimeline"
import type { I_PositionConfig } from "../StackCarouselX/timeline/slotTimeline"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

const DEFAULT_BACK_OFFSET = 162
/** back/mid 缩放比例（center 恒为 1.0，cardSize 即中心卡牌显示尺寸） */
const DEFAULT_SCALES: [number, number] = [0.78, 0.89]

interface I_StackCarouselYProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 中心卡牌显示尺寸（viewBox 坐标），即用户看到的卡牌大小 */
  cardSize: { w: number; h: number }
  /** 图片/内容配置数组，至少 1 项 */
  pics?: I_StackCarouselItem[]
  /** back/mid 缩放比例 [back, mid]，center 恒为 1.0，默认 [0.78, 0.89] */
  scales?: [number, number]
  /** back 位置偏移量（px），mid 自动取一半，默认 162 */
  backOffset?: number
  /** 画布背景色，默认 #FFFFFF */
  canvasBg?: string
  /** 反向：叠层偏移在下方 */
  isReversed?: boolean
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}

const StackCarouselY = (props: I_StackCarouselYProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.pics?.[0]
  if (isNil(firstPic?.url) && isNil(firstPic?.jsx)) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const cardW = props.cardSize.w
  const cardH = props.cardSize.h
  const scales = defaultTo(props.scales, DEFAULT_SCALES)
  const backOffset = defaultTo(props.backOffset, DEFAULT_BACK_OFFSET)
  const midOffset = backOffset / 2
  const reversed = defaultTo(props.isReversed, false)
  const bgColor = defaultTo(props.canvasBg, "#FFFFFF")
  const isDev = ExPubGoConfig().mode === "development"

  const items = normalizeItems(props.pics)
  const N = items.length
  const totalSlots = N + 3

  // 纵向叠层：偏移在 Y 轴
  // 正向：叠层向上(-backOffset)
  // 反向：叠层向下(+backOffset)
  const sign = reversed ? -1 : 1

  // 退场 translate 计算：item 级 exitDirection，默认 "R"（跨轴向右）
  const getExitTranslate = (exitDirection: "L" | "R" | "T" | "B" | undefined): Partial<I_TranslateValue> => {
    const dir = defaultTo(exitDirection, "R")
    switch (dir) {
      case "L": return { x: -viewBoxW, y: 0 }
      case "R": return { x: viewBoxW, y: 0 }
      case "T": return { x: 0, y: -viewBoxH }
      case "B": return { x: 0, y: viewBoxH }
    }
  }

  const posConfig: I_PositionConfig = {
    translateValues: [
      { x: 0, y: sign * -backOffset },   // back
      { x: 0, y: sign * -midOffset },    // mid
      { x: 0, y: 0 },                    // center
      { x: 0, y: 0 },                    // exit（占位，实际由 getExitTranslate 按段覆盖）
    ],
    scaleValues: [scales[0], scales[1], 1, 1],
  }

  const contentOffsetX = -cardW / 2
  const contentOffsetY = -cardH / 2

  return (
    <SectionEx
      {...(isDev ? { "expubgo-label": "stack-carousel-y" } : {})}
      style={{
        boxSizing: "border-box",
        display: "block",
        overflow: "hidden",
        pointerEvents: "none",
        userSelect: "none",
        width: "100%",
        ...spacingResult,
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx
          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          style={{ display: "block", width: "100%" }}
        >
          <g>
            <foreignObject x={0} y={0} width={viewBoxW} height={viewBoxH}>
              <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{ backgroundColor: bgColor, width: "100%" }} />
            </foreignObject>
          </g>

          <g transform={`translate(${viewBoxW / 2}, ${viewBoxH / 2})`}>
            {Array.from({ length: totalSlots }, (_, si) => {
              const itemIdx = (N + 2 - si + N * 10) % N
              const item = items[itemIdx]
              const slotExitTranslate = getExitTranslate(item.exitDirection)
              const { initTranslate, initScale, translateTimeline, scaleTimeline } =
                buildSlotTimelines(si, N, items, posConfig, slotExitTranslate)

              return (
                <g key={si}>
                  {transformTranslate({
                    initValue: initTranslate,
                    timeline: translateTimeline,
                    begin: "0s",
                    loopCount: 0,
                    isFreeze: true,
                    isAdditive: false,
                    isRelativeMove: false,
                    restart: "whenNotActive",
                  })}
                  <g>
                    {transformScaleRaw({
                      initValue: initScale,
                      timeline: scaleTimeline,
                      begin: "0s",
                      loopCount: 0,
                      isFreeze: true,
                      isAdditive: false,
                      restart: "whenNotActive",
                    })}
                    <g transform={`translate(${contentOffsetX}, ${contentOffsetY})`}>
                      <foreignObject x={0} y={0} width={cardW} height={cardH}>
                        <ItemImageY item={item} imageW={cardW} imageH={cardH} />
                      </foreignObject>
                    </g>
                  </g>
                </g>
              )
            })}
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

const ItemImageY = ({ item, imageW, imageH }: {
  item: I_NormalizedStackItem
  imageW: number
  imageH: number
}) => {
  if (item.useItem) {
    return <>{item.jsx}</>
  }

  return (
    <SvgEx
      viewBox={`0 0 ${imageW} ${imageH}`}
      style={{
        backgroundImage: svgURL(item.url!),
        backgroundSize: "cover",
        pointerEvents: "visible",
        width: "100%",
      }}
    >
      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          style={{ display: "inline-block", width: "100%", height: "100%", color: "transparent" }}
        >
          <rect x={0} y={0} width={imageW} height={imageH} opacity={0} fill="transparent" style={{ pointerEvents: "painted" }} />
        </a>
      ) : (
        <rect x={0} y={0} width={imageW} height={imageH} fill="transparent" opacity={0} style={{ pointerEvents: "painted" }} />
      )}
    </SvgEx>
  )
}

export default StackCarouselY
