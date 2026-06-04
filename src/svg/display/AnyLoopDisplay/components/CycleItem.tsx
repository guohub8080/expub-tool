import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import max from "lodash/max"
import { transformTranslate, transformSkewX, transformSkewY, transformRotate, transformScale } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import type { I_ItemTimeline } from "@utils/svg/buildCyclicTimelines"
import { getOffscreenTranslate, getRotationOrigin } from "../timeline/offsetCalculator"
import { renderChildItemContent } from "./ChildItemContent"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const DEFAULT_EASE = "0.42 0 0.58 1"

/**
 * CycleItem — 单张循环展示子项组件
 *
 * 每个实例渲染一张图片及其 translate/skew/scale/rotate 动画，结构为：
 *
 *   <g>                              ← 外层 translate（控制进入/退出位移）
 *     <animateTransform translate/>
 *     <g>
 *       <animateTransform skew/>     ← 可选，skew 斜切动画
 *       <g>
 *         <animateTransform scale/>  ← 可选，缩放动画（translate+scale+translate 三元素）
 *         <g>
 *           <animateTransform rotate/> ← 可选，旋转动画
 *           <ChildItemContent/>       ← 图片内容（url 或 jsx）
 *         </g>
 *       </g>
 *     </g>
 *   </g>
 */
const CycleItem = (props: {
  /** 当前子项的标准化配置 */
  item: I_NormalizedChildItem
  /** 当前子项的时间轴信息（由 buildCyclicTimelines 计算） */
  timeline: I_ItemTimeline
  /** 总动画周期（秒） */
  totalDuration: number
  /** 内容区域宽度（已扣除 itemGap） */
  contentWidth: number
  /** 内容区域高度（已扣除 itemGap） */
  contentHeight: number
  /** 画布宽度 */
  canvasWidth: number
  /** 画布高度 */
  canvasHeight: number
}) => {
  const { item, timeline, contentWidth, contentHeight, canvasWidth, canvasHeight } = props

  const { begin, entryDuration: switchDuration, stayDuration, exitDuration: nextSwitchDuration, holdDuration } = timeline

  // 计算 offscreen 距离时考虑 scale 因子，确保放大后的内容也完全离屏
  // 用户可通过 distance 手动覆盖自动计算的倍数
  const autoEntryBuffer = max([1, defaultTo(item.entry.scale?.scale, 1)])
  const autoExitBuffer = max([1, defaultTo(item.exit.scale?.scale, 1)])
  const entryBuffer = defaultTo(item.distance, autoEntryBuffer)
  const exitBuffer = defaultTo(item.distance, autoExitBuffer)

  const enterOffscreenTranslate = getOffscreenTranslate({
    direction: item.entry.direction, canvasWidth, canvasHeight,
    bufferMultiplier: entryBuffer,
  })
  const exitOffscreenTranslate = getOffscreenTranslate({
    direction: item.exit.direction, canvasWidth, canvasHeight,
    bufferMultiplier: exitBuffer,
  })

  // ── translate 时间线：进入 → stay → 退出 → hold ──
  // stay=0 时跳过 stay 段，避免 keyTimes 相邻相等（calcMode=spline 下非法）
  const translateTimeline = [
    { durationSeconds: switchDuration, to: { x: 0, y: 0 }, keySplines: DEFAULT_EASE },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: { x: 0, y: 0 }, keySplines: DEFAULT_EASE }] : []),
    { durationSeconds: nextSwitchDuration, to: exitOffscreenTranslate, keySplines: DEFAULT_EASE },
    { durationSeconds: holdDuration, to: exitOffscreenTranslate, keySplines: DEFAULT_EASE },
  ]

  const hasSkew = !isNil(item.entry.skew) || !isNil(item.exit.skew)
  const hasScale = !isNil(item.entry.scale) || !isNil(item.exit.scale)
  const hasRotation = !isNil(item.entry.rotation) || !isNil(item.exit.rotation)

  // 内容节点：从最内层往外逐层包裹，只有存在对应动画时才加 <g>
  let content: React.ReactNode = renderChildItemContent({ item, contentWidth, contentHeight })

  if (hasRotation) {
    content = (
      <g>
        {renderRotateAnim({
          entryRotation: item.entry.rotation, exitRotation: item.exit.rotation,
          contentWidth, contentHeight,
          stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
        })}
        {content}
      </g>
    )
  }

  if (hasScale) {
    content = (
      <g>
        {renderScaleAnim({
          entryScale: item.entry.scale, exitScale: item.exit.scale,
          contentWidth, contentHeight,
          stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
        })}
        {content}
      </g>
    )
  }

  if (hasSkew) {
    content = (
      <g>
        {renderSkewAnim({
          entrySkew: item.entry.skew, exitSkew: item.exit.skew,
          stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
        })}
        {content}
      </g>
    )
  }

  return (
    <g>
      {/* 外层 translate：控制图片的进入/退出位移 */}
      {transformTranslate({
        initValue: enterOffscreenTranslate,
        timeline: translateTimeline,
        begin: `${begin}s`,
        loopCount: 0,
        isFreeze: true,
        isAdditive: false,
        isRelativeMove: false,
      })}
      {content}
    </g>
  )
}

// ── 内部工具函数 ──

/** 生成 skew animateTransform（entrySkew 和 exitSkew 均不传时返回 null） */
const renderSkewAnim = ({
  entrySkew, exitSkew, stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entrySkew?: I_NormalizedChildItem['entry']['skew']
  exitSkew?: I_NormalizedChildItem['exit']['skew']
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entrySkew) && isNil(exitSkew)) return null

  const entryAngle = entrySkew?.angle ?? 0
  const exitAngle  = exitSkew?.angle  ?? 0
  const isSkewY    = (entrySkew ?? exitSkew)!.type === 'Y'
  const skewEase   = defaultTo(entrySkew?.keySplines, defaultTo(exitSkew?.keySplines, DEFAULT_EASE))

  const segs = [
    { durationSeconds: switchDuration,    to: 0,         keySplines: skewEase },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 0, keySplines: skewEase }] : []),
    { durationSeconds: nextSwitchDuration, to: exitAngle, keySplines: defaultTo(exitSkew?.keySplines, skewEase) },
    { durationSeconds: holdDuration,       to: exitAngle, keySplines: defaultTo(exitSkew?.keySplines, skewEase) },
  ]

  const skewConfig = {
    initValue: entryAngle,
    timeline: segs,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
    isAdditive: false,
  }

  return isSkewY ? transformSkewY(skewConfig) : transformSkewX(skewConfig)
}

/** 生成 rotate animateTransform（entryRotation 和 exitRotation 均不传时返回 null） */
const renderRotateAnim = ({
  entryRotation, exitRotation, contentWidth, contentHeight,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryRotation?: I_NormalizedChildItem['entry']['rotation']
  exitRotation?: I_NormalizedChildItem['exit']['rotation']
  contentWidth: number
  contentHeight: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entryRotation) && isNil(exitRotation)) return null

  const entryAngle = defaultTo(entryRotation?.angle, 0)
  const exitAngle  = defaultTo(exitRotation?.angle, 0)

  const rotationOrigin = getRotationOrigin({
    origin: defaultTo(entryRotation?.childCanvasOrigin, exitRotation?.childCanvasOrigin ?? 'Center'),
    contentWidth,
    contentHeight,
  })

  const ease = entryRotation?.keySplines ?? exitRotation?.keySplines ?? DEFAULT_EASE

  const segs = [
    { durationSeconds: switchDuration,    to: 0,         keySplines: ease },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 0, keySplines: ease }] : []),
    { durationSeconds: nextSwitchDuration, to: exitAngle, keySplines: ease },
    { durationSeconds: holdDuration,       to: exitAngle, keySplines: ease },
  ]

  return transformRotate({
    initValue: entryAngle,
    timeline: segs,
    origin: rotationOrigin,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
    isAdditive: false,
  })
}

/** 生成 scale animateTransform（entryScale 和 exitScale 均不传时返回 null） */
const renderScaleAnim = ({
  entryScale, exitScale, contentWidth, contentHeight,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryScale?: I_NormalizedChildItem['entry']['scale']
  exitScale?: I_NormalizedChildItem['exit']['scale']
  contentWidth: number
  contentHeight: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entryScale) && isNil(exitScale)) return null

  const entryScaleValue = defaultTo(entryScale?.scale, 1)
  const exitScaleValue  = defaultTo(exitScale?.scale, 1)

  const scaleOrigin = getRotationOrigin({
    origin: defaultTo(entryScale?.childCanvasOrigin, exitScale?.childCanvasOrigin ?? 'Center'),
    contentWidth,
    contentHeight,
  })

  const ease = entryScale?.keySplines ?? exitScale?.keySplines ?? DEFAULT_EASE

  const segs = [
    { durationSeconds: switchDuration,    to: 1,              keySplines: ease },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 1, keySplines: ease }] : []),
    { durationSeconds: nextSwitchDuration, to: exitScaleValue, keySplines: ease },
    { durationSeconds: holdDuration,       to: exitScaleValue, keySplines: ease },
  ]

  return transformScale({
    initValue: entryScaleValue,
    timeline: segs,
    origin: scaleOrigin,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
    isAdditive: true,
  })
}

export default CycleItem
