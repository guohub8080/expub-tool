import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import { compileTimeline } from "@smil/timeline/compile"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import type { I_GhostTimeline } from "@utils/svg/buildCyclicTimelines"
import { getRotationOrigin } from "../timeline/offsetCalculator"
import { renderChildItemContent } from "./ChildItemContent"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const DEFAULT_EASE = "0.42 0 0.58 1"

/**
 * GhostLayer — 图1的视觉副本，渲染在 DOM 最后（SVG z 轴最顶层）。
 *
 * 问题背景：SVG 使用 painter's algorithm，DOM 靠后的元素覆盖靠前的元素。
 * 图1在 DOM 第一位（最底层），图N在最后（最顶层）。
 * 当图N退出、图1进入时，图N在上层会遮住图1，导致图1的进入动画不可见。
 *
 * 解决方案：在 DOM 末尾放一个与图1完全相同的副本（Ghost），
 * 只在图1进入的那段时间内可见（visibility: hidden → visible → hidden），
 * 其余时间隐藏。这样视觉上图1始终能覆盖图N，实现"新图永远盖住旧图"的效果。
 *
 * 时序（begin = 0s，周期 = totalDuration）：
 * - [0, totalDuration-switchDuration)：停在屏幕外，visibility=hidden
 * - [totalDuration-switchDuration, totalDuration)：执行进入动画，visibility=visible
 * - totalDuration 时刻：瞬间 hidden，图1已到位，Ghost 完成使命
 */
const GhostLayer = (props: {
  /** 图1的标准化配置 */
  firstItem: I_NormalizedChildItem
  /** 图1的屏幕外进入坐标（由 getOffscreenTranslate 计算，如 "0 -300"） */
  enterOffscreenTranslate: string
  /** Ghost 层时间轴（由 buildCyclicTimelines 计算） */
  ghostTimeline: I_GhostTimeline
  /** 总动画周期（秒） */
  totalDuration: number
  /** 内容区域宽度（已扣除 itemGap） */
  contentWidth: number
  /** 内容区域高度（已扣除 itemGap） */
  contentHeight: number
}) => {
  const { firstItem, enterOffscreenTranslate, ghostTimeline, totalDuration, contentWidth, contentHeight } = props
  const T = totalDuration
  const sw = ghostTimeline.entryDuration

  // Ghost 在周期内的 keyTime：从这个时刻开始变 visible（= 图1进入开始）
  const ghostShowKeyTime = ((T - sw) / T).toFixed(6)

  // Ghost translate：前段停在屏幕外，后段执行进入动画（→ 0 0）
  const ghostTranslate = compileTimeline(
    [
      { durationSeconds: T - sw, to: enterOffscreenTranslate, keySplines: DEFAULT_EASE },
      { durationSeconds: sw,     to: '0 0',                   keySplines: DEFAULT_EASE },
    ],
    v => v,
    enterOffscreenTranslate,
  )

  // Ghost skew：仅在 entry.skew 存在时渲染
  // 前段保持 entryAngle（图1在屏幕外时的 skew 状态），后段随进入动画归零
  const ghostSkewAnim = firstItem.entry.skew && (() => {
    const result = compileTimeline(
      [
        { durationSeconds: T - sw, to: firstItem.entry.skew!.angle, keySplines: defaultTo(firstItem.entry.skew!.keySplines, DEFAULT_EASE) },
        { durationSeconds: sw,     to: 0,                           keySplines: defaultTo(firstItem.entry.skew!.keySplines, DEFAULT_EASE) },
      ],
      v => `${v}`,
      firstItem.entry.skew!.angle,
    )
    return (
      <animateTransform attributeName="transform" type={`skew${firstItem.entry.skew!.type}` as 'skewX' | 'skewY'}
        values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
        dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
    )
  })()

  // Ghost rotate：仅在 entry.rotation 存在时渲染，使用图1的 origin 和 keySplines
  const ghostRotateAnim = !isNil(firstItem.entry.rotation) && (() => {
    const rotationOrigin = getRotationOrigin({
      origin: firstItem.entry.rotation!.origin,
      contentWidth,
      contentHeight,
    })
    const ease = defaultTo(firstItem.entry.rotation!.keySplines, DEFAULT_EASE)
    const result = compileTimeline(
      [
        { durationSeconds: T - sw, to: firstItem.entry.rotation!.angle, keySplines: ease },
        { durationSeconds: sw,     to: 0,                                keySplines: ease },
      ],
      v => `${v} ${rotationOrigin}`,
      firstItem.entry.rotation!.angle,
    )
    return (
      <animateTransform attributeName="transform" type="rotate"
        values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
        dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
    )
  })()

  return (
    <g key="ghost" visibility="hidden">
      {/* visibility 切换：在图1进入段瞬间变 visible，进入完成后瞬间 hidden */}
      <animate attributeName="visibility"
        values="hidden; visible; hidden"
        keyTimes={`0; ${ghostShowKeyTime}; 1`}
        dur={`${T}s`} calcMode="discrete"
        repeatCount="indefinite" begin="0s" fill="freeze" />
      <animateTransform attributeName="transform" type="translate"
        values={ghostTranslate.values} keyTimes={ghostTranslate.keyTimes} keySplines={ghostTranslate.keySplines}
        dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
      <g>
        {ghostSkewAnim}
        {ghostRotateAnim}
        {renderChildItemContent({ item: firstItem, contentWidth, contentHeight })}
      </g>
    </g>
  )
}

export default GhostLayer
