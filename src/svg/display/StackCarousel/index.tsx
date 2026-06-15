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
import { transformTranslate, transformScaleRaw, animateVisibility } from "@smil/index"
import { transformSkewX } from "@smil/animateTransform/skewX"
import { transformSkewY } from "@smil/animateTransform/skewY"
import { transformRotate } from "@smil/animateTransform/rotate"
import { DIRECTION_8 } from "@svg/types"
import type { I_CanvasBg, T_Direction8 } from "@svg/types"
import type { I_StackCarouselItem, I_NormalizedStackItem, I_MainChildConfig, I_TailChildConfig, I_StackLayerConfig } from "./types"
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
import { computeExitDistance } from "./utils/exitDistance"
import { resolveRotationPivot } from "./utils/rotationPivot"
import { buildSlotTimelines } from "./timeline/slotTimeline"
import type { I_SlotExitConfig } from "./timeline/slotTimeline"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

export type { I_StackCarouselItem, I_ExitConfig, I_MainChildConfig, I_TailChildConfig, I_StackLayerConfig } from "./types"
export type { I_SkewConfig, I_RotationConfig, T_Direction8 } from "@svg/types"

const getExitTranslate = (
  direction: T_Direction8,
  exitDistance: number,
  diagonalDistance?: number
): Partial<I_TranslateValue> => {
  /** 对角线每轴位移，默认等于 exitDistance，确保完全移出画布 */
  const resolvedDiagonal = defaultTo(diagonalDistance, exitDistance)
  switch (direction) {
    case DIRECTION_8.Left:  return { x: -exitDistance, y: 0 }
    case DIRECTION_8.Right: return { x: exitDistance, y: 0 }
    case DIRECTION_8.Top:   return { x: 0, y: -exitDistance }
    case DIRECTION_8.Bottom: return { x: 0, y: exitDistance }
    case DIRECTION_8.TopLeft:     return { x: -resolvedDiagonal, y: -resolvedDiagonal }
    case DIRECTION_8.TopRight:    return { x: resolvedDiagonal, y: -resolvedDiagonal }
    case DIRECTION_8.BottomLeft:  return { x: -resolvedDiagonal, y: resolvedDiagonal }
    case DIRECTION_8.BottomRight: return { x: resolvedDiagonal, y: resolvedDiagonal }
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
  /** 可见叠层数，默认 3；范围 [2, 8] 闭区间，越界抛错。被 showStackConfig 优先覆盖 */
  showStackNum?: number
  /** 逐层覆盖配置；传则按此逐层定制 scale/位置，长度即层数（覆盖 showStackNum）。
   *  数组首项 = tail（最远端），末项 = center（焦点）。缺省字段走自动公式 */
  showStackConfig?: I_StackLayerConfig[]
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

  // 可见叠层数：showStackConfig 优先（数组长度即层数），否则取 showStackNum（默认 3）
  // 范围 [2, 8] 闭区间，越界抛错
  const showStackNum = isDefined(props.showStackConfig)
    ? props.showStackConfig.length
    : defaultTo(props.showStackNum, DEFAULT_SHOW_STACK_NUM)
  if (showStackNum < MIN_SHOW_STACK_NUM || showStackNum > MAX_SHOW_STACK_NUM) {
    throw new Error(`[StackCarousel] showStackNum must be in [${MIN_SHOW_STACK_NUM}, ${MAX_SHOW_STACK_NUM}], got ${showStackNum}.`)
  }
  if (isDefined(props.showStackConfig) && props.showStackConfig.length !== showStackNum) {
    // 上面刚取过 length，这里防御性校验
    throw new Error(`[StackCarousel] showStackConfig length (${props.showStackConfig.length}) must match showStackNum (${showStackNum}).`)
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
  // 一个完整轮播周期 = N × (switch + stay)，用于循环边界 visibility 动画
  const totalDuration = items.reduce((sum, item) => sum + item.switchDuration + item.stayDuration, 0)

  // 各层 translate / scale：showStackConfig 逐层覆盖；否则恒定 peek + 幂律 scale（自动）
  const posConfig = buildPosConfig({ showStackNum, tailScale, direction, cardW, cardH, layers: props.showStackConfig })

  const contentOffsetX = -cardW / 2
  const contentOffsetY = -cardH / 2

  // ── ghost：items[0] 副本，循环边界（seg9 末→seg0 初）在 center 显示，填补 items[0]
  // 推进 slot 循环重置跳 tail 造成的 center 空隙（slot4 走→slot9 到之间），实现无缝衔接。
  // center 位 = 局部原点（main 中心），scale 1，rotate = items[0].stayRotate。
  const ghostFadeDuration = 0.1
  const firstItem = items[0]
  const ghostStayRotate = defaultTo(firstItem.stayRotate, 0)
  const ghostRotatePivot = resolveRotationPivot({
    pivot: defaultTo(firstItem.stayRotatePivot, "Center"),
    cardWidth: cardW,
    cardHeight: cardH,
  })

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
              const itemIndex = (itemCount + showStackNum - 1 - slotIndex + itemCount * 10) % itemCount
              const item = items[itemIndex]
              // 退场距离：用户传了 exit.distance 用用户的；否则按方向精确算移出 viewBox 的最小距离
              const exitDistance = defaultTo(item.exit.distance, computeExitDistance({
                direction: item.exit.direction,
                mainCenterX, mainCenterY,
                viewBoxW, viewBoxH,
                cardHalfW: cardW / 2, cardHalfH: cardH / 2,
              }))
              const exitTranslate = getExitTranslate(item.exit.direction, exitDistance)
              const slotExitConfig: I_SlotExitConfig = {
                translate: exitTranslate,
                skew: item.exit.skew,
                rotation: item.exit.rotation,
                scale: item.exit.scale,
              }
              const {
                initTranslate, initScale, initRotate,
                translateTimeline, scaleTimeline,
                skewTimeline, skewType,
                rotateTimeline, rotatePivotFrames,
                hasLoopJump,
              } = buildSlotTimelines({ slotIndex, itemCount, showStackNum, items, posConfig, exitConfig: slotExitConfig, cardW, cardH, slotItemIndex: itemIndex })

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

              // rotate：层间插值 + 退场维持/过渡统一走这一条轨道。
              // pivot 逐帧由 rotatePivotFrames 提供（含退场段，已按 position 取好）。
              const buildRotateAnim = () => {
                return transformRotate({
                  initValue: initRotate,
                  timeline: rotateTimeline,
                  pivots: rotatePivotFrames,
                  begin: "0s",
                  loopCount: 0,
                  isFreeze: true,
                  isAdditive: false,
                  restart: "whenNotActive",
                })
              }

              // hasLoopJump slot（items[0] 推进 slot）：循环重置前一小段 visibility hidden，
              // 使其从 center 跳回 tail 时不可见（避免副本闪跳）。center 空隙由 ghost 填补。
              const loopFadeDuration = 0.1
              const buildLoopJumpVisibility = () => {
                if (!hasLoopJump) return null
                return animateVisibility({
                  initValue: "visible",
                  timeline: [
                    { durationSeconds: totalDuration - loopFadeDuration, toAbs: "visible" },
                    { durationSeconds: loopFadeDuration, toAbs: "hidden" },
                  ],
                  begin: "0s",
                  loopCount: 0,
                  isFreeze: true,
                })
              }

              return (
                <g key={slotIndex}>
                  {buildLoopJumpVisibility()}
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
            {/* ghost：items[0] 副本，循环边界在 center 显示，填补推进 slot 跳 tail 的空隙。
                visibility 在循环边界（seg9 末 + seg0 初）visible，中间 hidden。
                translate=center（局部原点）、scale=1、rotate=stayRotate 全程静态。 */}
            <g key="ghost" visibility="hidden">
              {animateVisibility({
                initValue: "hidden",
                timeline: [
                  { durationSeconds: ghostFadeDuration, toAbs: "visible" },
                  { durationSeconds: totalDuration - 2 * ghostFadeDuration, toAbs: "hidden" },
                  { durationSeconds: ghostFadeDuration, toAbs: "visible" },
                ],
                begin: "0s",
                loopCount: 0,
                isFreeze: true,
              })}
              <g transform={`rotate(${ghostStayRotate} ${ghostRotatePivot[0]} ${ghostRotatePivot[1]})`}>
                <g transform={`translate(${contentOffsetX}, ${contentOffsetY})`}>
                  <foreignObject x={0} y={0} width={cardW} height={cardH}>
                    <ItemImage item={firstItem} imageW={cardW} imageH={cardH} />
                  </foreignObject>
                </g>
              </g>
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default StackCarousel
