import type { ReactNode } from 'react'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import max from 'lodash/max'
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import type { I_CanvasBg } from '@svg/types'
import { setVisibility } from '@smil/index'
import { buildSkewTimelines } from './buildTimeline'
import SkewSlideItem from './SkewSlideItem'
import { DEFAULT_SKEW_ANGLE, clampSkewAngle, getCrossCompensation } from './utils'

export interface I_SkewSlideCarouselChildItem {
  url?: string
  jsx?: ReactNode
  switchDuration?: number
  stayDuration?: number
}

export interface I_SkewSlideCarouselProps {
  canvasSize: { w: number; h: number }
  childCanvasSize?: { w: number; h: number }
  gap?: number
  skewAngle?: number
  axis?: 'X' | 'Y'
  isReversed?: boolean
  childItems: I_SkewSlideCarouselChildItem[]
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}

/**
 * SkewSlideCarousel — 斜切轮播组件
 *
 * 通过 skew + translate 的同步动画模拟正方体旋转效果。
 * 支持 X 轴（skewY + translate X）和 Y 轴（skewX + translate Y）两种模式。
 *
 * 渲染结构：
 *   SectionEx（根容器 + dev label）
 *   └─ section（overflow 裁剪）
 *      └─ SvgEx（SVG 画布）
 *         └─ <g visibility="hidden">（初始隐藏，0.01s 后变 visible，避免 SMIL 初始闪烁）
 *            └─ <g>（坐标系平移到面中心）
 *               └─ SkewSlideItem × N（每张图独立渲染 + 动画）
 */
const SkewSlideCarousel = (props: I_SkewSlideCarouselProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.childItems) || props.childItems.length === 0) return null

  const { w, h } = props.canvasSize
  const axis = defaultTo(props.axis, 'X')
  const isReversed = defaultTo(props.isReversed, false)
  const gap = defaultTo(props.gap, 0)

  // ── 内容尺寸 ──
  const childCanvas = defaultTo(props.childCanvasSize, { w, h })
  const contentW = max([1, childCanvas.w])!
  const contentH = max([1, childCanvas.h])!

  // ── 斜切角度限制 ──
  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  const skewAngle = clampSkewAngle(rawAngle, contentW, contentH, axis)

  // ── 面尺寸（动画平移距离） ──
  const faceW = axis === 'X' ? contentW + gap : contentW
  const faceH = contentH

  // ── 交叉轴补偿 ──
  const crossComp = getCrossCompensation(axis, contentW, contentH, skewAngle)
  const signedCrossComp = isReversed ? crossComp : -crossComp

  // ── skew 角度方向 ──
  const entryAngle = axis === 'X'
    ? (isReversed ? skewAngle : -skewAngle)
    : (isReversed ? -skewAngle : skewAngle)
  const exitAngle = axis === 'X'
    ? (isReversed ? -skewAngle : skewAngle)
    : (isReversed ? skewAngle : -skewAngle)

  // ── skew origin（相对于面左上角） ──
  const originX = faceW / 2
  const originY = axis === 'X' ? contentH : 0

  // ── 面在画布中的居中偏移 ──
  const offsetX = (w - faceW) / 2
  const offsetY = (h - faceH) / 2

  // ── 构建时间轴 ──
  const { totalDuration, itemTimelines } = buildSkewTimelines(props.childItems)

  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': `skew-slide-carousel-${axis.toLowerCase()}` } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }} width="100%">
          <g transform={`translate(${offsetX}, ${offsetY})`} visibility="hidden">
            {setVisibility({ to: "visible", begin: "0.01s", isFreeze: true })}
            {props.childItems.map((item, i) => (
              <SkewSlideItem
                key={i}
                url={item.url}
                jsx={item.jsx}
                timeline={itemTimelines[i]}
                contentW={contentW}
                contentH={contentH}
                faceW={faceW}
                faceH={faceH}
                axis={axis}
                entryAngle={entryAngle}
                exitAngle={exitAngle}
                signedCrossComp={signedCrossComp}
                originX={originX}
                originY={originY}
              />
            ))}
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default SkewSlideCarousel
