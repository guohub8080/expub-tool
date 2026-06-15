import defaultTo from "lodash/defaultTo"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type { T_Pivot } from "@svg/types"
import type { I_StackLayerConfig } from "../types"
import type { I_PositionConfig } from "../timeline/slotTimeline"
import { resolveRotationPivot } from "./rotationPivot"

interface I_BuildPosConfig {
  /** 可见叠层数（含 center），范围 [2, 8] */
  showStackNum: number
  /** 最远端缩放（tailChild.scale） */
  tailScale: number
  /** 方向向量 d = tailChild.center − mainChild.center（局部空间，main 在原点） */
  direction: { x: number; y: number }
  /** 卡牌基准宽（scale=1） */
  cardW: number
  /** 卡牌基准高 */
  cardH: number
  /** 逐层旋转覆盖（showStackConfig）；[0]=tail，[n−1]=center */
  layers?: I_StackLayerConfig[]
  /** 栈中所有层 rotate 共用的旋转中心（child 局部） */
  stackRotatePivot: T_Pivot
  /** 深度分布：0=线性均等；[0,+100] 向 center 聚拢（+100 除 tail 外全贴 center）；
   *  [-100,0] 向 tail 聚拢（-100 除 center 外全贴 tail）。幂次过渡，小值平滑 */
  depthLaw: number
}

/**
 * 生成各叠层的 translate / scale / rotate 配置
 *
 * 局部空间：mainChild 在原点，tailChild 在 direction。layerIndex 从 0（最远端 tail）
 * 到 showStackNum−1（焦点 center）。
 *
 * —— depthLaw（有界 [-100, +100]，幂次过渡）——
 *   p = 1 / (1 − |d|/100)        （d=0→p=1 线性；d→±100→p→∞ 极端，钳制 1000）
 *   x = layerIndex / maxDepth    （0=tail, 1=center）
 *   d ≥ 0（向 center 聚）: progress = (1−x)^p
 *   d < 0（向 tail 聚）:  progress = 1 − x^p
 *   scale = 1 − (1−tailScale)·progress    （scale 跟随位置）
 *
 * - 0：线性均等（gap 近似相等）
 * - +100：除 tail 外全贴 center
 * - -100：除 center 外全贴 tail
 * - 小值（±10）：p≈1，几乎线性、无突兀孤立；大值趋极端
 *
 * 端点恒命中：center 落 mainChild.center（progress=0）、tail 落 tailChild.center（progress=1）。
 *
 * —— rotate ——
 * 缺省 0；layers[layerIndex].rotate 存在则用该角度（度）。pivot 统一 stackRotatePivot。
 */
export const buildPosConfig = ({ showStackNum, tailScale, direction, cardW, cardH, layers, stackRotatePivot, depthLaw }: I_BuildPosConfig): I_PositionConfig => {
  const maxDepth = showStackNum - 1
  const anchorDistance = Math.hypot(direction.x, direction.y)
  const unitX = anchorDistance > 0 ? direction.x / anchorDistance : 0
  const unitY = anchorDistance > 0 ? direction.y / anchorDistance : 0

  const resolvedStackPivot = resolveLayerRotatePivot(stackRotatePivot, cardW, cardH)

  // depthLaw 钳制 [-100, +100]；p=1/(1-|d|/100)，d=0→1，|d|→100→∞（钳 1000）
  const clampedDepth = Math.max(-100, Math.min(100, depthLaw))
  const absDepth = Math.abs(clampedDepth)
  const power = absDepth >= 100 ? 1000 : 1 / (1 - absDepth / 100)
  const towardCenter = clampedDepth >= 0

  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  const rotateValues: number[] = []
  const rotatePivots: [number, number][] = []
  for (let layerIndex = 0; layerIndex < showStackNum; layerIndex++) {
    const layerConfig = layers?.[layerIndex]
    const x = layerIndex / maxDepth                    // 0=tail, 1=center
    // progress: 0=center 位, 1=tail 位。d≥0 向 center 聚（progress→0），d<0 向 tail 聚（→1）
    const progress = towardCenter
      ? Math.pow(1 - x, power)
      : 1 - Math.pow(x, power)
    const layerScale = 1 - (1 - tailScale) * progress

    translateValues.push({ x: unitX * anchorDistance * progress, y: unitY * anchorDistance * progress })
    scaleValues.push(layerScale)

    rotateValues.push(defaultTo(layerConfig?.rotate, 0))
    rotatePivots.push(resolvedStackPivot)
  }
  return { translateValues, scaleValues, rotateValues, rotatePivots }
}

/**
 * 层 rotate 中心 → card 局部坐标 [x, y]
 *
 * 复用 rotationPivot 的语义（child 局部坐标，跟着 card 一起被父级 scale 缩放，
 * 相对位置不变）。
 */
const resolveLayerRotatePivot = (pivot: T_Pivot, cardW: number, cardH: number): [number, number] => {
  return resolveRotationPivot({ pivot, cardWidth: cardW, cardHeight: cardH })
}
