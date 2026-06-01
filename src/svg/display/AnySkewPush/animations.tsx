import isNil from "lodash/isNil"
import { compileTimeline } from "@smil/timeline/compile"
import type { I_SkewConfig } from "./types"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const EASE = "0.42 0 0.58 1"

/**
 * 生成 skew animateTransform（entrySkew 和 exitSkew 均不传时返回 null）。
 *
 * 时间线4段（stay=0 时跳过 stay 段，避免 keyTimes 相邻相等导致 calcMode=spline 非法）：
 *   进入段 sw：    entryAngle → 0（skew 随图片进入归零）
 *   stay 段：      0 → 0（全屏静止，无 skew）
 *   退出段 nextSw：0 → exitAngle（skew 随图片退出增大）
 *   hold 段：      exitAngle（停在屏幕外，保持退出角度）
 */
export const renderSkewAnim = (
  entrySkew: I_SkewConfig | undefined,
  exitSkew: I_SkewConfig | undefined,
  stay: number,
  sw: number,
  nextSw: number,
  holdTime: number,
  begin: number,
  T: number,
) => {
  if (isNil(entrySkew) && isNil(exitSkew)) return null

  const entryAngle = entrySkew?.angle ?? 0
  const exitAngle  = exitSkew?.angle  ?? 0
  const skewType   = `skew${(entrySkew ?? exitSkew)!.type}` as 'skewX' | 'skewY'

  const segs = [
    { durationSeconds: sw,       to: 0,         keySplines: EASE },
    ...(stay > 0 ? [{ durationSeconds: stay, to: 0, keySplines: EASE }] : []),
    { durationSeconds: nextSw,   to: exitAngle, keySplines: EASE },
    { durationSeconds: holdTime, to: exitAngle, keySplines: EASE },
  ]
  const result = compileTimeline(segs, v => `${v}`, entryAngle)

  return (
    <animateTransform attributeName="transform" type={skewType}
      values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
      dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
      begin={`${begin}s`} fill="freeze" />
  )
}

/**
 * 生成 rotate animateTransform（entryRotation 和 exitRotation 均不传时返回 null）。
 *
 * rotate values 格式为 "angle cx cy"，cx=cy=0 表示以坐标系原点（画布中心）为旋转中心。
 * 时间线结构与 renderSkewAnim 完全一致，参数含义相同。
 */
export const renderRotateAnim = (
  entryRotation: number | undefined,
  exitRotation: number | undefined,
  stay: number,
  sw: number,
  nextSw: number,
  holdTime: number,
  begin: number,
  T: number,
) => {
  if (isNil(entryRotation) && isNil(exitRotation)) return null

  const entryAngle = entryRotation ?? 0
  const exitAngle  = exitRotation  ?? 0

  const segs = [
    { durationSeconds: sw,       to: 0,         keySplines: EASE },
    ...(stay > 0 ? [{ durationSeconds: stay, to: 0, keySplines: EASE }] : []),
    { durationSeconds: nextSw,   to: exitAngle, keySplines: EASE },
    { durationSeconds: holdTime, to: exitAngle, keySplines: EASE },
  ]
  const result = compileTimeline(segs, v => `${v} 0 0`, entryAngle)

  return (
    <animateTransform attributeName="transform" type="rotate"
      values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
      dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
      begin={`${begin}s`} fill="freeze" />
  )
}
