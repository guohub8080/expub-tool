import isNil from "lodash/isNil"
import { compileTimeline } from "@smil/timeline/compile"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import { calculateBegin, calculateHoldDuration } from "../timeline/sequenceCalculator"
import { getOffscreenTranslate } from "../timeline/offsetCalculator"
import { renderChildItemContent } from "./ChildItemContent"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const EASE = "0.42 0 0.58 1"

/**
 * SkewPushItem — 单张斜切推入子项组件
 *
 * 每个实例渲染一张图片及其 translate/skew/rotate 动画，结构为：
 *
 *   <g>                              ← 外层 translate（控制进入/退出位移）
 *     <animateTransform translate/>  ← 4段时间线：进入 → stay → 退出 → hold
 *     <g>
 *       <animateTransform skew/>     ← 可选，skew 斜切动画
 *       <animateTransform rotate/>   ← 可选，旋转动画
 *       <ChildItemContent/>          ← 图片内容（url 或 jsx）
 *     </g>
 *   </g>
 */
const SkewPushItem = (props: {
  /** 当前子项的标准化配置 */
  item: I_NormalizedChildItem
  /** 当前子项的索引 */
  index: number
  /** 所有子项的标准化配置（用于计算时间线） */
  items: I_NormalizedChildItem[]
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
  const { item, index, items, totalDuration, contentWidth, contentHeight, canvasWidth, canvasHeight } = props
  const N = items.length

  const switchDuration = item.switchDuration
  const stayDuration = item.stayDuration
  const nextSwitchDuration = items[(index + 1) % N].switchDuration
  const holdDuration = calculateHoldDuration({ index, items, totalDuration })
  const begin = calculateBegin({ index, items, totalDuration })

  const enterOffscreenTranslate = getOffscreenTranslate({ direction: item.entryDirection, canvasWidth, canvasHeight })
  const exitOffscreenTranslate = getOffscreenTranslate({ direction: item.exitDirection, canvasWidth, canvasHeight })

  // ── translate 时间线：进入 → stay → 退出 → hold ──
  // stay=0 时跳过 stay 段，避免 keyTimes 相邻相等（calcMode=spline 下非法）
  const translateSegs = [
    { durationSeconds: switchDuration, to: '0 0', keySplines: EASE },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: '0 0', keySplines: EASE }] : []),
    { durationSeconds: nextSwitchDuration, to: exitOffscreenTranslate, keySplines: EASE },
    { durationSeconds: holdDuration, to: exitOffscreenTranslate, keySplines: EASE },
  ]
  const translateResult = compileTimeline(translateSegs, v => v, enterOffscreenTranslate)

  // ── skew 时间线：进入段 entryAngle→0, stay 0→0, 退出段 0→exitAngle, hold exitAngle ──
  const skewAnim = renderSkewAnim({
    entrySkew: item.entrySkew, exitSkew: item.exitSkew,
    stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin, totalDuration,
  })

  // ── rotate 时间线：结构同 skew ──
  const rotateAnim = renderRotateAnim({
    entryRotation: item.entryRotation, exitRotation: item.exitRotation,
    stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin, totalDuration,
  })

  return (
    <g>
      {/* 外层 translate：控制图片的进入/退出位移 */}
      <animateTransform attributeName="transform" type="translate"
        values={translateResult.values} keyTimes={translateResult.keyTimes} keySplines={translateResult.keySplines}
        dur={`${totalDuration}s`} calcMode="spline" repeatCount="indefinite"
        begin={`${begin}s`} fill="freeze" />
      <g>
        {skewAnim}
        {rotateAnim}
        {renderChildItemContent({ item, contentWidth, contentHeight })}
      </g>
    </g>
  )
}

// ── 内部工具函数 ──

/** 生成 skew animateTransform（entrySkew 和 exitSkew 均不传时返回 null） */
const renderSkewAnim = ({
  entrySkew, exitSkew, stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin, totalDuration,
}: {
  entrySkew?: I_NormalizedChildItem['entrySkew']
  exitSkew?: I_NormalizedChildItem['exitSkew']
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
  totalDuration: number
}) => {
  if (isNil(entrySkew) && isNil(exitSkew)) return null

  const entryAngle = entrySkew?.angle ?? 0
  const exitAngle  = exitSkew?.angle  ?? 0
  const skewType   = `skew${(entrySkew ?? exitSkew)!.type}` as 'skewX' | 'skewY'

  const segs = [
    { durationSeconds: switchDuration,    to: 0,         keySplines: EASE },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 0, keySplines: EASE }] : []),
    { durationSeconds: nextSwitchDuration, to: exitAngle, keySplines: EASE },
    { durationSeconds: holdDuration,       to: exitAngle, keySplines: EASE },
  ]
  const result = compileTimeline(segs, v => `${v}`, entryAngle)

  return (
    <animateTransform attributeName="transform" type={skewType}
      values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
      dur={`${totalDuration}s`} calcMode="spline" repeatCount="indefinite"
      begin={`${begin}s`} fill="freeze" />
  )
}

/** 生成 rotate animateTransform（entryRotation 和 exitRotation 均不传时返回 null） */
const renderRotateAnim = ({
  entryRotation, exitRotation, stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin, totalDuration,
}: {
  entryRotation?: number
  exitRotation?: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
  totalDuration: number
}) => {
  if (isNil(entryRotation) && isNil(exitRotation)) return null

  const entryAngle = entryRotation ?? 0
  const exitAngle  = exitRotation  ?? 0

  const segs = [
    { durationSeconds: switchDuration,    to: 0,         keySplines: EASE },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 0, keySplines: EASE }] : []),
    { durationSeconds: nextSwitchDuration, to: exitAngle, keySplines: EASE },
    { durationSeconds: holdDuration,       to: exitAngle, keySplines: EASE },
  ]
  const result = compileTimeline(segs, v => `${v} 0 0`, entryAngle)

  return (
    <animateTransform attributeName="transform" type="rotate"
      values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
      dur={`${totalDuration}s`} calcMode="spline" repeatCount="indefinite"
      begin={`${begin}s`} fill="freeze" />
  )
}

export default SkewPushItem
