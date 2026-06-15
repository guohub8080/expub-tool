import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type { I_PositionConfig } from "../timeline/slotTimeline"
import type { T_StackSpacing } from "../types"

interface I_BuildPosConfig {
  /** 可见叠层数（含 center），范围 [2, 8] */
  showStackNum: number
  /** 最远端缩放（tailChild.scale） */
  tailScale: number
  /** 方向向量 d = tailChild.center − mainChild.center（局部空间，main 在原点） */
  direction: { x: number; y: number }
  /** 卡牌基准宽（scale=1），用于 even 模式算投影半宽 */
  cardW: number
  /** 卡牌基准高 */
  cardH: number
  /** 间距分布：linear 等距中心 | even 恒定 peek（每张露出等宽边） */
  spacing: T_StackSpacing
}

/**
 * 生成各叠层的 translate / scale 配置
 *
 * 局部空间：mainChild 在原点，tailChild 在 direction。layerIndex 从 0（最远端 tail）
 * 到 showStackNum−1（焦点 center）；depthFromCenter = maxDepth − layerIndex 为距 center
 * 的层数，depthRatio = depthFromCenter / maxDepth：
 * - layerScale = tailScale ^ depthRatio   —— 等比缩放（tail=tailScale，center=1）
 *
 * 间距分布（沿方向轴投影半宽 projectedHalfExtent = (cardW·|unitX| + cardH·|unitY|)/2，
 * anchorDistance = |direction|）：
 * - linear：offsetFromCenter = anchorDistance · depthRatio（等距中心）→ peek 不均，
 *   内层易被 center 盖住（甚至负 peek）
 * - even：恒定 peek = [anchorDistance − projectedHalfExtent·(1−tailScale)]/maxDepth，
 *   offsetFromCenter = depthFromCenter·peek + projectedHalfExtent·(1−layerScale)，
 *   两端锚点严格命中、各层 peek 恒定
 *   （tail 太近时 peek 可能为负，卡牌会糊一块，属用户配置，不 clamp 以保锚点精确）
 */
export const buildPosConfig = ({ showStackNum, tailScale, direction, cardW, cardH, spacing }: I_BuildPosConfig): I_PositionConfig => {
  const maxDepth = showStackNum - 1
  const anchorDistance = Math.hypot(direction.x, direction.y)
  const unitX = anchorDistance > 0 ? direction.x / anchorDistance : 0
  const unitY = anchorDistance > 0 ? direction.y / anchorDistance : 0
  const projectedHalfExtent = (cardW * Math.abs(unitX) + cardH * Math.abs(unitY)) / 2
  const peek = (anchorDistance - projectedHalfExtent * (1 - tailScale)) / maxDepth

  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  for (let layerIndex = 0; layerIndex < showStackNum; layerIndex++) {
    const depthFromCenter = maxDepth - layerIndex
    const depthRatio = depthFromCenter / maxDepth
    const layerScale = Math.pow(tailScale, depthRatio)
    const offsetFromCenter = spacing === 'even'
      ? depthFromCenter * peek + projectedHalfExtent * (1 - layerScale)
      : anchorDistance * depthRatio
    translateValues.push({ x: unitX * offsetFromCenter, y: unitY * offsetFromCenter })
    scaleValues.push(layerScale)
  }
  return { translateValues, scaleValues }
}
