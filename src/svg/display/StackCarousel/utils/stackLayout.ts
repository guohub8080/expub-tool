import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type { I_PositionConfig } from "../timeline/slotTimeline"

interface I_BuildPosConfig {
  /** 可见叠层数（含 center），范围 [2, 8] */
  stackNum: number
  /** [back, mid] 缩放；stackNum=3 时直接使用原值，其余层数以 mid 为几何公比外推 */
  scales: [number, number]
  /** 最深层（back）的偏移量（px），中间层等距填充 */
  backOffset: number
  /** 方向符号：正向 +1，反向 -1 */
  sign: number
  /** 偏移作用轴：X 横向叠层，Y 纵向叠层 */
  axis: "x" | "y"
}

/**
 * 生成各叠层的 translate / scale 配置（含末位 exit 占位）
 *
 * - stackNum=3：返回与历史实现像素级一致的 [back, mid, center, exit]
 * - stackNum≠3：等距偏移（gap = backOffset/(stackNum-1)）+ 以 mid 为公比的几何缩放
 *   - offset(i) = gap × (stackNum-1-i)，i=0 最深 → backOffset，i=stackNum-1(center) → 0
 *   - scale(i)  = midScale ^ (stackNum-1-i)，center 恒为 1
 */
export const buildPosConfig = ({ stackNum, scales, backOffset, sign, axis }: I_BuildPosConfig): I_PositionConfig => {
  const makeTranslate = (offset: number): Partial<I_TranslateValue> =>
    axis === "x" ? { x: sign * offset, y: 0 } : { x: 0, y: -sign * offset }

  // stackNum=3：与历史实现像素级一致
  if (stackNum === 3) {
    const midOffset = backOffset / 2
    return {
      translateValues: [
        makeTranslate(backOffset),
        makeTranslate(midOffset),
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      scaleValues: [scales[0], scales[1], 1, 1],
    }
  }

  // stackNum≠3：等距偏移 + 以 mid 为公比的几何缩放
  const gap = backOffset / (stackNum - 1)
  const midScale = scales[1]
  const translateValues: Partial<I_TranslateValue>[] = []
  const scaleValues: number[] = []
  for (let i = 0; i < stackNum; i++) {
    const depth = stackNum - 1 - i
    translateValues.push(makeTranslate(gap * depth))
    scaleValues.push(Math.pow(midScale, depth))
  }
  translateValues.push({ x: 0, y: 0 })
  scaleValues.push(1)
  return { translateValues, scaleValues }
}
