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
 * 局部空间：mainChild 在原点，tailChild 在 direction。层 i（i=0 最远端 tail，
 * i=showStackNum−1 焦点 center），记 j = showStackNum−1−i 为距 center 的层数，
 * t = j/(showStackNum−1)：
 * - scale(i) = tailScale ^ t   —— 等比缩放（tail=tailScale，center=1）
 *
 * 间距分布（沿方向轴的投影半宽 projHalf = (cardW·|ux| + cardH·|uy|)/2，D=|direction|）：
 * - linear：dist = D·t（等距中心）→ peek 不均，内层易被 center 盖住（甚至负 peek）
 * - even：恒定 peek P = [D − projHalf·(1−tailScale)]/(n−1)，
 *   dist = j·P + projHalf·(1−scale)，两端锚点严格命中、各层 peek 恒为 P
 *   （tail 太近时 P 可能为负，卡牌会糊一块，属用户配置，不 clamp 以保锚点精确）
 */
export const buildPosConfig = ({ showStackNum, tailScale, direction, cardW, cardH, spacing }: I_BuildPosConfig): I_PositionConfig => {
  const lastIdx = showStackNum - 1
  const D = Math.hypot(direction.x, direction.y)
  const ux = D > 0 ? direction.x / D : 0
  const uy = D > 0 ? direction.y / D : 0
  const projHalf = (cardW * Math.abs(ux) + cardH * Math.abs(uy)) / 2
  const peek = (D - projHalf * (1 - tailScale)) / lastIdx

  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  for (let i = 0; i < showStackNum; i++) {
    const j = lastIdx - i
    const t = j / lastIdx
    const scale = Math.pow(tailScale, t)
    const dist = spacing === 'even' ? j * peek + projHalf * (1 - scale) : D * t
    translateValues.push({ x: ux * dist, y: uy * dist })
    scaleValues.push(scale)
  }
  return { translateValues, scaleValues }
}
