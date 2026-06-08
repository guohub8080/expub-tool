import React from 'react'

/**
 * SVG width discrete toggle for click-flip state machine
 *
 * Press (mousedown/touchstart): 200% → 100%
 * Move (touchmove): 200% (no change)
 * Release (mouseup/click): 100% → 200%
 */
export function widthToggleAnims({ discreteDur }: { discreteDur: number }) {
  const dur = `${discreteDur}s`
  return (
    <>
      <animate calcMode="discrete" attributeName="width"
        values="200%;200%;100%;100%" dur={dur}
        keyTimes="0;0.6;0.6;1" fill="freeze" begin="mousedown" />
      <animate calcMode="discrete" attributeName="width"
        values="200%;200%;100%;100%" dur={dur}
        keyTimes="0;0.6;0.6;1" fill="freeze" begin="touchstart" />
      <animate calcMode="discrete" attributeName="width"
        values="200%;200%;200%;200%" dur={dur}
        keyTimes="0;0.6;0.6;1" fill="freeze" begin="touchmove" />
      <animate calcMode="discrete" attributeName="width"
        values="100%;100%;200%;200%" dur={dur}
        keyTimes="0;0.5;0.5;1" fill="freeze" begin="mouseup" />
      <animate calcMode="discrete" attributeName="width"
        values="100%;100%;200%;200%" dur={dur}
        keyTimes="0;0.5;0.5;1" fill="freeze" begin="click" />
    </>
  )
}
