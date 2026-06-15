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
  /** 深度分布：0=完全线性；[-100,0] 堆积 tail（center 除外），[0,+100] 堆积 center（tail 除外） */
  depthLaw: number
}

/**
 * 生成各叠层的 translate / scale / rotate 配置
 *
 * 局部空间：mainChild 在原点，tailChild 在 direction。layerIndex 从 0（最远端 tail）
 * 到 showStackNum−1（焦点 center）。
 *
 * —— depthLaw（线性混合控制，范围 [-100, +100]）——
 *   blend = |depthLaw| / 100            （0=线性，1=极端堆积）
 *   对每层 x = layerIndex / maxDepth（0=tail, 1=center）：
 *     linearProgress = 1 − x             （线性分布，0=center, 1=tail）
 *     extreme = depthLaw<0 ? (x<1?1:0) : (x>0?0:1)
 *               // 向 tail 堆积：center(x=1) 留 0，其余 1
 *               // 向 center 堆积：tail(x=0) 留 1，其余 0
 *     progress = (1−blend)·linearProgress + blend·extreme
 *     scale    = 1 − (1−tailScale)·progress    （scale 跟随位置：堆积 tail→小，center→大）
 *
 * - depthLaw=0：线性，各层均匀分布
 * - depthLaw=−100：除 center 外全堆 tail（一堆小卡 + 一个大 center）
 * - depthLaw=+100：除 tail 外全堆 center（一个小 tail + 一堆大卡）
 * - 中间值线性混合，调一点偏一点（无幂次敏感问题）
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

  // depthLaw 钳制到 [-100, +100]；blend=0 线性，blend=1 极端堆积
  const clampedDepth = Math.max(-100, Math.min(100, depthLaw))
  const blend = Math.abs(clampedDepth) / 100
  const clusterTowardTail = clampedDepth < 0

  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  const rotateValues: number[] = []
  const rotatePivots: [number, number][] = []
  for (let layerIndex = 0; layerIndex < showStackNum; layerIndex++) {
    const layerConfig = layers?.[layerIndex]
    const x = layerIndex / maxDepth                    // 0=tail, 1=center
    const linearProgress = 1 - x                       // 线性分布（0=center, 1=tail）

    // 极端分布：向 tail 堆积时 center(x=1) 留 0；向 center 堆积时 tail(x=0) 留 1
    const extremeProgress = clusterTowardTail
      ? (x < 1 ? 1 : 0)
      : (x > 0 ? 0 : 1)

    const progress = (1 - blend) * linearProgress + blend * extremeProgress
    const layerScale = 1 - (1 - tailScale) * progress  // scale 跟随位置

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
