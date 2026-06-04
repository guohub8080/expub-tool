import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import floor from "lodash/floor"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate } from "@smil/index"
import { transformScaleRaw } from "@smil/index"
import svgURL from "@utils/svg/svgURL"
import type { I_CoverFlowItemConfig, I_NormalizedItemConfig } from "../CoverFlowX/types"
import { normalizeItems } from "../CoverFlowX/utils/normalizer"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

const DEFAULT_ITEM_GAP = 100
const DEFAULT_ITEM_SCALE = 1.4

const CoverFlowY = (props: {
  canvasSize: { w: number; h: number }
  spacing?: T_SpacingProps
  pics?: I_CoverFlowItemConfig[]
  itemCanvasSize: { w: number; h: number }
  itemGap?: number
  itemScale?: number
  itemAlign?: 'left' | 'center' | 'right'
  isReversed?: boolean
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.pics?.[0]
  if (!firstPic?.url && !firstPic?.item) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const imageW = props.itemCanvasSize.w
  const imageH = props.itemCanvasSize.h
  const gap = defaultTo(props.itemGap, DEFAULT_ITEM_GAP)
  const fullScale = defaultTo(props.itemScale, DEFAULT_ITEM_SCALE)

  const items = normalizeItems(props.pics)
  const N = items.length
  const reverse = defaultTo(props.isReversed, false)
  const isDev = ExPubGoConfig().mode === 'development'

  const align = defaultTo(props.itemAlign, 'center')
  const step = imageH + gap
  const slotXMap = { left: 0, center: (viewBoxW - imageW) / 2, right: viewBoxW - imageW }
  const scaleDxMap = { left: 0, center: -imageW * (fullScale - 1) / 2, right: -imageW * (fullScale - 1) }
  const slotX = slotXMap[align]
  const scaleDx = scaleDxMap[align]
  const scaleDy = -imageH * (fullScale - 1) / 2
  const centerY = (viewBoxH - imageH) / 2

  // 正向：slot 从上到下排列，外层向上平移（图片向上走）
  // 反向：slot 从下到上排列，外层向下平移（图片向下走）
  const slots: { item: I_NormalizedItemConfig; y: number }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N
    const y = reverse
      ? centerY + step - i * step
      : centerY - step + i * step
    slots.push({ item: items[itemIdx], y })
  }

  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const delta = (i + 1) * step
    const target = reverse ? { x: 0, y: delta } : { x: 0, y: -delta }
    outerTimeline.push({ to: target, durationSeconds: item.switchDuration, keySplines: item.keySplines })
    outerTimeline.push({ to: target, durationSeconds: item.stayDuration })
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'cover-flow-y' } : {})}
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
              const activeIdx = si - 1
              const isEdge = si === 0 || si === slots.length - 1
              const isInitCenter = activeIdx === 0
              return (
                <g key={si} transform={`translate(${slotX},${slot.y})`}>
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
      targetValue = 1
    } else {
      const enlargeSeg = (activeIdx - 1) * 2
      const holdSeg = enlargeSeg + 1
      targetValue = (seg === enlargeSeg || seg === holdSeg) ? fullScale : 1
    }
    timeline.push({ to: targetValue, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

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
      target = (seg === enlargeSeg || seg === holdSeg) ? { x: scaleDx, y: scaleDy } : { x: 0, y: 0 }
    }
    timeline.push({ to: target, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

export default CoverFlowY
