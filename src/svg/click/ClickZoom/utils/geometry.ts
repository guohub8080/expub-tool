/**
 * 几何计算：热区位置、点击区坐标、放大偏移
 */

export interface HotspotGeometry {
  /** 热区中心 X（viewBox 坐标） */
  centerX: number
  /** 热区中心 Y（viewBox 坐标） */
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
 * 从 item 的 x/y + hotspotW/H 计算所有几何值
 */
export const computeGeometry = ({
  x,
  y,
  hotspotW,
  hotspotH,
}: {
  x: number
  y: number
  hotspotW: number
  hotspotH: number
}): HotspotGeometry => {
  return {
    centerX: round4(x),
    centerY: round4(y),
    rectX: round4(x - hotspotW / 2),
    rectY: round4(y - hotspotH / 2),
    rectW: hotspotW,
    rectH: hotspotH,
  }
}
