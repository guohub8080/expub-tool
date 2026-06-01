import isPlainObject from "lodash/isPlainObject"
import isString from "lodash/isString"
import type { T_Direction4 } from "@svg/types"
import type { T_RotationOrigin } from "../types"

/**
 * 方向位移计算器
 *
 * 根据推入/推出方向和画布尺寸，计算屏幕外的 translate 坐标（"x y" 格式）。
 *
 * 坐标系以画布中心为原点：
 *   T（从上进入）→ 图片初始在下方边界外：y = +(canvasHeight+1)
 *   B（从下进入）→ 图片初始在上方边界外：y = -(canvasHeight+1)
 *   L（从左进入）→ 图片初始在右方边界外：x = +(canvasWidth+1)
 *   R（从右进入）→ 图片初始在左方边界外：x = -(canvasWidth+1)
 */
export const getOffscreenTranslate = ({
  direction,
  canvasWidth,
  canvasHeight,
}: {
  /** 推入/推出方向 */
  direction: T_Direction4
  /** 画布宽度 */
  canvasWidth: number
  /** 画布高度 */
  canvasHeight: number
}): string => {
  switch (direction) {
    case 'T': return `0 ${canvasHeight + 1}`
    case 'B': return `0 ${-(canvasHeight + 1)}`
    case 'L': return `${canvasWidth + 1} 0`
    case 'R': return `${-(canvasWidth + 1)} 0`
  }
}

/**
 * 根据九宫格位置返回旋转中心的坐标（"cx cy" 格式）。
 *
 * 坐标系以画布中心为原点，contentWidth/contentHeight 为内容区域尺寸：
 *
 *   TopLeft=(-w/2, -h/2)  Top=(0, -h/2)      TopRight=(w/2, -h/2)
 *   Left=(-w/2, 0)         Center=(0, 0)       Right=(w/2, 0)
 *   BottomLeft=(-w/2, h/2) Bottom=(0, h/2)     BottomRight=(w/2, h/2)
 */
export const getRotationOrigin = ({
  origin,
  contentWidth,
  contentHeight,
}: {
  /** 九宫格位置或自定义坐标 */
  origin: T_RotationOrigin
  /** 内容区域宽度 */
  contentWidth: number
  /** 内容区域高度 */
  contentHeight: number
}): string => {
  // 自定义坐标直接返回
  if (isPlainObject(origin)) {
    const { cx, cy } = origin as { cx: number; cy: number }
    return `${cx} ${cy}`
  }

  // 九宫格预设（origin 此时一定是 string）
  const hw = contentWidth / 2
  const hh = contentHeight / 2
  const grid: Record<string, string> = {
    TopLeft: `${-hw} ${-hh}`,    Top: `0 ${-hh}`,      TopRight: `${hw} ${-hh}`,
    Left: `${-hw} 0`,            Center: `0 0`,         Right: `${hw} 0`,
    BottomLeft: `${-hw} ${hh}`,  Bottom: `0 ${hh}`,     BottomRight: `${hw} ${hh}`,
  }
  return grid[origin as string]
}
