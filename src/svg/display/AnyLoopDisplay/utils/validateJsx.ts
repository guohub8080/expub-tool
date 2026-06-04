import isNil from "lodash/isNil"
import { isValidElement } from "react"

/**
 * 校验 jsx 内容的 viewBox 是否与内容区域尺寸一致。
 *
 * 仅检测 ReactElement（SvgEx / <svg> 等有 viewBox prop 的组件）。
 * 如果 jsx 不是有效的 ReactElement（如纯文本、Fragment、数组等），跳过校验。
 * 如果检测到 viewBox 但尺寸不匹配，抛出错误。
 *
 * @param jsx — 用户传入的 jsx 内容
 * @param contentWidth — 内容区域宽度（canvasSize.w - itemGap * 2）
 * @param contentHeight — 内容区域高度（canvasSize.h - itemGap * 2）
 */
export const validateJsxViewBox = ({
  jsx,
  contentWidth,
  contentHeight,
}: {
  jsx?: React.ReactNode
  contentWidth: number
  contentHeight: number
}): void => {
  if (isNil(jsx) || !isValidElement(jsx)) return

  const props = (jsx as React.ReactElement<{ viewBox?: string }>).props
  const viewBox = props?.viewBox

  // 没有 viewBox prop，跳过（可能是非 SVG 组件）
  if (isNil(viewBox)) return

  // 解析 viewBox："0 0 300 300" → [0, 0, 300, 300]
  const parts = String(viewBox).trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error(`Invalid \`viewBox\` format: "${viewBox}". Expected "minX minY width height".`)
  }

  const [, , vbWidth, vbHeight] = parts

  if (vbWidth !== contentWidth || vbHeight !== contentHeight) {
    throw new Error(
      `\`viewBox\` size mismatch: viewBox is "${vbWidth} ${vbHeight}", ` +
      `but content size is "${contentWidth} ${contentHeight}". ` +
      `When using \`jsx\`, the SVG viewBox must match the content area size (canvasSize - itemGap).`
    )
  }
}
