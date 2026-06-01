import React from "react"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate, transformScaleRaw } from "@smil/index"
import svgURL from "@utils/svg/svgURL"
import type { I_StackCarouselItem, I_NormalizedStackItem } from "../StackCarouselX/types"
import { normalizeItems } from "../StackCarouselX/utils/normalizer"
import { buildSlotTimelines } from "../StackCarouselX/timeline/slotTimeline"
import type { I_PositionConfig } from "../StackCarouselX/timeline/slotTimeline"

const DEFAULT_BACK_OFFSET = 162
const DEFAULT_SCALES: [number, number, number] = [0.7, 0.8, 0.9]

interface I_StackCarouselYProps {
  canvasSize: { w: number; h: number }
  itemCanvasSize: { w: number; h: number }
  pics?: I_StackCarouselItem[]
  scales?: [number, number, number]
  backOffset?: number
  exitOffset?: number
  backgroundColor?: string
  spacing?: T_SpacingProps
}

const StackCarouselY = (props: I_StackCarouselYProps) => {
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
  const exitOffset = defaultTo(props.exitOffset, viewBoxW)
  const bgColor = defaultTo(props.backgroundColor, "#FFFFFF")
  const isDev = ExPubGoConfig().mode === "development"

  const items = normalizeItems(props.pics)
  const N = items.length
  const totalSlots = N + 3

  // 位置配置：纵向叠层，偏移在 Y 轴（负方向 = 上方），退场在 X 轴正方向
  const posConfig: I_PositionConfig = {
    translateValues: [
      { x: 0, y: -backOffset },   // back
      { x: 0, y: -midOffset },    // mid
      { x: 0, y: 0 },             // center
      { x: exitOffset, y: 0 },    // exit（跨轴退场：向右飞出）
    ],
    scaleValues: [scales[0], scales[1], scales[2], scales[2]],
  }

  // 内容偏移：纵向变体 Y 方向需乘以 centerScale 以对齐视觉居中
  const contentOffsetX = -imageW / 2
  const contentOffsetY = Math.round(-imageH / 2 * scales[2])

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
                        <ItemImageY item={item} imageW={imageW} imageH={imageH} />
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

export default StackCarouselY
