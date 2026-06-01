import type { I_NormalizedChildItem } from "../utils/normalizer"

/**
 * 序列时间计算器
 *
 * 负责计算动画周期内的时间分配：
 * - 总周期时长
 * - 每张图片的 SMIL begin 偏移
 * - 每张图片在屏幕外的保持时间
 */

/** 总周期时长 = 所有子项的 (switchDuration + stayDuration) 之和 */
export const calculateTotalDuration = (items: I_NormalizedChildItem[]): number =>
  items.reduce((sum, item) => sum + item.switchDuration + item.stayDuration, 0)

/**
 * 计算第 index 张子项的 SMIL begin 偏移（秒）。
 *
 * 设计原则：图1的 begin = -switchDuration，使得 t=0 时图1恰好完成进入、处于全屏静止状态。
 * 后续图的 begin 依次累加，但整体减去一个完整周期 totalDuration，
 * 确保 t=0 时所有图的动画都已经运行过一轮、处于正确位置——
 * 否则 begin > 0 的图在 t=0 时动画尚未开始，<g> 会停在原点（全屏中心）造成闪烁。
 */
export const calculateBegin = ({
  index,
  items,
  totalDuration,
}: {
  /** 当前子项的索引 */
  index: number
  /** 所有子项的标准化配置 */
  items: I_NormalizedChildItem[]
  /** 总动画周期（秒） */
  totalDuration: number
}): number => {
  if (index === 0) return -items[0].switchDuration

  let begin = items[0].stayDuration
  for (let i = 1; i < index; i++) {
    begin += items[i].switchDuration + items[i].stayDuration
  }

  return begin - totalDuration
}

/**
 * 计算第 index 张子项的保持时间（在屏幕外等待的时间）。
 *
 * holdDuration = totalDuration - 当前进入 - 当前停留 - 下一张进入
 */
export const calculateHoldDuration = ({
  index,
  items,
  totalDuration,
}: {
  /** 当前子项的索引 */
  index: number
  /** 所有子项的标准化配置 */
  items: I_NormalizedChildItem[]
  /** 总动画周期（秒） */
  totalDuration: number
}): number => {
  const current = items[index]
  const next = items[(index + 1) % items.length]

  return totalDuration - current.switchDuration - current.stayDuration - next.switchDuration
}
