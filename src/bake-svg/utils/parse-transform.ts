import { fromString, decomposeTSR, compose, translate, scale, rotate, toString } from 'transformation-matrix'
import type { Transform as TSMatrixTransform } from 'transformation-matrix'

/**
 * 解析 CSS transform 字符串,返回可调用的 transform 对象。
 *
 * 原版用 namespace 导入(`import * as Transform`),这里改成具名导入(ESM 风格),
 * 逻辑完全保留:fromString → decomposeTSR 拆解 → toSVGTransform 重新合成 SVG transform。
 */

/** parseTransform 的返回类型 */
export interface ParsedTransform {
  raw: string
  translate: TSMatrixTransform['translate']
  scale: TSMatrixTransform['scale']
  rotation: TSMatrixTransform['rotation']
  /** 合成为 SVG transform 字符串 */
  toSVGTransform: (opts: {
    x?: number
    y?: number
    origin?: [number, number]
  }) => string
}

export default function parseTransform(value: string | null | undefined): ParsedTransform | null {
  if (!value || value === 'none' || value === '') return null

  const matrix = fromString(value)
  const { translate: tr, scale: sc, rotation: rot } = decomposeTSR(matrix)

  return {
    raw: value,
    translate: tr,
    scale: sc,
    rotation: rot,
    toSVGTransform: ({ x = 0, y = 0, origin = [0, 0] } = {}) => {
      const cx = x + origin[0]
      const cy = y + origin[1]

      return toString(
        compose(
          translate(tr?.tx ?? 0, tr?.ty ?? 0),
          scale(sc?.sx ?? 1, sc?.sy ?? sc?.sx ?? 1, cx, cy),
          rotate(rot?.angle ?? 0, cx, cy)
        )
      )
    }
  }
}
