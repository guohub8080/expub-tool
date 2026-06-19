/**
 * 动画时间线构建：放大/缩小/淡入/淡出/进出画布
 *
 * 参考 参考实现 的时序（duration=D）：
 * - mouseover → 放大(Ds) → visibility=hidden → mouseout 自动触发 → 缩小(Ds) → mouseout+D → 淡出+移走
 * - 所有延迟 = duration（跟参考的固定 1s 一致，因为参考 D=1）
 */

import { transformTranslate, transformScaleRaw, animateOpacity, setVisibility } from "@smil/index"
import type { ReactNode } from "react"

const HOLD_SPLINES = "0 0 1 1"

/**
 * off-screen g 的 translate 动画（放大内容进出画布）
 * mouseover → 2000,0→0,0（进场）
 * mouseout+D → 0,0→2000,0（退场）
 */
export const buildOffScreenTranslate = (duration: number): ReactNode => (
  <>
    {transformTranslate({
      initValue: { x: 2000, y: 0 },
      timeline: [
        { toAbs: { x: 0, y: 0 }, durationSeconds: 0.0001 },
        { toAbs: { x: 0, y: 0 }, durationSeconds: 99.9999 },
      ],
      begin: "mouseover",
      calcMode: "discrete",
      isFreeze: true,
      loopCount: 1,
      isAdditive: false,
      restart: "always",
    })}
    {transformTranslate({
      initValue: { x: 0, y: 0 },
      timeline: [
        { toAbs: { x: 2000, y: 0 }, durationSeconds: 0.0001 },
        { toAbs: { x: 2000, y: 0 }, durationSeconds: 99.9999 },
      ],
      begin: "mouseout+1s",
      calcMode: "discrete",
      isFreeze: true,
      loopCount: 1,
      isAdditive: false,
      restart: "always",
    })}
  </>
)

/**
 * 放大层 scale 动画 + 主 opacity 动画
 * scale: mouseover 1→zoomScale / mouseout zoomScale→1
 * opacity: mouseover 0→1 / mouseout+D 1→0
 */
export const buildZoomScaleOpacity = (
  zoomScale: number,
  duration: number,
  keySplines: string,
): ReactNode => (
  <>
    {transformScaleRaw({
      initValue: 1,
      timeline: [
        { toAbs: zoomScale, durationSeconds: duration, keySplines },
        { toAbs: zoomScale, durationSeconds: 200 - duration, keySplines: HOLD_SPLINES },
      ],
      begin: "mouseover",
      isFreeze: true,
      loopCount: 1,
      isAdditive: false,
      restart: "always",
    })}
    {transformScaleRaw({
      initValue: zoomScale,
      timeline: [
        { toAbs: 1, durationSeconds: duration, keySplines },
        { toAbs: 1, durationSeconds: 200 - duration, keySplines: HOLD_SPLINES },
      ],
      begin: "mouseout",
      isFreeze: true,
      loopCount: 1,
      isAdditive: false,
      restart: "always",
    })}
    {animateOpacity({
      initValue: 0,
      timeline: [
        { toAbs: 1, durationSeconds: 0.005 },
        { toAbs: 1, durationSeconds: 0.995 },
      ],
      begin: "mouseover",
      isFreeze: true,
      loopCount: 1,
      restart: "always",
    })}
    {animateOpacity({
      initValue: 1,
      timeline: [
        { toAbs: 0, durationSeconds: 0.005 },
        { toAbs: 0, durationSeconds: 0.995 },
      ],
      begin: "mouseout+1s",
      isFreeze: true,
      loopCount: 1,
      restart: "always",
    })}
  </>
)

/**
 * 详情层独立 opacity 动画
 * mouseover 0→1 / mouseout 1→0（无延迟，跟参考一致）
 */
export const buildDetailOpacity = (duration: number): ReactNode => (
  <>
    {animateOpacity({
      initValue: 0,
      timeline: [
        { toAbs: 1, durationSeconds: 0.005 },
        { toAbs: 1, durationSeconds: 99.995 },
      ],
      begin: "mouseover",
      isFreeze: true,
      loopCount: 1,
      restart: "always",
    })}
    {animateOpacity({
      initValue: 1,
      timeline: [
        { toAbs: 0, durationSeconds: 0.005 },
        { toAbs: 0, durationSeconds: 99.995 },
      ],
      begin: "mouseout",
      isFreeze: true,
      loopCount: 1,
      restart: "always",
    })}
  </>
)

/**
 * 点击区 visibility 控制（放在 click-wrapper g 内）
 * visibility: mouseover+D hidden（放大完成后，触发 mouseout）/ mouseout+D visible（缩小完成后恢复）
 */
export const buildClickVisibility = (duration: number): ReactNode => (
  <>
    {setVisibility({ to: "hidden", begin: "mouseover+1s", isFreeze: true, native: { from: "visible", dur: "0.01s", restart: "always" as never } })}
    {setVisibility({ to: "visible", begin: "mouseout+1s", isFreeze: true, native: { from: "hidden", dur: "0.01s", restart: "always" as never } })}
  </>
)

/**
 * counter-translate 动画（必须放在 counter g 内，不是 click-wrapper g！）
 * counter: mouseover -2000→0 / mouseout+D 0→-2000
 */
export const buildCounterTranslate = (duration: number): ReactNode => (
  <>
    {transformTranslate({
      initValue: { x: -2000, y: 0 },
      timeline: [
        { toAbs: { x: 0, y: 0 }, durationSeconds: 0.0001 },
        { toAbs: { x: 0, y: 0 }, durationSeconds: 99.9999 },
      ],
      begin: "mouseover",
      calcMode: "discrete",
      isFreeze: true,
      loopCount: 1,
      isAdditive: false,
      restart: "always",
    })}
    {transformTranslate({
      initValue: { x: 0, y: 0 },
      timeline: [
        { toAbs: { x: -2000, y: 0 }, durationSeconds: 0.0001 },
        { toAbs: { x: -2000, y: 0 }, durationSeconds: 99.9999 },
      ],
      begin: "mouseout+1s",
      calcMode: "discrete",
      isFreeze: true,
      loopCount: 1,
      isAdditive: false,
      restart: "always",
    })}
  </>
)
