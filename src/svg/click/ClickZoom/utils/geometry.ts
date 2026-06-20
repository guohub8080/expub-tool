/**
 * 几何计算：从缩略图左上角 + 尺寸推导热区中心 + rect 坐标
 */

export interface HotspotGeometry {
  /** 热区中心 X（放大原点） */
  centerX: number
  /** 热区中心 Y（放大原点） */
  centerY: number
  /** 点击 rect 左上角 X */
  rectX: number
  /** 点击 rect 左上角 Y */
  rectY: number
  /** 点击 rect 宽 */
  rectW: number
  /** 点击 rect 高 */
  rectH: number
}

const round4 = (n: number) => Math.round(n * 10000) / 10000

/**
 * 从缩略图 { x, y, w, h }（左上角 + 尺寸）推导所有几何值
 */
export const computeGeometry = ({
  x,
  y,
  w,
  h,
}: {
  x: number
  y: number
  w: number
  h: number
}): HotspotGeometry => {
  return {
    centerX: round4(x + w / 2),
    centerY: round4(y + h / 2),
    rectX: round4(x),
    rectY: round4(y),
    rectW: w,
    rectH: h,
  }
}
