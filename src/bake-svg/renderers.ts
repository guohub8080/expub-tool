import canvas from './renderers/canvas'
import div from './renderers/div'
import image from './renderers/image'
import span from './renderers/span'
import svg from './renderers/svg'
import text from './renderers/text'

import type { GlobalContext, BoundElementRenderer, ElementRenderer, TextRenderer } from './types'

/**
 * 元素 renderer 注册表(工厂形态,按 tagName 取,调用前需先绑定 GlobalContext)。
 * 未匹配的 tag 由 index.ts fallback 到 div。
 *
 * 注意:text 不在这里——它签名不同(接收 string),由 index.ts 单独导入。
 */
export const ELEMENT_RENDERERS: Record<string, ElementRenderer> = {
  div,
  svg,

  // Match HTMLElement.tagName casing
  DIV: div,
  MARK: span,
  SPAN: span,
  CANVAS: canvas,
  IMG: image,
  SVG: svg
}

/** text renderer 工厂(签名不同,单独导出) */
export const TEXT_RENDERER: TextRenderer = text

/** 按 tagName 取元素 renderer 工厂 */
export function getElementRendererFactory(tagName: string): ElementRenderer {
  return ELEMENT_RENDERERS[tagName] ?? div
}

/** 调用工厂绑定 ctx,返回「已绑定 ctx 的元素渲染函数」 */
export function bindElementRenderer(
  tagName: string,
  ctx: GlobalContext
): BoundElementRenderer {
  return getElementRendererFactory(tagName)(ctx)
}

// 直接命名导出(renderer 工厂实现)
export { div, svg, span, canvas, image, text }

