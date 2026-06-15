import { DIRECTION_8 } from "@svg/types"
import type { T_Direction8 } from "@svg/types"

/**
 * 计算卡牌退场完全移出 viewBox 所需的最小距离
 *
 * 不纳入 exit scale（恒按 scale=1），缩放大的卡牌会多飞一点冗余——简单直觉。
 * 补偿 mainChild.center 偏离 viewBox 中心时，对角线估计不够的情况。
 *
 * 卡牌中心从 (mainCenterX, mainCenterY) 沿退场方向偏移 distance 后，需保证卡牌
 * 完全落在 viewBox 外（卡牌半宽 cardHalfW、半高 cardHalfH）：
 * - 正交方向：单轴移出即可（卡牌该轴完全越界）
 * - 对角方向：getExitTranslate 对角退场 x/y 同偏移 distance，取两轴移出距离的 max
 */
export const computeExitDistance = ({
  direction,
  mainCenterX,
  mainCenterY,
  viewBoxW,
  viewBoxH,
  cardHalfW,
  cardHalfH,
}: {
  direction: T_Direction8
  mainCenterX: number
  mainCenterY: number
  viewBoxW: number
  viewBoxH: number
  cardHalfW: number
  cardHalfH: number
}): number => {
  const toLeft = mainCenterX + cardHalfW
  const toRight = viewBoxW - mainCenterX + cardHalfW
  const toTop = mainCenterY + cardHalfH
  const toBottom = viewBoxH - mainCenterY + cardHalfH

  switch (direction) {
    case DIRECTION_8.Left:        return toLeft
    case DIRECTION_8.Right:       return toRight
    case DIRECTION_8.Top:         return toTop
    case DIRECTION_8.Bottom:      return toBottom
    case DIRECTION_8.TopLeft:     return Math.max(toLeft, toTop)
    case DIRECTION_8.TopRight:    return Math.max(toRight, toTop)
    case DIRECTION_8.BottomLeft:  return Math.max(toLeft, toBottom)
    case DIRECTION_8.BottomRight: return Math.max(toRight, toBottom)
  }
}
