import React from "react"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate, transformScaleRaw } from "@smil/index"
import { transformSkewX } from "@smil/animateTransform/skewX"
import { transformSkewY } from "@smil/animateTransform/skewY"
import { transformRotate } from "@smil/animateTransform/rotate"
import svgURL from "@utils/svg/svgURL"
import type { I_StackCarouselItem, I_NormalizedStackItem } from "./types"
import { normalizeItems } from "./utils/normalizer"
import { buildSlotTimelines } from "./timeline/slotTimeline"
import type { I_PositionConfig, I_SlotExitConfig } from "./timeline/slotTimeline"
import { resolveRotationOrigin } from "./utils/rotationOrigin"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

const DEFAULT_BACK_OFFSET = 162
/** back/mid 默认缩放比例（叠层深度效果，center 恒为 1.0） */
const DEFAULT_SCALES: [number, number] = [0.78, 0.89]

export type { I_StackCarouselItem, I_ExitConfig } from "./types"
export type { I_SkewConfig, I_RotationConfig } from "@svg/types"

interface I_StackCarouselXProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 中心卡牌显示尺寸（viewBox 坐标），即用户看到的卡牌大小 */
  mainChildItemSize: { w: number; h: number }
  /** 图片/内容配置数组，至少 1 项 */
  pics?: I_StackCarouselItem[]
  /** back 位置偏移量（px），mid 自动取一半，默认 162 */
  backOffset?: number
  /** 画布背景色，默认 #FFFFFF */
  canvasBg?: string
  /** 反向：叠层偏移在左侧 */
  isReversed?: boolean
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}

const StackCarouselX = (props: I_StackCarouselXProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.pics?.[0]
  if (isNil(firstPic?.url) && isNil(firstPic?.jsx)) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const cardW = props.mainChildItemSize.w
  const cardH = props.mainChildItemSize.h
  const backOffset = defaultTo(props.backOffset, DEFAULT_BACK_OFFSET)
  const midOffset = backOffset / 2
  const reversed = defaultTo(props.isReversed, false)
  const bgColor = defaultTo(props.canvasBg, "#FFFFFF")
  const isDev = ExPubGoConfig().mode === "development"

  const items = normalizeItems({ items: props.pics, defaultExitDirection: "L" })
  const itemCount = items.length
  const totalSlots = itemCount + 3

  // 正向：叠层偏移在右侧(+backOffset)
  // 反向：叠层偏移在左侧(-backOffset)
  const sign = reversed ? -1 : 1

  const getExitTranslate = (direction: "L" | "R" | "T" | "B"): Partial<I_TranslateValue> => {
    switch (direction) {
      case "L": return { x: -viewBoxW, y: 0 }
      case "R": return { x: viewBoxW, y: 0 }
      case "T": return { x: 0, y: -viewBoxH }
      case "B": return { x: 0, y: viewBoxH }
    }
  }

  const posConfig: I_PositionConfig = {
    translateValues: [
      { x: sign * backOffset, y: 0 },   // back
      { x: sign * midOffset, y: 0 },    // mid
      { x: 0, y: 0 },                   // center
      { x: 0, y: 0 },                   // exit（占位，实际由 exitConfig 覆盖）
    ],
    scaleValues: [DEFAULT_SCALES[0], DEFAULT_SCALES[1], 1, 1],
  }

  const contentOffsetX = -cardW / 2
  const contentOffsetY = -cardH / 2

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
            {Array.from({ length: totalSlots }, (_, slotIndex) => {
              // center slot (slotIndex=itemCount+2) 显示 items[0]，向前依次排列
              const itemIdx = (itemCount + 2 - slotIndex + itemCount * 10) % itemCount
              const item = items[itemIdx]
              const exitTranslate = getExitTranslate(item.exit.direction)
              const slotExitConfig: I_SlotExitConfig = {
                translate: exitTranslate,
                skew: item.exit.skew,
                rotation: item.exit.rotation,
                scale: item.exit.scale,
              }
              const {
                initTranslate, initScale,
                translateTimeline, scaleTimeline,
                skewTimeline, skewType,
                rotateTimeline,
              } = buildSlotTimelines({ slotIndex, itemCount, items, posConfig, exitConfig: slotExitConfig })

              const rotationOrigin = !isNil(item.exit.rotation)
                ? resolveRotationOrigin({
                    origin: defaultTo(item.exit.rotation.origin, "Center"),
                    cardWidth: cardW,
                    cardHeight: cardH,
                  })
                : undefined

              return (
                <g key={slotIndex}>
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
                      {!isNil(skewTimeline) && (skewType === 'Y'
                        ? transformSkewY({
                            initValue: 0,
                            timeline: skewTimeline,
                            begin: "0s",
                            loopCount: 0,
                            isFreeze: true,
                            isAdditive: false,
                            restart: "whenNotActive",
                          })
                        : transformSkewX({
                            initValue: 0,
                            timeline: skewTimeline,
                            begin: "0s",
                            loopCount: 0,
                            isFreeze: true,
                            isAdditive: false,
                            restart: "whenNotActive",
                          })
                      )}
                      {!isNil(rotateTimeline) && !isNil(rotationOrigin) && transformRotate({
                        initValue: 0,
                        timeline: rotateTimeline,
                        origin: rotationOrigin,
                        begin: "0s",
                        loopCount: 0,
                        isFreeze: true,
                        isAdditive: false,
                        restart: "whenNotActive",
                      })}
                      <foreignObject x={0} y={0} width={cardW} height={cardH}>
                        <ItemImage item={item} imageW={cardW} imageH={cardH} />
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

export default StackCarouselX
