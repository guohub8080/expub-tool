import React from 'react'

/**
 * 弹窗 scale 弹跳动画
 *
 * mousedown: 0 → 1.05 → 0（弹起回落 — 关闭方向，被 mouseup 覆盖）
 * mouseup:   0 → 1.05 → 1（弹起落稳 — 打开方向，最终生效）
 * touchmove: 0 → 1.05 → 0（保持关闭 — 取消）
 *
 * 两次点击之间的"弹跳"效果来自 mouseup 覆盖 mousedown 的瞬间：
 * 弹窗先被 mousedown 强制归零（瞬收），再由 mouseup 弹出并过冲到 1.05 再落稳到 1。
 */
export function popupBounceAnims({ bounceDur, holdRatio }: {
  bounceDur: number
  holdRatio: number
}) {
  const holdKeyTime = holdRatio.toFixed(6)
  const mousedownDur = `${bounceDur + 0.2}s`
  const mouseupDur = `${bounceDur}s`
  const splines = '0.42 0 0.58 1'
  const doubleSplines = `${splines};${splines}`

  return (
    <>
      {/* mousedown: 弹起→回落（被 mouseup 覆盖，但初始点击提供"收回"视觉） */}
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values={`0; 1.05; 0`} dur={mousedownDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={doubleSplines}
        fill="freeze" begin="mousedown" />
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values={`0; 1.05; 0`} dur={mousedownDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={doubleSplines}
        fill="freeze" begin="touchstart" />
      {/* touchmove: 保持关闭 */}
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="0; 0; 0" dur={mousedownDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={doubleSplines}
        fill="freeze" begin="touchmove" />
      {/* mouseup: 弹起→落稳（最终生效） */}
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="0; 1.05; 1" dur={mouseupDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={doubleSplines}
        fill="freeze" begin="mouseup" />
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="0; 1.05; 1" dur={mouseupDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={doubleSplines}
        fill="freeze" begin="click" />
    </>
  )
}
