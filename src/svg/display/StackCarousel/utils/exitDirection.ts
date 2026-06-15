import { DIRECTION_8 } from "@svg/types"
import type { T_Direction8 } from "@svg/types"

/** 顺时针从 0°(右) 起，每 45° 一个方向，对应 atan2(-y, x) 的取值 */
const ORDERED_DIRECTIONS: T_Direction8[] = [
  DIRECTION_8.Right,
  DIRECTION_8.TopRight,
  DIRECTION_8.Top,
  DIRECTION_8.TopLeft,
  DIRECTION_8.Left,
  DIRECTION_8.BottomLeft,
  DIRECTION_8.Bottom,
  DIRECTION_8.BottomRight,
]

/**
 * 把向量吸附到最近的八方向之一
 *
 * 用于从「叠层方向」自动推默认退场方向：卡片从 center 朝「远离 tail」方向飞出。
 * SVG y 轴朝下，约定 0° = 向右，逆时针为正（与 atan2(-y, x) 一致）。
 */
export const directionFromVector = (vx: number, vy: number): T_Direction8 => {
  const angleDeg = Math.atan2(-vy, vx) * 180 / Math.PI
  const normalized = (angleDeg + 360) % 360
  const idx = Math.round(normalized / 45) % 8
  return ORDERED_DIRECTIONS[idx]
}
