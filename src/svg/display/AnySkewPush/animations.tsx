import isNil from "lodash/isNil"
import { compileTimeline } from "@smil/timeline/compile"
import type { ReactNode } from "react"
import type { I_SkewConfig, I_AnySkewPushChildItem } from "./types"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const EASE = "0.42 0 0.58 1"

/**
 * 生成 skew animateTransform（entrySkew 和 exitSkew 均不传时返回 null）。
 *
 * 时间线4段（stay=0 时跳过 stay 段，避免 keyTimes 相邻相等导致 calcMode=spline 非法）：
 *   进入段：         entryAngle → 0（skew 随图片进入归零）
 *   stay 段：        0 → 0（全屏静止，无 skew）
 *   退出段：         0 → exitAngle（skew 随图片退出增大）
 *   屏幕外等待段：   exitAngle（停在屏幕外，保持退出角度）
 */
export const renderSkewAnim = ({
  entrySkew,
  exitSkew,
  stayDuration,
  switchDuration,
  nextSwitchDuration,
  holdDuration,
  begin,
  totalDuration,
}: {
  /** 进入时的 skew 配置（type + angle），不传则进入时无 skew */
  entrySkew?: I_SkewConfig
  /** 退出时的 skew 配置（type + angle），不传则退出时无 skew */
  exitSkew?: I_SkewConfig
  /** 当前图在全屏位置的停留时长（秒），=0 时跳过 stay 段 */
  stayDuration: number
  /** 当前图的切换（进入）时长（秒） */
  switchDuration: number
  /** 下一张图的切换时长（秒），决定当前图的退出速度 */
  nextSwitchDuration: number
  /** 当前图在屏幕外等待下一轮进入的时长（秒） */
  holdDuration: number
  /** 动画的 begin 偏移（秒），通过 getBegin() 计算得出 */
  begin: number
  /** 总动画周期（秒），所有图的 stayDuration + switchDuration 之和 */
  totalDuration: number
}) => {
  if (isNil(entrySkew) && isNil(exitSkew)) return null

  const entryAngle = entrySkew?.angle ?? 0
  const exitAngle  = exitSkew?.angle  ?? 0
  // 两者都传时以 entrySkew.type 为准（进入和退出共用同一个 skew 轴）
  const skewType   = `skew${(entrySkew ?? exitSkew)!.type}` as 'skewX' | 'skewY'

  const segs = [
    { durationSeconds: switchDuration,     to: 0,         keySplines: EASE },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 0, keySplines: EASE }] : []),
    { durationSeconds: nextSwitchDuration,  to: exitAngle, keySplines: EASE },
    { durationSeconds: holdDuration,        to: exitAngle, keySplines: EASE },
  ]
  const result = compileTimeline(segs, v => `${v}`, entryAngle)

  return (
    <animateTransform attributeName="transform" type={skewType}
      values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
      dur={`${totalDuration}s`} calcMode="spline" repeatCount="indefinite"
      begin={`${begin}s`} fill="freeze" />
  )
}

/**
 * 生成 rotate animateTransform（entryRotation 和 exitRotation 均不传时返回 null）。
 *
 * rotate values 格式为 "angle cx cy"，cx=cy=0 表示以坐标系原点（画布中心）为旋转中心。
 * 时间线结构与 renderSkewAnim 完全一致，参数含义相同。
 */
export const renderRotateAnim = ({
  entryRotation,
  exitRotation,
  stayDuration,
  switchDuration,
  nextSwitchDuration,
  holdDuration,
  begin,
  totalDuration,
}: {
  /** 进入时的旋转角度（度），不传则进入时无旋转 */
  entryRotation?: number
  /** 退出时的旋转角度（度），不传则退出时无旋转 */
  exitRotation?: number
  /** 当前图在全屏位置的停留时长（秒），=0 时跳过 stay 段 */
  stayDuration: number
  /** 当前图的切换（进入）时长（秒） */
  switchDuration: number
  /** 下一张图的切换时长（秒），决定当前图的退出速度 */
  nextSwitchDuration: number
  /** 当前图在屏幕外等待下一轮进入的时长（秒） */
  holdDuration: number
  /** 动画的 begin 偏移（秒），通过 getBegin() 计算得出 */
  begin: number
  /** 总动画周期（秒），所有图的 stayDuration + switchDuration 之和 */
  totalDuration: number
}) => {
  if (isNil(entryRotation) && isNil(exitRotation)) return null

  const entryAngle = entryRotation ?? 0
  const exitAngle  = exitRotation  ?? 0

  const segs = [
    { durationSeconds: switchDuration,     to: 0,         keySplines: EASE },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 0, keySplines: EASE }] : []),
    { durationSeconds: nextSwitchDuration,  to: exitAngle, keySplines: EASE },
    { durationSeconds: holdDuration,        to: exitAngle, keySplines: EASE },
  ]
  const result = compileTimeline(segs, v => `${v} 0 0`, entryAngle)

  return (
    <animateTransform attributeName="transform" type="rotate"
      values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
      dur={`${totalDuration}s`} calcMode="spline" repeatCount="indefinite"
      begin={`${begin}s`} fill="freeze" />
  )
}

/**
 * Ghost Layer：图1的视觉副本，渲染在 DOM 最后（SVG z 轴最顶层）。
 *
 * 问题背景：SVG 使用 painter's algorithm，DOM 靠后的元素覆盖靠前的元素。
 * 图1在 DOM 第一位（最底层），图N在最后（最顶层）。
 * 当图N退出、图1进入时，图N在上层会遮住图1，导致图1的进入动画不可见。
 *
 * 解决方案：在 DOM 末尾放一个与图1完全相同的副本（Ghost），
 * 只在图1进入的那段时间内可见（visibility: hidden → visible → hidden），
 * 其余时间隐藏。这样视觉上图1始终能覆盖图N，实现"新图永远盖住旧图"的效果。
 *
 * 时序：Ghost 的动画周期 = totalDuration，begin = 0s。
 * - [0, T-switchDuration)：停在屏幕外，visibility=hidden（图1处于 stay/退出/hold 阶段）
 * - [T-switchDuration, T)：执行与图1完全相同的进入动画，visibility=visible（图1进入阶段）
 * - T 时刻：瞬间 hidden，图1已到位，Ghost 完成使命
 *
 * Ghost 的 skew/rotate 用2段时间线（前段保持进入值，后段归零），
 * 与 Ghost translate 同构，begin 统一为 0s。
 */
export const renderGhostLayer = ({
  item0,
  enterOffscreenTranslate,
  switchDuration,
  totalDuration,
  renderContent,
}: {
  /** 图1的配置 */
  item0: I_AnySkewPushChildItem
  /** 图1的屏幕外进入坐标（由 getOffscreenTy 计算，如 "0 -300"） */
  enterOffscreenTranslate: string
  /** 图1的切换动画时长（秒） */
  switchDuration: number
  /** 总动画周期（秒），所有图的 stayDuration + switchDuration 之和 */
  totalDuration: number
  /** 渲染图片内容的回调（由 index.tsx 传入，依赖 contentW/contentH 闭包） */
  renderContent: (item: I_AnySkewPushChildItem) => ReactNode
}) => {
  const T = totalDuration
  const sw = switchDuration

  // Ghost 在周期内的 keyTime：从这个时刻开始变 visible（= 图1进入开始）
  const ghostShowKt = ((T - sw) / T).toFixed(6)

  // Ghost translate：前段停在屏幕外（enterOffscreenTranslate），后段执行进入动画（→ 0 0）
  const ghostTy = compileTimeline(
    [
      { durationSeconds: T - sw, to: enterOffscreenTranslate, keySplines: EASE },
      { durationSeconds: sw,     to: '0 0',                   keySplines: EASE },
    ],
    v => v,
    enterOffscreenTranslate,
  )

  // Ghost skew：仅在 entrySkew 存在时渲染
  // 前段保持 entryAngle（图1在屏幕外时的 skew 状态），后段随进入动画归零
  const ghostSkewAnim = item0.entrySkew && (() => {
    const result = compileTimeline(
      [
        { durationSeconds: T - sw, to: item0.entrySkew!.angle, keySplines: EASE },
        { durationSeconds: sw,     to: 0,                      keySplines: EASE },
      ],
      v => `${v}`,
      item0.entrySkew!.angle,
    )
    return (
      <animateTransform attributeName="transform" type={`skew${item0.entrySkew!.type}` as 'skewX' | 'skewY'}
        values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
        dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
    )
  })()

  // Ghost rotate：仅在 entryRotation 存在时渲染，结构与 ghostSkewAnim 完全对称
  const ghostRotateAnim = !isNil(item0.entryRotation) && (() => {
    const result = compileTimeline(
      [
        { durationSeconds: T - sw, to: item0.entryRotation!, keySplines: EASE },
        { durationSeconds: sw,     to: 0,                    keySplines: EASE },
      ],
      v => `${v} 0 0`,
      item0.entryRotation!,
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
        keyTimes={`0; ${ghostShowKt}; 1`}
        dur={`${T}s`} calcMode="discrete"
        repeatCount="indefinite" begin="0s" fill="freeze" />
      <animateTransform attributeName="transform" type="translate"
        values={ghostTy.values} keyTimes={ghostTy.keyTimes} keySplines={ghostTy.keySplines}
        dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
      <g>
        {ghostSkewAnim}
        {ghostRotateAnim}
        {renderContent(item0)}
      </g>
    </g>
  )
}
