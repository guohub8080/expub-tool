import has from "lodash/has"
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
  /** 卡牌基准宽（scale=1），用于算投影半宽 */
  cardW: number
  /** 卡牌基准高 */
  cardH: number
  /** 逐层覆盖配置（showStackConfig）；[0]=tail，[n−1]=center。不传则全程走自动公式 */
  layers?: I_StackLayerConfig[]
}

/**
 * 生成各叠层的 translate / scale / rotate 配置
 *
 * 局部空间：mainChild 在原点，tailChild 在 direction。layerIndex 从 0（最远端 tail）
 * 到 showStackNum−1（焦点 center）。
 *
 * —— scale ——
 * 自动公式（等比缩放，tail=tailScale，center=1）：
 *   depthFromCenter = maxDepth − layerIndex，depthRatio = depthFromCenter / maxDepth
 *   layerScale = tailScale ^ depthRatio
 * 若 layers[layerIndex].scale 存在 → 用该值覆盖（两端仍应为 tailScale / 1，由用户负责）
 *
 * —— position（progress，沿方向轴归一化进度）——
 * - 0 = mainChild（center 端），1 = tailChild（tail 端）
 * - 端点恒命中：center(=0) 落 mainChild.center、tail(=1) 落 tailChild.center
 * - 中间层 progress 缺省 → 走「恒定 peek」反推（每张露边相等）：
 *     projectedHalfExtent = (cardW·|unitX| + cardH·|unitY|)/2
 *     peek = [anchorDistance − projectedHalfExtent·(1−tailScale)] / maxDepth
 *     offsetFromCenter = depthFromCenter·peek + projectedHalfExtent·(1−layerScale)
 *   即把 scale 造成的露边缩进纳入 offset，露边自然恒定
 * - 中间层 progress 存在 → 直接 progress·direction 定位中心，露边不再恒定
 *
 * —— rotate ——
 * - 缺省 0（不旋转）；layers[layerIndex].rotate 存在则用该角度（度）
 * - pivot 缺省 "Center"（child 几何中心 cardW/2,cardH/2）；rotatePivot 存在则用之
 * - rotate 与 translate/scale 同步层间插值（由 buildSlotTimelines 处理），与退场 rotate 独立
 *
 * tail 太近时 peek 可能为负，卡牌会糊一块，属用户配置，不 clamp 以保锚点精确。
 */
export const buildPosConfig = ({ showStackNum, tailScale, direction, cardW, cardH, layers }: I_BuildPosConfig): I_PositionConfig => {
  const maxDepth = showStackNum - 1
  const anchorDistance = Math.hypot(direction.x, direction.y)
  const unitX = anchorDistance > 0 ? direction.x / anchorDistance : 0
  const unitY = anchorDistance > 0 ? direction.y / anchorDistance : 0
  const projectedHalfExtent = (cardW * Math.abs(unitX) + cardH * Math.abs(unitY)) / 2
  const peek = (anchorDistance - projectedHalfExtent * (1 - tailScale)) / maxDepth

  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  const rotateValues: number[] = []
  const rotatePivots: [number, number][] = []
  for (let layerIndex = 0; layerIndex < showStackNum; layerIndex++) {
    const layerConfig = layers?.[layerIndex]
    const depthFromCenter = maxDepth - layerIndex
    const depthRatio = depthFromCenter / maxDepth
    // scale：有 override 用 override，否则幂律
    const layerScale = has(layerConfig, "scale") ? (layerConfig!.scale as number) : Math.pow(tailScale, depthRatio)

    // position：progress 恒定式 0(center)→1(tail)，与 layerIndex 反向
    // 有 override 直接用；端点(=center:0 / tail:1)用常量；中间缺省走恒定 peek 反推
    let progress: number
    if (has(layerConfig, "progress")) {
      progress = layerConfig!.progress as number
    } else if (layerIndex === showStackNum - 1) {
      progress = 0  // center 端：精确落 mainChild（原点）
    } else if (layerIndex === 0) {
      progress = 1  // tail 端：精确落 tailChild
    } else {
      // 中间层恒定 peek：offsetFromCenter 为沿方向轴远离 center 的距离
      const offsetFromCenter = depthFromCenter * peek + projectedHalfExtent * (1 - layerScale)
      // progress = offset / anchorDistance（局部空间，main 在原点，tail 在 anchorDistance）
      progress = anchorDistance > 0 ? offsetFromCenter / anchorDistance : 0
    }

    translateValues.push({ x: unitX * anchorDistance * progress, y: unitY * anchorDistance * progress })
    scaleValues.push(layerScale)

    // rotate：缺省 0；center 层（末项）恒 0——center 位旋转走 per-item stayRotate，不用层值
    const isCenterLayer = layerIndex === showStackNum - 1
    rotateValues.push(isCenterLayer ? 0 : defaultTo(layerConfig?.rotate, 0))
    const pivot: T_Pivot = defaultTo(layerConfig?.rotatePivot, "Center")
    rotatePivots.push(resolveLayerRotatePivot(pivot, cardW, cardH))
  }
  return { translateValues, scaleValues, rotateValues, rotatePivots }
}

/**
 * 层 rotate 中心 → card 局部坐标 [x, y]
 *
 * 复用 rotationPivot 的语义（child 局部坐标，跟着 card 一起被父级 scale 缩放，
 * 相对位置不变）。供 buildPosConfig 内部调用，避免 layer 配置都缺省时也走 lodash。
 */
const resolveLayerRotatePivot = (pivot: T_Pivot, cardW: number, cardH: number): [number, number] => {
  // 直接走 resolveRotationPivot（九宫格 + {x,y} 两种形式都支持）
  return resolveRotationPivot({ pivot, cardWidth: cardW, cardHeight: cardH })
}
