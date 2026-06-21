import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"

/**
 * 合并 watermark 配置
 *
 * 合并策略（组件 prop 优先）：
 * - noWatermark={true}   → 显式关闭，不输出任何 watermark
 * - watermark={...}      → 组件级对象，覆盖 Provider 的全局 watermark
 * - 都不传               → 使用 Provider 的全局 watermark
 *
 * @param propWatermark  - 组件 props 传入的 watermark
 * @param noWatermark    - 是否关闭 watermark（优先级最高）
 * @returns 展开到元素属性的对象，或 undefined（关闭时）
 */
export const resolveWatermark = (
  propWatermark?: Record<string, any>,
  noWatermark?: boolean,
): Record<string, any> | undefined => {
  if (noWatermark) return undefined
  if (propWatermark !== undefined) return propWatermark
  return ExPubGoConfig().watermark
}
