import React from 'react'

/**
 * 弹窗 opacity 切换
 *
 * mousedown/touchstart: → 0（隐藏）
 * mouseup/click: → 1（显示，覆盖 mousedown）
 */
export function popupOpacityAnims() {
  return (
    <>
      <set attributeName="opacity" to="0" fill="freeze" begin="mousedown" />
      <set attributeName="opacity" to="0" fill="freeze" begin="touchstart" />
      <set attributeName="opacity" to="1" fill="freeze" begin="mouseup" />
      <set attributeName="opacity" to="1" fill="freeze" begin="click" />
    </>
  )
}
