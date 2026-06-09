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
 * 同时显示 3 个 slot：左面（已退出，带 exitAngle skew）、中间正面、右面（待进入，带 entryAngle skew）
 * 外层 translate 整体推动切换，模拟 cube 旋转效果。
 *
 * 核心对齐原理（来自 README）：
 * - skew origin 在底边中心 (faceW/2, contentH)
 * - translate 步进距离 = faceW，保证面与面无缝衔接
 * - skew 状态下需要 Y 方向交叉轴补偿 = contentH/2 * tan(angle)
 * - skew 和 translate 是同一个 3D 旋转的两个 2D 投影，必须严格同步
 *
 * 渲染结构（每个 slot）：
 *   <g translate(slotX, slotY)>        ← 静态定位（面在画布中的 X 位置 + 垂直居中）
 *     <g>                              ← Y 补偿动画层（skew 时有 yOff，正面时 0）
 *       <animateTransform translate/>
 *       <g translate(originX, originY)> ← skew origin 定位
 *         <g>                          ← skewY 动画层
 *           <animateTransform skewY/>
 *           <g translate(-cW/2, -cH)>  ← 内容反向定位
 *             <foreignObject/>
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

  // ── 交叉轴补偿（Y 方向） ──
  // skew 状态下 origin 在底边中心，内容绕底边旋转，视觉中心上移/下移
  // 补偿量 = contentH/2 * tan(angle)
  const crossComp = round(contentH / 2 * Math.tan(skewAngle * Math.PI / 180))

  // ── skew 角度方向（README 定义） ──
  // normal: entryAngle = -angle（从右进入），exitAngle = +angle（向左退出）
  // reversed: entryAngle = +angle，exitAngle = -angle
  const entryAngle = isReversed ? skewAngle : -skewAngle
  const exitAngle = isReversed ? -skewAngle : skewAngle

  // ── Y 补偿方向（README: signedCrossComp = isReversed ? +crossComp : -crossComp） ──
  const signedYOff = isReversed ? crossComp : -crossComp

  // ── skew origin：底边中心 ──
  const originX = faceW / 2
  const originY = contentH

  // ── normalize items（保证至少 3 张） ──
  const items = normalizeItems(props.childItems)
  const N = items.length

  // ── slot 排列 ──
  // slot[1] = 初始中心，slot[0] = 左 peek（已退出状态），slot[2] = 右 peek（待进入状态）
  // 总共 N+3 个 slot
  const centerX = (w - faceW) / 2
  const centerY = (h - contentH) / 2

  const slots: { item: I_SkewSlideCarouselChildItem; x: number }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N
    // normal：slot[0] 在最右，slot 向左排列，外层向右推
    // reversed：slot[0] 在最左，slot 向右排列，外层向左推
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
            {slots.map((slot, si) => (
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
                entryAngle={entryAngle}
                exitAngle={exitAngle}
                signedYOff={signedYOff}
                si={si}
                N={N}
                items={items}
              />
            ))}
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
  entryAngle: number
  exitAngle: number
  signedYOff: number
  si: number
  N: number
  items: I_SkewSlideCarouselChildItem[]
}) => {
  const {
    item, slotX, slotY, contentW, contentH,
    originX, originY, entryAngle, exitAngle, signedYOff,
    si, N, items,
  } = props
  const isEdge = si === 0 || si === N + 2

  // activeIdx: slot[1]=0（初始中心），slot[2]=1, slot[3]=2 ...
  const activeIdx = si - 1

  // ── 初始状态 ──
  // slot[1] (activeIdx=0)：中心，skew=0，yOff=0
  // slot[0] (activeIdx=-1)：左 peek 副本（已退出状态），skew=exitAngle，yOff=signedYOff
  // slot[2+] (activeIdx>=1)：右侧（待进入状态），skew=entryAngle，yOff=signedYOff
  const initSkew = activeIdx === 0 ? 0 : activeIdx < 0 ? exitAngle : entryAngle
  const initYOff = activeIdx === 0 ? 0 : signedYOff

  // ── skewY 动画 timeline ──
  const skewTimeline = buildSlotSkew(activeIdx, N, items, entryAngle, exitAngle)

  // ── Y 补偿 translate timeline（与 skew 同步）──
  const yOffTimeline = buildSlotYOff(activeIdx, N, items, signedYOff)

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
// 1 图 → 复制 3 遍 = 3 张
// 2 图 → 复制 2 遍 = 4 张（用户说 ≥3 时 2 图复制 2 遍就够）
// ≥ 3 图 → 不变

function normalizeItems(childItems: I_SkewSlideCarouselChildItem[]): I_SkewSlideCarouselChildItem[] {
  const len = childItems.length
  if (len >= 3) return childItems
  if (len === 1) return [...childItems, ...childItems, ...childItems]
  // len === 2：复制 2 遍 = 4 张
  return [...childItems, ...childItems]
}

// ── slot skewY timeline ──
//
// 每个 slot 在切换到中心时 skew 变为 0（正面），离开中心时恢复 skew。
// 时间段结构：N 轮 × 2 段（switch + stay），共 N*2 段。
//
// 规律（与 CoverFlow 的 scale 对应）：
// - activeIdx=0（初始中心）：initSkew=0，第 0 段推走变为 exitAngle，之后保持 exitAngle
// - activeIdx=K (K>=1)：initSkew=entryAngle
//   - 段 (K-1)*2：skew 从当前值 → 0（进入中心）
//   - 段 (K-1)*2+1：保持 0（stay）
//   - 段 (K-1)*2+2：skew 0 → exitAngle（退出中心）
//   - 之后保持 exitAngle

function buildSlotSkew(
  activeIdx: number, N: number, items: I_SkewSlideCarouselChildItem[],
  entryAngle: number, exitAngle: number,
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
    if (activeIdx <= 0) {
      // 初始中心或左 peek 副本：推走后变成 exitAngle
      targetValue = exitAngle
    } else {
      const enterSeg = (activeIdx - 1) * 2
      const staySeg = enterSeg + 1
      if (seg === enterSeg || seg === staySeg) {
        // 进入中心 + stay：skew = 0
        targetValue = 0
      } else if (seg > staySeg) {
        // 退出后：exitAngle
        targetValue = exitAngle
      } else {
        // 尚未进入：entryAngle
        targetValue = entryAngle
      }
    }

    timeline.push({ toAbs: targetValue, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

// ── slot Y 补偿 timeline ──
// 与 skew 严格同步：skew=0 时 yOff=0，skew≠0 时 yOff=signedYOff

function buildSlotYOff(
  activeIdx: number, N: number, items: I_SkewSlideCarouselChildItem[],
  signedYOff: number,
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
    if (activeIdx <= 0) {
      // 推走后 Y 补偿
      target = { x: 0, y: signedYOff }
    } else {
      const enterSeg = (activeIdx - 1) * 2
      const staySeg = enterSeg + 1
      if (seg === enterSeg || seg === staySeg) {
        // 中心：无补偿
        target = { x: 0, y: 0 }
      } else {
        // skew 状态：有补偿
        target = { x: 0, y: signedYOff }
      }
    }

    timeline.push({ toAbs: target, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }
  return timeline
}

export default SkewSlideCarouselX
