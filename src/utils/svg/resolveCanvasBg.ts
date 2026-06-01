import svgURL from "@utils/svg/svgURL"

/**
 * 解析画布背景配置，返回 CSS style 对象。
 *
 * 支持三种输入：
 * - 颜色字符串（如 "#fff", "red", "rgba(0,0,0,0.5)"）→ backgroundColor
 * - 图片 URL（http:// 或 data: 开头）→ backgroundImage + backgroundSize: cover
 * - undefined / 不传 → 空对象（无背景）
 *
 * @param canvasBg — 背景配置字符串
 * @returns CSS style 对象，可直接展开到 style 属性
 */
export const resolveCanvasBg = (canvasBg?: string): Record<string, string> => {
  if (!canvasBg) return {}

  const isUrl = canvasBg.startsWith('http') || canvasBg.startsWith('data:')

  return isUrl
    ? { backgroundImage: svgURL(canvasBg), backgroundSize: "cover" }
    : { backgroundColor: canvasBg }
}
