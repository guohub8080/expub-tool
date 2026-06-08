import React from 'react'

/**
 * Flip scale(-1,1)↔(1,1) spline animation for click-flip state machine
 *
 * Press (mousedown/touchstart): -1,1 → 1,1 (hold 200ms then smooth unflip)
 * Move (touchmove): -1,1 (stay flipped)
 * Release (mouseup/click): 1,1 → -1,1 (smooth flip)
 */
export function flipScaleAnims({ flipDur, pressFlipDur, keySplines }: {
  flipDur: number
  pressFlipDur: number
  keySplines: string
}) {
  const holdKeyTime = ((pressFlipDur - flipDur) / pressFlipDur).toFixed(6)
  const pressDur = `${pressFlipDur}s`
  const releaseDur = `${flipDur}s`
  const pressSplines = `${keySplines};${keySplines}`

  return (
    <>
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="-1 1;-1 1;1 1" dur={pressDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={pressSplines}
        fill="freeze" begin="mousedown" />
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="-1 1;-1 1;1 1" dur={pressDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={pressSplines}
        fill="freeze" begin="touchstart" />
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="-1 1;-1 1;-1 1" dur={pressDur}
        keyTimes={`0;${holdKeyTime};1`} keySplines={pressSplines}
        fill="freeze" begin="touchmove" />
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="1 1;-1 1" dur={releaseDur}
        keyTimes="0;1" keySplines={keySplines}
        fill="freeze" begin="mouseup" />
      <animateTransform calcMode="spline" attributeName="transform" type="scale"
        values="1 1;-1 1" dur={releaseDur}
        keyTimes="0;1" keySplines={keySplines}
        fill="freeze" begin="click" />
    </>
  )
}
