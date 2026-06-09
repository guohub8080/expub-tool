import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import max from 'lodash/max'
import min from 'lodash/min'
import floor from 'lodash/floor'
import round from 'lodash/round'
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate } from '@smil/index'
import { transformSkewY } from '@smil/index'
import svgURL from "@utils/svg/svgURL"
import { isDefined } from '@utils/fn/isDefined'
import type { I_TimelineKeyframe } from '@smil/timeline/types'
import type { I_TranslateValue } from '@smil/animateTransform/translate'
import type { I_SkewSlideCarouselChildItem } from '../types'
import { EASE, DEFAULT_SKEW_ANGLE, DEFAULT_SWITCH_DURATION, DEFAULT_STAY_DURATION } from '../types'

export type { I_SkewSlideCarouselChildItem } from '../types'

/**
 * SkewSlideCarouselX — 横向斜切轮播（三面可见）
 *
 * 同时显示 3 个 slot：左面（带正向 skewY）、中间正面、右面（带反向 skewY）
 * 外层 translate 整体推动切换，模拟 cube 旋转效果。
 *
 * 渲染结构：
 *   <g>                    ← 外层 translate（整体位移驱动切换）
 *     <g> slot[0]          ← 左 peek
 *     <g> slot[1]          ← 初始中心
 *     <g> slot[2]          ← 右 peek
 *     ...                  ← N+2 个 slot（含首尾副本）
 *     <animateTransform translate/>
 *   </g>
 */
const SkewSlideCarouselX = (props: {
  canvasSize: { w: number; h: number }
  childCanvasSize?: { w: number; h: number }
  gap?: number
  skewAngle?: number
  isReversed?: boolean
  childItems: I_SkewSlideCarouselChildItem[]
  spacing?: T_SpacingProps
  canvasBg?: I_CanvasBg
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (isNil(props.childItems) || props.childItems.length === 0) return null

  const { w, h } = props.canvasSize
  const isReversed = defaultTo(props.isReversed, false)
  const gap = defaultTo(props.gap, 0)

  // ── 内容尺寸 ──
  const childCanvas = defaultTo(props.childCanvasSize, { w, h })
  const contentW = max([1, childCanvas.w])!
  const contentH = max([1, childCanvas.h])!

  // ── 斜切角度限制 ──
  const rawAngle = defaultTo(props.skewAngle, DEFAULT_SKEW_ANGLE)
  const maxAngle = max([1, floor(Math.atan(contentW / contentH) * 180 / Math.PI)])!
  const skewAngle = min([max([rawAngle, 1]), maxAngle])!

  // ── 面宽度（translate 步进距离） ──
  const faceW = contentW + gap

  // ── Y 补偿：skewY 让内容绕底边倾斜，translate Y 偏移保持视觉中心稳定 ──
  const yOff = round(contentH / 2 * Math.tan(skewAngle * Math.PI / 180))

  // ── skew origin：底边中心 ──
  const originX = faceW / 2
  const originY = contentH

  // ── normalize items（保证至少 3 张） ──
  const items = normalizeItems(props.childItems)
  const N = items.length

  // ── slot 排列 ──
  // slot[1] 为初始中心，slot[0] 为左 peek，slot[2] 为右 peek
  // 总共 N+3 个 slot（含首尾副本保证无缝循环）
  const centerX = (w - faceW) / 2
  const centerY = (h - contentH) / 2

  const slots: { item: I_SkewSlideCarouselChildItem; x: number }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N
    const x = isReversed
      ? centerX - faceW + i * faceW
      : centerX + faceW - i * faceW
    slots.push({ item: items[itemIdx], x })
  }

  // ── 外层 translate 时间轴 ──
  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const switchDur = defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION)
    const stayDur = defaultTo(item.stayDuration, DEFAULT_STAY_DURATION)
    const delta = (i + 1) * faceW
    const target = isReversed ? { x: -delta, y: 0 } : { x: delta, y: 0 }
    outerTimeline.push({ toAbs: target, durationSeconds: switchDur, keySplines: EASE })
    outerTimeline.push({ toAbs: target, durationSeconds: stayDur })
  }

  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'skew-slide-carousel-x' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }} width="100%">
          <g>
            {slots.map((slot, si) => {
              const isCenter = si === 1
              const isLeftPeek = si === 0
              const isRightPeek = si === 2
              // 左面：正向 skew，右面：反向 skew，中间：0
              // 但 slot 位置不同于 activeIdx，静态 skew 根据相对位置决定
              return (
                <SkewSlotItem
                  key={si}
                  item={slot.item}
                  slotX={slot.x}
                  slotY={centerY}
                  contentW={contentW}
                  contentH={contentH}
                  faceW={faceW}
                  originX={originX}
                  originY={originY}
                  skewAngle={skewAngle}
                  yOff={yOff}
                  isReversed={isReversed}
                  si={si}
                  N={N}
                  items={items}
                />
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

// ── 单 slot 渲染 ──

const SkewSlotItem = (props: {
  item: I_SkewSlideCarouselChildItem
  slotX: number
  slotY: number
  contentW: number
  contentH: number
  faceW: number
  originX: number
  originY: number
  skewAngle: number
  yOff: number
  isReversed: boolean
  si: number
  N: number
  items: I_SkewSlideCarouselChildItem[]
}) => {
  const { item, slotX, slotY, contentW, contentH, faceW, originX, originY, skewAngle, yOff, isReversed, si, N, items } = props
  const isEdge = si === 0 || si === N + 2

  // activeIdx: slot[1]=0（初始中心），slot[2]=1 ...
  const activeIdx = si - 1

  // ── skewY timeline：每个 slot 在切换到中心时 skew → 0，离开时恢复 skew ──
  // 左侧面 skewAngle（正向），右侧面 -skewAngle（反向）
  // isReversed 时方向取反
  const leftSkew = isReversed ? -skewAngle : skewAngle
  const rightSkew = isReversed ? skewAngle : -skewAngle

  // 初始 skew：slot[1] 是中心=0，slot[0] 是左=leftSkew，slot[2+] 是右=rightSkew
  const initSkew = activeIdx === 0 ? 0 : activeIdx < 0 ? leftSkew : rightSkew

  // ── skewY 动画 timeline ──
  const skewTimeline = buildSlotSkew(activeIdx, N, items, leftSkew, rightSkew)

  // ── Y 补偿 translate timeline ──
  // 中心面 yOff=0，左面和右面有 yOff 补偿
  const leftYOff = isReversed ? -yOff : yOff
  const rightYOff = isReversed ? yOff : -yOff
  const initYOff = activeIdx === 0 ? 0 : activeIdx < 0 ? leftYOff : rightYOff
  const yOffTimeline = buildSlotYOff(activeIdx, N, items, leftYOff, rightYOff)

  // ── 内容 ──
  const content = isDefined(item.jsx)
    ? item.jsx
    : <SvgEx viewBox={`0 0 ${contentW + 1} ${contentH + 1}`}
        style={{
          backgroundImage: svgURL(item.url!), backgroundSize: "cover",
          backgroundPosition: "50% 50%", backgroundRepeat: "no-repeat",
          width: "100%", display: "block", boxSizing: "border-box",
        }} />

  return (
    <g transform={`translate(${slotX},${slotY})`}>
      <g>
        {!isEdge && transformTranslate({
          initValue: { x: 0, y: initYOff },
          timeline: yOffTimeline,
          begin: '0s',
          loopCount: 0,
          isFreeze: true,
          isAdditive: false,
        })}
        <g transform={`translate(${originX}, ${originY})`}>
          <g>
            {!isEdge && transformSkewY({
              initValue: initSkew,
              timeline: skewTimeline,
              begin: '0s',
              loopCount: 0,
              isFreeze: true,
              isAdditive: false,
            })}
            <g transform={`translate(${-contentW / 2}, ${-contentH})`}>
              <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
                {content}
              </foreignObject>
            </g>
          </g>
        </g>
      </g>
    </g>
  )
}

// ── normalize：保证至少 3 张 ──

function normalizeItems(childItems: I_SkewSlideCarouselChildItem[]): I_SkewSlideCarouselChildItem[] {
  const len = childItems.length
  if (len >= 3) return childItems
  if (len === 1) return [...childItems, ...childItems, ...childItems]
  // len === 2：复制 3 遍 = 6 张
  return [...childItems, ...childItems, ...childItems]
}

// ── slot skewY timeline ──
// 规律同 CoverFlow 的 scale：
// slot[1] (activeIdx=0): 初始中心，initSkew=0，第0段变为 rightSkew（推走），之后保持
// slot[2] (activeIdx=1): initSkew=rightSkew，在段 (activeIdx-1)*2 时变为 0（进入中心），
//   段 (activeIdx-1)*2+1 保持 0，段 (activeIdx-1)*2+2 变为 rightSkew（推走）

function buildSlotSkew(
  activeIdx: number, N: number, items: I_SkewSlideCarouselChildItem[],
  leftSkew: number, rightSkew: number,
): I_TimelineKeyframe<number>[] {
  const timeline: I_TimelineKeyframe<number>[] = []
  const totalSegs = N * 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch
      ? defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION)
      : defaultTo(item.stayDuration, DEFAULT_STAY_DURATION)
    const splines = isSwitch ? EASE : undefined

    let targetValue: number
    if (activeIdx === 0) {
      // 初始中心，第 0 段推走变成左面（leftSkew 方向 → 实际是右侧推走用 rightSkew）
      // slot[1] 向左推走 → 它变成了"被推到左侧"的面
      targetValue = leftSkew
    } else if (activeIdx < 0) {
      // 左 peek 副本，始终 leftSkew
      targetValue = leftSkew
    } else {
      const enlargeSeg = (activeIdx - 1) * 2
      const holdSeg = enlargeSeg + 1
      if (seg === enlargeSeg || seg === holdSeg) {
        targetValue = 0
      } else if (seg > holdSeg) {
        targetValue = leftSkew
      } else {
        targetValue = rightSkew
      }
    }

    timeline.push({ toAbs: targetValue, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

// ── slot Y 补偿 timeline（与 skew 同步） ──

function buildSlotYOff(
  activeIdx: number, N: number, items: I_SkewSlideCarouselChildItem[],
  leftYOff: number, rightYOff: number,
): I_TimelineKeyframe<Partial<I_TranslateValue>>[] {
  const timeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  const totalSegs = N * 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const itemIdx = floor(seg / 2)
    const item = items[itemIdx % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch
      ? defaultTo(item.switchDuration, DEFAULT_SWITCH_DURATION)
      : defaultTo(item.stayDuration, DEFAULT_STAY_DURATION)
    const splines = isSwitch ? EASE : undefined

    let target: { x: number; y: number }
    if (activeIdx === 0) {
      target = { x: 0, y: leftYOff }
    } else if (activeIdx < 0) {
      target = { x: 0, y: leftYOff }
    } else {
      const enlargeSeg = (activeIdx - 1) * 2
      const holdSeg = enlargeSeg + 1
      if (seg === enlargeSeg || seg === holdSeg) {
        target = { x: 0, y: 0 }
      } else if (seg > holdSeg) {
        target = { x: 0, y: leftYOff }
      } else {
        target = { x: 0, y: rightYOff }
      }
    }

    timeline.push({ toAbs: target, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

export default SkewSlideCarouselX
