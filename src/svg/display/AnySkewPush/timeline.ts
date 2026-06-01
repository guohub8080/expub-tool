import defaultTo from "lodash/defaultTo"
import type { T_Direction4 } from "../../types"
import type { I_AnySkewPushChildItem } from "./types"

export const DEFAULT_STAY = 2
export const DEFAULT_SWITCH = 2
export const DEFAULT_DIRECTION: T_Direction4 = 'T'

/** 进入方向取反，作为默认退出方向（T↔B，L↔R） */
export const oppositeDir = (dir: T_Direction4): T_Direction4 =>
  dir === 'T' ? 'B' : dir === 'B' ? 'T' : dir === 'L' ? 'R' : 'L'

/**
 * 计算第 i 张图的 SMIL begin 时间。
 *
 * 设计原则：图1的 begin = -sw，使得 t=0 时图1恰好完成进入、处于全屏静止状态。
 * 后续图的 begin 依次累加，但整体减去一个完整周期 T，
 * 确保 t=0 时所有图的动画都已经运行过一轮、处于正确位置——
 * 否则 begin > 0 的图在 t=0 时动画尚未开始，<g> 会停在原点（全屏中心）造成闪烁。
 */
export const getBegin = (i: number, items: I_AnySkewPushChildItem[], T: number): number => {
  if (i === 0) return -defaultTo(items[0].switchDuration, DEFAULT_SWITCH)
  let b = defaultTo(items[0].stayDuration, DEFAULT_STAY)
  for (let j = 1; j < i; j++)
    b += defaultTo(items[j].switchDuration, DEFAULT_SWITCH) + defaultTo(items[j].stayDuration, DEFAULT_STAY)
  return b - T
}

/**
 * 根据推入/推出方向返回屏幕外的 translate 坐标字符串（"x y" 格式）。
 *
 * 坐标系以画布中心为原点：
 *   T（从上进入）→ 图片初始在下方边界外：y = +(h+1)
 *   B（从下进入）→ 图片初始在上方边界外：y = -(h+1)
 *   L（从左进入）→ 图片初始在右方边界外：x = +(w+1)
 *   R（从右进入）→ 图片初始在左方边界外：x = -(w+1)
 */
export const getOffscreenTy = (dir: T_Direction4, w: number, h: number): string => {
  switch (dir) {
    case 'T': return `0 ${h + 1}`
    case 'B': return `0 ${-(h + 1)}`
    case 'L': return `${w + 1} 0`
    case 'R': return `${-(w + 1)} 0`
  }
}
