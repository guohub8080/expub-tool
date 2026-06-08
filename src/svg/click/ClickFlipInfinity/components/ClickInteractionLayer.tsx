import React from 'react'
import defaultTo from 'lodash/defaultTo'
import {
  clickResetTranslateAnims,
  hiddenResetTranslateAnims,
} from '../smil'
import type { T_HotArea } from '@svg/types'

/**
 * 点击交互层
 *
 * 通过 translate ±10000 管理点击目标的可见性：
 * - 主点击区域：正面可见时可点击（frontHotArea）
 * - 隐藏重置触发器：反面可见时可点击（backHotArea，需镜像 x）
 */
export function ClickInteractionLayer({ W, H, discreteDur, pressFlipDur, frontHotArea, backHotArea }: {
  W: number
  H: number
  discreteDur: number
  pressFlipDur: number
  frontHotArea?: T_HotArea
  backHotArea?: T_HotArea
}) {
  // 正面热区：直接使用
  const fX = defaultTo(frontHotArea?.x, 0)
  const fY = defaultTo(frontHotArea?.y, 0)
  const fW = defaultTo(frontHotArea?.w, W)
  const fH = defaultTo(frontHotArea?.h, H)

  // 反面热区：翻转后 X 轴镜像，所以 rect 的 x = W - hotArea.x - hotArea.w
  const bX = W - defaultTo(backHotArea?.x, 0) - defaultTo(backHotArea?.w, W)
  const bY = defaultTo(backHotArea?.y, 0)
  const bW = defaultTo(backHotArea?.w, W)
  const bH = defaultTo(backHotArea?.h, H)

  return (
    <g>
      {clickResetTranslateAnims({ discreteDur })}

      {/* 主点击区域（正面） */}
      <rect x={fX} y={fY} width={fW} height={fH} fill="#39f" opacity={0} style={{ pointerEvents: 'visible' }}>
        <animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="mouseup" />
        <animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="click" />
      </rect>

      {/* 隐藏的重置触发器（反面） */}
      <g transform="translate(10000 0)">
        <g>
          {hiddenResetTranslateAnims({ pressFlipDur })}
          <rect x={bX} y={bY} width={bW} height={bH} fill="#000" opacity={0} style={{ pointerEvents: 'visible' }} />
        </g>
      </g>
    </g>
  )
}
