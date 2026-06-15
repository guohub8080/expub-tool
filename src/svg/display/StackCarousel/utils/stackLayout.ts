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
  /** 深度分布（等差间距）：0=均等；正数 gap 从 tail→center 递增（tail 密集），负数递减（tail 拉开）。
   *  数值 ≈「每步 gap 相对均等值的递增百分比」（10 ≈ 每步 +10%）。负向受 gap 非负限制 */
  depthLaw: number
}

/**
 * 生成各叠层的 translate / scale / rotate 配置
 *
 * 局部空间：mainChild 在原点，tailChild 在 direction。layerIndex 从 0（最远端 tail）
 * 到 showStackNum−1（焦点 center）。
 *
 * —— depthLaw（等差间距控制）——
 * 相邻层间距成等差数列：gap[i] = base·(1 + i·r)，r = depthLaw/100，i = 0..gapCount−1。
 *   base = anchorDistance / Σ(1 + i·r)   （由 sum(gap)=anchorDistance 反推）
 *   - 0：公差 0，各 gap 均等
 *   - >0：gap 递增，tail 侧密集、center 侧拉开
 *   - <0：gap 递减，tail 侧拉开、center 侧密集
 *   r 钳制使所有 gap 非负（负向上限约 −100/(层数−2)）。
 *
 * 每层 progress 由 tail 端累加 gap 得到（0=center, 1=tail），scale 跟随位置：
 *   scale = 1 − (1−tailScale)·progress
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

  // 等差间距：gap[i] = base·(1 + i·r)，r 钳制使 gap 非负
  const gapCount = maxDepth
  const r = depthLaw / 100
  const minR = gapCount > 1 ? -1 / (gapCount - 1) + 0.001 : -1
  const clampedR = Math.max(minR, r)
  const sumFactor = gapCount + clampedR * gapCount * (gapCount - 1) / 2
  const base = anchorDistance / sumFactor

  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  const rotateValues: number[] = []
  const rotatePivots: [number, number][] = []
  let cumulativeGap = 0  // 从 tail 端累加的间距
  for (let layerIndex = 0; layerIndex < showStackNum; layerIndex++) {
    const layerConfig = layers?.[layerIndex]
    const progress = (anchorDistance - cumulativeGap) / anchorDistance  // 0=center, 1=tail
    const layerScale = 1 - (1 - tailScale) * progress

    translateValues.push({ x: unitX * anchorDistance * progress, y: unitY * anchorDistance * progress })
    scaleValues.push(layerScale)

    rotateValues.push(defaultTo(layerConfig?.rotate, 0))
    rotatePivots.push(resolvedStackPivot)

    // 累加到下一层的 gap
    if (layerIndex < gapCount) {
      cumulativeGap += base * (1 + layerIndex * clampedR)
    }
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
