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
  /** 九宫格位置 */
  origin: T_RotationOrigin
  /** 内容区域宽度 */
  contentWidth: number
  /** 内容区域高度 */
  contentHeight: number
}): string => {
  const hw = contentWidth / 2
  const hh = contentHeight / 2

  switch (origin) {
    case 'TopLeft':     return `${-hw} ${-hh}`
    case 'Top':         return `0 ${-hh}`
    case 'TopRight':    return `${hw} ${-hh}`
    case 'Left':        return `${-hw} 0`
    case 'Center':      return `0 0`
    case 'Right':       return `${hw} 0`
    case 'BottomLeft':  return `${-hw} ${hh}`
    case 'Bottom':      return `0 ${hh}`
    case 'BottomRight': return `${hw} ${hh}`
  }
}
