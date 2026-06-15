import React from "react"
import { isDefined } from '@utils/fn/isDefined'
import { ItemImage } from "./shared/ItemImage"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
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
import { DIRECTION_8 } from "@svg/types"
import type { I_CanvasBg, T_Direction8 } from "@svg/types"
import type { I_StackCarouselItem, I_NormalizedStackItem, I_MainChildConfig, I_TailChildConfig } from "./types"
import {
  MIN_SHOW_STACK_NUM,
  MAX_SHOW_STACK_NUM,
  DEFAULT_SHOW_STACK_NUM,
  DEFAULT_TAIL_OFFSET,
  DEFAULT_TAIL_SCALE,
} from "./types"
import { normalizeItems } from "./utils/normalizer"
import { buildPosConfig } from "./utils/stackLayout"
import { directionFromVector } from "./utils/exitDirection"
import { buildSlotTimelines } from "./timeline/slotTimeline"
import type { I_SlotExitConfig } from "./timeline/slotTimeline"
import { resolveRotationPivot } from "./utils/rotationPivot"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

export type { I_StackCarouselItem, I_ExitConfig, I_MainChildConfig, I_TailChildConfig } from "./types"
export type { I_SkewConfig, I_RotationConfig, T_Direction8 } from "@svg/types"

const getExitTranslate = (
  direction: T_Direction8,
  exitDistance: number,
  diagonalDistance?: number
): Partial<I_TranslateValue> => {
  const d = exitDistance
  /** 对角线每轴位移，默认等于 exitDistance，确保完全移出画布 */
  const dd = defaultTo(diagonalDistance, d)
  switch (direction) {
    case DIRECTION_8.Left:  return { x: -d, y: 0 }
    case DIRECTION_8.Right: return { x: d, y: 0 }
    case DIRECTION_8.Top:   return { x: 0, y: -d }
    case DIRECTION_8.Bottom: return { x: 0, y: d }
    case DIRECTION_8.TopLeft:     return { x: -dd, y: -dd }
    case DIRECTION_8.TopRight:    return { x: dd, y: -dd }
    case DIRECTION_8.BottomLeft:  return { x: -dd, y: dd }
    case DIRECTION_8.BottomRight: return { x: dd, y: dd }
  }
}

export interface I_StackCarouselProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 中心（焦点）卡牌：基准尺寸 + 位置，scale 恒为 1 */
  mainChild: I_MainChildConfig
  /** 最远端卡牌：缩放 + 位置；与 mainChild 两点连线决定叠层方向与深度。
   *  缺省时向右水平延伸（与历史 StackCarouselX 默认一致） */
  tailChild?: I_TailChildConfig
  /** 可见叠层数，默认 3；范围 [2, 8] 闭区间，越界抛错 */
  showStackNum?: number
  /** 图片/内容配置数组，至少 1 项 */
  childItems?: I_StackCarouselItem[]
  /** 画布背景 */
  canvasBg?: I_CanvasBg
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}

const StackCarousel = (props: I_StackCarouselProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.childItems?.[0]
  if (isNil(firstPic?.url) && isNil(firstPic?.jsx)) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const cardW = props.mainChild.w
  const cardH = props.mainChild.h
  const isDev = ExPubGoConfig().mode === "development"

  // 可见叠层数：默认 3，范围 [2, 8] 闭区间，越界抛错
  const showStackNum = defaultTo(props.showStackNum, DEFAULT_SHOW_STACK_NUM)
  if (showStackNum < MIN_SHOW_STACK_NUM || showStackNum > MAX_SHOW_STACK_NUM) {
    throw new Error(`[StackCarousel] showStackNum must be in [${MIN_SHOW_STACK_NUM}, ${MAX_SHOW_STACK_NUM}], got ${showStackNum}.`)
  }

  // mainChild 中心（缺省 viewBox 几何中心）
  const mainCenterX = defaultTo(props.mainChild.centerX, viewBoxW / 2)
  const mainCenterY = defaultTo(props.mainChild.centerY, viewBoxH / 2)

  // tailChild：缺省向右水平延伸（历史 StackCarouselX 默认）
  const tailScale = defaultTo(props.tailChild?.scale, DEFAULT_TAIL_SCALE)
  const tailCenterX = defaultTo(props.tailChild?.centerX, mainCenterX + DEFAULT_TAIL_OFFSET)
  const tailCenterY = defaultTo(props.tailChild?.centerY, mainCenterY)

  // 方向向量 d = tail − main（局部空间，main 在原点）
  const direction = { x: tailCenterX - mainCenterX, y: tailCenterY - mainCenterY }
  // 默认退场方向：卡片从 center 朝「远离 tail」飞出（main − tail 方向）
  const defaultExitDirection = directionFromVector(-direction.x, -direction.y)

  const items = normalizeItems({ items: props.childItems, defaultExitDirection, minCount: showStackNum })
  const itemCount = items.length
  const totalSlots = itemCount + showStackNum

  const defaultExitDistance = Math.sqrt(cardW * cardW + cardH * cardH) * 1.2

  // 各层 translate / scale：局部空间内 main→tail 两点插值
  const posConfig = buildPosConfig({ showStackNum, tailScale, direction })

  const contentOffsetX = -cardW / 2
  const contentOffsetY = -cardH / 2

  return (
    <SectionEx
      {...(isDev ? { "expubgo-label": "stack-carousel" } : {})}
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
              <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{ ...resolveCanvasBg(props.canvasBg), width: "100%" }} />
            </foreignObject>
          </g>

          {/* 外层 g：局部原点摆到 mainChild 中心（内部坐标系 main 在原点，tail 在 direction） */}
          <g transform={`translate(${mainCenterX}, ${mainCenterY})`}>
            {Array.from({ length: totalSlots }, (_, slotIndex) => {
              // center slot (slotIndex=itemCount+showStackNum-1) 显示 items[0]，向前依次排列
              const itemIdx = (itemCount + showStackNum - 1 - slotIndex + itemCount * 10) % itemCount
              const item = items[itemIdx]
              const exitTranslate = getExitTranslate(item.exit.direction, defaultTo(item.exit.distance, defaultExitDistance))
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
              } = buildSlotTimelines({ slotIndex, itemCount, showStackNum, items, posConfig, exitConfig: slotExitConfig })

              const rotationPivot = isDefined(item.exit.rotation)
                ? resolveRotationPivot({
                    pivot: defaultTo(item.exit.rotation.childCanvasPivot, "Center"),
                    cardWidth: cardW,
                    cardHeight: cardH,
                  })
                : undefined

              const buildSkewAnim = () => {
                if (isNil(skewTimeline)) return null
                return skewType === 'Y'
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
              }

              const buildRotateAnim = () => {
                if (isNil(rotateTimeline)) return null
                if (isNil(rotationPivot)) return null
                return transformRotate({
                  initValue: 0,
                  timeline: rotateTimeline,
                  pivot: rotationPivot,
                  begin: "0s",
                  loopCount: 0,
                  isFreeze: true,
                  isAdditive: false,
                  restart: "whenNotActive",
                })
              }

              return (
                <g key={slotIndex}>
                  {transformTranslate({
                    initValue: initTranslate,
                    timeline: translateTimeline,
                    begin: "0s",
                    loopCount: 0,
                    isFreeze: true,
                    isAdditive: false,
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
                      {/* 每个 animateTransform 必须包独立 <g>，避免互相覆盖 */}
                      <g>
                        {buildSkewAnim()}
                        <g>
                          {buildRotateAnim()}
                          <foreignObject x={0} y={0} width={cardW} height={cardH}>
                            <ItemImage item={item} imageW={cardW} imageH={cardH} />
                          </foreignObject>
                        </g>
                      </g>
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

export default StackCarousel
