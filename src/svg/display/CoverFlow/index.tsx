import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import type { T_CanvasSize } from "@svg/types"
import useImgSize from "@utils/hooks/useImgSize"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate } from "@smil/index"
import { transformScaleRaw } from "@smil/index"
import svgURL from "@utils/svg/svgURL"
import type { I_CoverFlowItemConfig, I_NormalizedItemConfig } from "./types"
import { DEFAULT_PEEK_PX, DEFAULT_GAP, DEFAULT_SIDE_SCALE } from "./types"
import { normalizeItems } from "./utils/normalizer"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

const CoverFlow = (props: {
  canvasSize?: T_CanvasSize
  spacing?: T_SpacingProps
  pics?: I_CoverFlowItemConfig[]
  peekPx?: number
  gap?: number
  sideScale?: number
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.pics?.[0]
  const firstUrl = firstPic?.url

  if (!firstUrl && !firstPic?.item) return null
  if (!firstUrl && (!props.canvasSize?.w || !props.canvasSize?.h)) {
    throw new Error("`canvasSize` is required when using `item` mode.")
  }

  const { size: resolvedSize } = useImgSize(firstUrl!, props.canvasSize?.w, props.canvasSize?.h)
  const imageW = resolvedSize.w
  const imageH = resolvedSize.h

  const peekPx = defaultTo(props.peekPx, DEFAULT_PEEK_PX)
  const gap = defaultTo(props.gap, DEFAULT_GAP)
  const sideScale = defaultTo(props.sideScale, DEFAULT_SIDE_SCALE)
  const items = normalizeItems(props.pics)
  const N = items.length
  const totalDur = calculateTotalCycleDuration(items)
  const isDev = ExPubGoConfig().mode === 'development'

  // 放大比 = 1/sideScale
  const fullScale = 1 / sideScale
  // viewBox 尺寸：宽度需要容纳放大后的中心图 + 两侧 peek，高度容纳放大后的图
  const viewBoxW = imageW * fullScale + 2 * peekPx
  const viewBoxH = imageH * fullScale
  // 间距 = imageW + gap（slot 之间的水平距离）
  const step = imageW + gap
  // slot 的 Y 坐标（图片在 viewBox 中垂直居中）
  const slotY = (viewBoxH - imageH) / 2
  // 放大时的 translate 补偿（保持居中）
  const scaleDx = -imageW * (fullScale - 1) / 2
  const scaleDy = -imageH * (fullScale - 1) / 2

  // 中心位置 x（图片水平居中于 viewBox）
  const centerX = (viewBoxW - imageW) / 2
  // 右 peek 位置 x = centerX + step
  const rightPeekX = centerX + step

  // slots: N+3 个（1 首副本 + N+1 有动画 + 1 尾副本）
  // 有动画的 slot 比图片数多 1，确保外层平移 N*step 后尾部 slot 与首部重合
  const slots: { item: I_NormalizedItemConfig; x: number }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = i % N
    const x = rightPeekX - i * step
    slots.push({ item: items[itemIdx], x })
  }

  // 外层大 <g> 的 translate 动画：每段向右平移 step
  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const targetX = (i + 1) * step
    outerTimeline.push({ to: { x: targetX, y: 0 }, durationSeconds: item.switchDuration, keySplines: item.keySplines })
    outerTimeline.push({ to: { x: targetX, y: 0 }, durationSeconds: item.stayDuration })
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
    const itemIdx = Math.floor(seg / 2)
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
    const itemIdx = Math.floor(seg / 2)
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

export default CoverFlow
