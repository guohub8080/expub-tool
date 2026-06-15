import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type { I_PositionConfig } from "../timeline/slotTimeline"

interface I_BuildPosConfig {
  /** 可见叠层数（含 center），范围 [2, 8] */
  showStackNum: number
  /** 最远端缩放（tailChild.scale） */
  tailScale: number
  /** 方向向量 d = tailChild.center − mainChild.center（局部空间，main 在原点） */
  direction: { x: number; y: number }
}

/**
 * 生成各叠层的 translate / scale 配置
 *
 * 局部空间：mainChild 在原点，tailChild 在 direction。层 i（i=0 最远端 tail，
 * i=showStackNum−1 焦点 center）由插值参数 t = 1 − i/(showStackNum−1) 决定：
 * - pos(i)   = direction × t   —— 两点间线性插值（tail t=1，center t=0）
 * - scale(i) = tailScale ^ t   —— 等比缩放（tail=tailScale，center=1）
 */
export const buildPosConfig = ({ showStackNum, tailScale, direction }: I_BuildPosConfig): I_PositionConfig => {
  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  const lastIdx = showStackNum - 1
  for (let i = 0; i < showStackNum; i++) {
    const t = 1 - i / lastIdx
    translateValues.push({ x: direction.x * t, y: direction.y * t })
    scaleValues.push(Math.pow(tailScale, t))
  }
  return { translateValues, scaleValues }
}
