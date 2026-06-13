import SectionEx from "@html/basicEx/SectionEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import SvgEx from "@html/basicEx/SvgEx"
import floor from "lodash/floor"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate } from "@smil/index"
import { transformScaleRaw } from "@smil/index"
import svgURL from "@utils/svg/svgURL"
import type { I_AnyCarouselItemConfig, I_NormalizedItemConfig } from "./types"
import { normalizeItems } from "./utils/normalizer"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"

/** 默认 item 间距 */
const DEFAULT_ITEM_GAP = 100
/** 默认放大比 */
const DEFAULT_ITEM_SCALE = 1.4
/** 默认角度（度），0 = 向右 */
const DEFAULT_ANGLE = 0

/**
 * 角度 → 方向单位向量
 *
 * 约定：0° = 向右 (+x)，90° = 向上。
 * 因 SVG 的 y 轴朝下，"上"对应 -y，故 uy = -sin(θ)。
 */
const getAngleUnitVector = (angle: number): { x: number; y: number } => {
  const rad = angle * Math.PI / 180
  return { x: Math.cos(rad), y: -Math.sin(rad) }
}

const AnyCarousel = (props: {
  canvasSize: { w: number; h: number }
  spacing?: T_SpacingProps
  childItems?: I_AnyCarouselItemConfig[]
  canvasBg?: I_CanvasBg
  itemCanvasSize: { w: number; h: number }
  itemGap?: number
  itemScale?: number
  /** 流动方向角度（度），0 = 向右，90 = 向上，默认 0 */
  angle?: number
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.childItems?.[0]
  if (isNil(firstPic?.url) && isNil(firstPic?.item)) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const imageW = props.itemCanvasSize.w
  const imageH = props.itemCanvasSize.h
  const gap = defaultTo(props.itemGap, DEFAULT_ITEM_GAP)
  const fullScale = defaultTo(props.itemScale, DEFAULT_ITEM_SCALE)
  const angle = defaultTo(props.angle, DEFAULT_ANGLE)

  const items = normalizeItems(props.childItems)
  const N = items.length
  const isDev = ExPubGoConfig().mode === 'development'

  // 流动方向单位向量（0°=右，90°=上）
  const unit = getAngleUnitVector(angle)

  // 相邻 slot 间距：x 方向用 itemW+gap，y 方向用 itemH+gap，保证任意角度不重叠
  const stepX = imageW + gap
  const stepY = imageH + gap

  // 中心 slot 落在 viewBox 正中
  const centerX = (viewBoxW - imageW) / 2
  const centerY = (viewBoxH - imageH) / 2

  // 放大时保持视觉居中的平移补偿（与角度无关，item 局部坐标）
  const scaleDx = -imageW * (fullScale - 1) / 2
  const scaleDy = -imageH * (fullScale - 1) / 2

  // slot 沿 -unit 方向（入口侧）排队：slot[1] = 中心，slot[2..] 依次往入口侧排
  const slots: { item: I_NormalizedItemConfig; x: number; y: number }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N  // slot[1] 显示 items[0]
    const k = i - 1                       // 相对中心的步数
    const x = centerX - k * stepX * unit.x
    const y = centerY - k * stepY * unit.y
    slots.push({ item: items[itemIdx], x, y })
  }

  // 外层整体沿 +unit 方向平移：每轮推进一格
  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const deltaK = i + 1
    const target = {
      x: deltaK * stepX * unit.x,
      y: deltaK * stepY * unit.y,
    }
    outerTimeline.push({ toAbs: target, durationSeconds: item.switchDuration, keySplines: item.keySplines })
    outerTimeline.push({ toAbs: target, durationSeconds: item.stayDuration })
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-carousel' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "none", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }}
          width="100%">
          <g>
            {slots.map((slot, si) => {
              // slot[1] 是初始中心位置，它在第 0 段放大
              // slot[2] 在第 1 段放大，slot[3] 在第 2 段...
              // 首尾副本（si=0 和 si=N+2）不做动画
              const activeIdx = si - 1
              const isEdge = si === 0 || si === slots.length - 1
              const isInitCenter = activeIdx === 0
              return (
                <g key={si} transform={`translate(${slot.x},${slot.y})`}>
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

    timeline.push({ toAbs: targetValue, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
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

    timeline.push({ toAbs: target, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

export default AnyCarousel
