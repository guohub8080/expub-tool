import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import floor from "lodash/floor"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import type { T_CanvasSize } from "@svg/types"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate } from "@smil/index"
import { transformScaleRaw } from "@smil/index"
import svgURL from "@utils/svg/svgURL"
import type { I_CoverFlowItemConfig, I_NormalizedItemConfig } from "./types"
import { normalizeItems } from "./utils/normalizer"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

/** 默认 item 间距 */
const DEFAULT_ITEM_GAP = 100
/** 默认放大比 */
const DEFAULT_ITEM_SCALE = 1.4

const CoverFlowX = (props: {
  canvasSize: { w: number; h: number }
  spacing?: T_SpacingProps
  childItems?: I_CoverFlowItemConfig[]
  itemCanvasSize: { w: number; h: number }
  itemGap?: number
  itemScale?: number
  itemAlign?: 'top' | 'center' | 'bottom'
  isReversed?: boolean
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.childItems?.[0]
  if (!firstPic?.url && !firstPic?.item) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const imageW = props.itemCanvasSize.w
  const imageH = props.itemCanvasSize.h
  const gap = defaultTo(props.itemGap, DEFAULT_ITEM_GAP)
  const fullScale = defaultTo(props.itemScale, DEFAULT_ITEM_SCALE)

  const items = normalizeItems(props.childItems)
  const N = items.length
  const reverse = defaultTo(props.isReversed, false)
  const isDev = ExPubGoConfig().mode === 'development'

  const align = defaultTo(props.itemAlign, 'center')
  const step = imageW + gap
  const slotYMap = { top: 0, center: (viewBoxH - imageH) / 2, bottom: viewBoxH - imageH }
  const scaleDyMap = { top: 0, center: -imageH * (fullScale - 1) / 2, bottom: -imageH * (fullScale - 1) }
  const slotY = slotYMap[align]
  const scaleDx = -imageW * (fullScale - 1) / 2
  const scaleDy = scaleDyMap[align]
  const centerX = (viewBoxW - imageW) / 2

  // 正向：slot 从右到左排列，外层向右平移
  // 反向：slot 从左到右排列，外层向左平移
  const slots: { item: I_NormalizedItemConfig; x: number }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N  // slot[1] 显示 items[0]
    const x = reverse
      ? centerX - step + i * step   // 从左 peek 向右排列
      : centerX + step - i * step   // 从右 peek 向左排列
    slots.push({ item: items[itemIdx], x })
  }

  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const delta = (i + 1) * step
    const target = reverse ? { x: -delta, y: 0 } : { x: delta, y: 0 }
    outerTimeline.push({ to: target, durationSeconds: item.switchDuration, keySplines: item.keySplines })
    outerTimeline.push({ to: target, durationSeconds: item.stayDuration })
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'cover-flow' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          style={{ display: "block", margin: "0 auto" }}
          width="100%">
          <g>
            {slots.map((slot, si) => {
              // slot[1] 是初始中心位置，它在第 0 段放大
              // slot[2] 在第 1 段放大，slot[3] 在第 2 段...
              // 首尾副本（si=0 和 si=N+1）不做动画
              const activeIdx = si - 1
              const isEdge = si === 0 || si === slots.length - 1
              const isInitCenter = activeIdx === 0
              return (
                <g key={si} transform={`translate(${slot.x},${slotY})`}>
                  <g>
                    <g>
                      <foreignObject x={0} y={0} width={imageW} height={imageH}>
                        {slot.item.useItem
                          ? slot.item.item
                          : <SvgEx
                              viewBox={`0 0 ${imageW} ${imageH}`}
                              style={{
                                backgroundImage: svgURL(slot.item.url!),
                                backgroundSize: "cover",
                              }}
                            />
                        }
                      </foreignObject>
                      {!isEdge && transformScaleRaw({
                        initValue: isInitCenter ? fullScale : 1,
                        timeline: buildSlotScale(activeIdx, N, items, fullScale),
                        begin: '0s',
                        loopCount: 0,
                        isAdditive: false,
                        isFreeze: true,
                      })}
                    </g>
                    {!isEdge && transformTranslate({
                      initValue: isInitCenter ? { x: scaleDx, y: scaleDy } : { x: 0, y: 0 },
                      timeline: buildSlotTranslate(activeIdx, N, items, scaleDx, scaleDy),
                      begin: '0s',
                      loopCount: 0,
                      isAdditive: false,
                      isRelativeMove: false,
                      isFreeze: true,
                    })}
                  </g>
                </g>
              )
            })}
            {transformTranslate({
              initValue: { x: 0, y: 0 },
              timeline: outerTimeline,
              begin: '0s',
              loopCount: 0,
              isFreeze: true,
              isAdditive: true,
              isRelativeMove: false,
            })}
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

/**
 * slot 的 scale timeline
 *
 * 参考规律（N=3 为例，6段）：
 * - index1 (activeIdx=0): initValue=fullScale, [缩回,stay1, 1,stay1, 1,stay1]
 * - index2 (activeIdx=1): initValue=1, [放大,stayF, 缩回,stay1, 1,stay1]
 * - index3 (activeIdx=2): initValue=1, [1,stay1, 放大,stayF, 缩回,stay1]
 * - index4 (activeIdx=3): initValue=1, [1,stay1, 1,stay1, 放大,stayF]
 *
 * 放大发生在段 (activeIdx-1)*2，保持在 (activeIdx-1)*2+1，缩回在 (activeIdx-1)*2+2
 * activeIdx=0 特殊：initValue=fullScale，第0段直接缩回
 */
function buildSlotScale(
  activeIdx: number, N: number, items: I_NormalizedItemConfig[], fullScale: number,
): I_TimelineKeyframe<number>[] {
  const timeline: I_TimelineKeyframe<number>[] = []
  const totalSegs = N * 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const splines = isSwitch ? item.keySplines : undefined

    let targetValue: number
    if (activeIdx === 0) {
      // initValue=fullScale, 第0段缩回1，之后全是1
      targetValue = 1
    } else {
      const enlargeSeg = (activeIdx - 1) * 2
      const holdSeg = enlargeSeg + 1
      if (seg === enlargeSeg) {
        targetValue = fullScale
      } else if (seg === holdSeg) {
        targetValue = fullScale
      } else {
        targetValue = 1
      }
    }

    timeline.push({ to: targetValue, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

/** slot 的 translate 补偿 timeline，与 scale 同步 */
function buildSlotTranslate(
  activeIdx: number, N: number, items: I_NormalizedItemConfig[],
  scaleDx: number, scaleDy: number,
): I_TimelineKeyframe<Partial<I_TranslateValue>>[] {
  const timeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  const totalSegs = N * 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const splines = isSwitch ? item.keySplines : undefined

    let target: { x: number; y: number }
    if (activeIdx === 0) {
      target = { x: 0, y: 0 }
    } else {
      const enlargeSeg = (activeIdx - 1) * 2
      const holdSeg = enlargeSeg + 1
      if (seg === enlargeSeg || seg === holdSeg) {
        target = { x: scaleDx, y: scaleDy }
      } else {
        target = { x: 0, y: 0 }
      }
    }

    timeline.push({ to: target, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

export default CoverFlowX
