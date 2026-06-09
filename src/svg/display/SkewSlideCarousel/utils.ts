import max from 'lodash/max'
import min from 'lodash/min'
import floor from 'lodash/floor'
import round from 'lodash/round'

/** 默认缓动曲线 */
export const DEFAULT_EASE = "0.42 0 0.58 1"
/** 默认斜切角度 */
export const DEFAULT_SKEW_ANGLE = 15
/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 2
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 2

/**
 * 限制 skew 角度在有效范围内。
 * 上限 = atan(宽高比) 度，防止 skew 超过 90° 的几何约束。
 */
export const clampSkewAngle = (rawAngle: number, contentW: number, contentH: number, axis: 'X' | 'Y'): number => {
  const ratio = axis === 'X' ? contentW / contentH : contentH / contentW
  const maxAngle = max([1, floor(Math.atan(ratio) * 180 / Math.PI)])!
  return min([max([rawAngle, 1]), maxAngle])!
}

/**
 * 计算交叉轴补偿量（skew 导致的位移偏移）。
 * X 轴模式：Y 方向补偿 = contentH/2 × tan(angle)
 * Y 轴模式：X 方向补偿 = contentW/2 × tan(angle)
 */
export const getCrossCompensation = (axis: 'X' | 'Y', contentW: number, contentH: number, skewAngleDeg: number): number => {
  if (axis === 'X') {
    return round(contentH / 2 * Math.tan(skewAngleDeg * Math.PI / 180))
  }
  return round(contentW / 2 * Math.tan(skewAngleDeg * Math.PI / 180))
}
