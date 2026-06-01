import type { T_Direction4 } from "@svg/types"

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
