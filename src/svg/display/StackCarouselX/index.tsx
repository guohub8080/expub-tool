import React from "react"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate, transformScaleRaw } from "@smil/index"
import svgURL from "@utils/svg/svgURL"
import type { I_StackCarouselItem, I_NormalizedStackItem } from "./types"
import { normalizeItems } from "./utils/normalizer"
import { buildSlotTimelines } from "./timeline/slotTimeline"
import type { I_PositionConfig } from "./timeline/slotTimeline"

/** 默认 back 位置偏移量 */
const DEFAULT_BACK_OFFSET = 162
/** 默认三层缩放：back / mid / center */
const DEFAULT_SCALES: [number, number, number] = [0.7, 0.8, 0.9]

export type { I_StackCarouselItem } from "./types"

import type { T_DirectionX } from "@svg/types"
export type { T_DirectionX }

interface I_StackCarouselXProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 单张图片画布尺寸 */
  itemCanvasSize: { w: number; h: number }
  /** 图片/内容配置数组，至少 1 项 */
  pics?: I_StackCarouselItem[]
  /** 三层缩放 [back, mid, center]，默认 [0.7, 0.8, 0.9] */
  scales?: [number, number, number]
  /** back 位置偏移量（px），mid 自动取一半，默认 162 */
  backOffset?: number
  /** 退场方向，默认 "L" */
  exitDirection?: T_DirectionX
  /** 画布背景色，默认 #FFFFFF */
  canvasBg?: string
  /** 反向：叠层偏移在左侧，卡牌从左向右退场 */
  isReversed?: boolean
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}

const StackCarouselX = (props: I_StackCarouselXProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.pics?.[0]
  if (!firstPic?.url && !firstPic?.item) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const imageW = props.itemCanvasSize.w
  const imageH = props.itemCanvasSize.h
  const scales = defaultTo(props.scales, DEFAULT_SCALES)
  const backOffset = defaultTo(props.backOffset, DEFAULT_BACK_OFFSET)
  const midOffset = backOffset / 2
  const reversed = defaultTo(props.isReversed, false)
  const exitDir = defaultTo(props.exitDirection, "L")
  const bgColor = defaultTo(props.canvasBg, "#FFFFFF")
  const isDev = ExPubGoConfig().mode === "development"

  const items = normalizeItems(props.pics)
  const N = items.length
  const totalSlots = N + 3

  // 正向：叠层偏移在右侧(+backOffset)，退场向左(-viewBoxW)
  // 反向：叠层偏移在左侧(-backOffset)，退场向右(+viewBoxW)
  const sign = reversed ? -1 : 1
  const exitOffset = exitDir === "L" ? -viewBoxW : viewBoxW

  const posConfig: I_PositionConfig = {
    translateValues: [
      { x: sign * backOffset, y: 0 },   // back
      { x: sign * midOffset, y: 0 },    // mid
      { x: 0, y: 0 },                   // center
      { x: exitOffset, y: 0 },          // exit
    ],
    scaleValues: [scales[0], scales[1], scales[2], scales[2]],
  }

  // 内容居中偏移
  const contentOffsetX = -imageW / 2
  const contentOffsetY = -imageH / 2

  return (
    <SectionEx
      {...(isDev ? { "expubgo-label": "stack-carousel-x" } : {})}
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
          {/* 背景层 */}
          <g>
            <foreignObject x={0} y={0} width={viewBoxW} height={viewBoxH}>
              <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{ backgroundColor: bgColor, width: "100%" }} />
            </foreignObject>
          </g>

          {/* 中心原点 */}
          <g transform={`translate(${viewBoxW / 2}, ${viewBoxH / 2})`}>
            {Array.from({ length: totalSlots }, (_, si) => {
              const itemIdx = si % N
              const item = items[itemIdx]
              const { initTranslate, initScale, translateTimeline, scaleTimeline } =
                buildSlotTimelines(si, N, items, posConfig)

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
                      <foreignObject x={0} y={0} width={imageW} height={imageH}>
                        <ItemImage item={item} imageW={imageW} imageH={imageH} />
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

/** 渲染单张图片内容 */
const ItemImage = ({ item, imageW, imageH }: {
  item: I_NormalizedStackItem
  imageW: number
  imageH: number
}) => {
  if (item.useItem) {
    return <>{item.item}</>
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

export default StackCarouselX
