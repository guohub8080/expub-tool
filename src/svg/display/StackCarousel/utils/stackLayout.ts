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
  /** 深度幂次：1=线性（露边相等），>1 tail 侧压缩，<1 tail 侧拉开 */
  depthLaw: number
}

/**
 * 生成各叠层的 translate / scale / rotate 配置
 *
 * 局部空间：mainChild 在原点，tailChild 在 direction。layerIndex 从 0（最远端 tail）
 * 到 showStackNum−1（焦点 center）。
 *
 * —— depthLaw（深度幂次 k）同时驱动 scale 和位置 ——
 *   x = layerIndex / maxDepth        （0=tail, 1=center）
 *   weight = x^k
 *   scale    = tailScale + (1 − tailScale) · weight      （tail→center: tailScale→1）
 *   progress = 1 − weight                                （translate 用；0=center, 1=tail）
 *
 * - k=1：scale 与 progress 都线性，露边恰好相等（Δcenter 与 Δhalf 均恒定），
 *         任意斜向方向都成立 —— 等价于原「恒定 peek」效果
 * - k>1：tail 侧 scale 小、间距密（透视压缩感）
 * - k<1：tail 侧拉开
 *
 * 端点恒命中：center 落 mainChild.center（progress=0）、tail 落 tailChild.center（progress=1）。
 *
 * —— rotate ——
 * 缺省 0；layers[layerIndex].rotate 存在则用该角度（度）。pivot 统一 stackRotatePivot。
 * rotate 与 translate/scale 同步层间插值，与退场 rotate 独立。
 */
export const buildPosConfig = ({ showStackNum, tailScale, direction, cardW, cardH, layers, stackRotatePivot, depthLaw }: I_BuildPosConfig): I_PositionConfig => {
  const maxDepth = showStackNum - 1
  const anchorDistance = Math.hypot(direction.x, direction.y)
  const unitX = anchorDistance > 0 ? direction.x / anchorDistance : 0
  const unitY = anchorDistance > 0 ? direction.y / anchorDistance : 0

  // rotate pivot 统一用顶层 stackRotatePivot（所有层共用）
  const resolvedStackPivot = resolveLayerRotatePivot(stackRotatePivot, cardW, cardH)

  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  const rotateValues: number[] = []
  const rotatePivots: [number, number][] = []
  for (let layerIndex = 0; layerIndex < showStackNum; layerIndex++) {
    const layerConfig = layers?.[layerIndex]
    const x = layerIndex / maxDepth                    // 0=tail, 1=center
    const weight = Math.pow(x, depthLaw)               // 深度幂次权重
    const layerScale = tailScale + (1 - tailScale) * weight
    const progress = 1 - weight                        // translate 用（0=center, 1=tail）

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
