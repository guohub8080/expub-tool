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
 * scale in: mouseover 1→zoomScale（inDuration + inKeySplines）
 * scale out: mouseout zoomScale→1（outDuration + outKeySplines）
 * opacity: mouseover 0→1 / mouseout+1s 1→0
 * zoomScale = 1 时跳过 scale 动画，只保留 opacity（原地淡入淡出）
 */
export const buildZoomScaleOpacity = (
  zoomScale: number,
  inDuration: number,
  outDuration: number,
  inKeySplines: string,
  outKeySplines: string,
): ReactNode => (
  <>
    {zoomScale === 1 ? null : (
      <>
        {transformScaleRaw({
          initValue: 1,
          timeline: [
            { toAbs: zoomScale, durationSeconds: inDuration, keySplines: inKeySplines },
            { toAbs: zoomScale, durationSeconds: 200 - inDuration, keySplines: HOLD_SPLINES },
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
            { toAbs: 1, durationSeconds: outDuration, keySplines: outKeySplines },
            { toAbs: 1, durationSeconds: 200 - outDuration, keySplines: HOLD_SPLINES },
          ],
          begin: "mouseout",
          isFreeze: true,
          loopCount: 1,
          isAdditive: false,
          restart: "always",
        })}
      </>
    )}
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
export const buildDetailOpacity = (): ReactNode => (
  <>
    {animateOpacity({
      initValue: 0,
      timeline: [
        { toAbs: 1, durationSeconds: 0.5 },
        { toAbs: 1, durationSeconds: 99.5 },
      ],
      begin: "mouseover",
      isFreeze: true,
      loopCount: 1,
      restart: "always",
    })}
    {animateOpacity({
      initValue: 1,
      timeline: [
        { toAbs: 0, durationSeconds: 0.5 },
        { toAbs: 0, durationSeconds: 99.5 },
      ],
      begin: "mouseout",
      isFreeze: true,
      loopCount: 1,
      restart: "always",
    })}
  </>
)

/**
 * rect 飞出/飞回动画（替代 visibility=hidden）
 *
 * mouseover+1s → rect 推到画外（+2000）→ 用户点画布任意处都是「rect 外」→ mouseout → 关闭
 * mouseout+1s → rect 飞回原位（0）→ 恢复可点
 */
export const buildRectFlyOut = (): ReactNode => (
  <>
    {transformTranslate({
      initValue: { x: 0, y: 0 },
      timeline: [
        { toAbs: { x: 2000, y: 0 }, durationSeconds: 0.0001 },
        { toAbs: { x: 2000, y: 0 }, durationSeconds: 99.9999 },
      ],
      begin: "mouseover+1s",
      calcMode: "discrete",
      isFreeze: true,
      loopCount: 1,
      isAdditive: false,
      restart: "always",
    })}
    {transformTranslate({
      initValue: { x: 2000, y: 0 },
      timeline: [
        { toAbs: { x: 0, y: 0 }, durationSeconds: 0.0001 },
        { toAbs: { x: 0, y: 0 }, durationSeconds: 99.9999 },
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
