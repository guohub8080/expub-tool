import isNil from 'lodash/isNil'
import round from 'lodash/round'
import type { Font } from 'opentype.js'
import type { BakeOptions, BakeResult } from './types'
import { loadFontMap, parseFirstFontFamily } from './fonts'

/** 小数位精度（坐标/path 都保留 2 位，省体积） */
const DECIMAL_PLACES = 2

/**
 * opentype.js 2.0 的 getPath options 支持 hinting（让输出轮廓贴合像素网格，
 * 小字号下更接近浏览器渲染、不会偏粗）；@types/opentype.js 1.x 没声明 hinting 字段，
 * 这里构造一个带 hinting 的 options 并绕过类型检查。
 */
const RENDER_OPTIONS = { hinting: true, kerning: true } as unknown as Parameters<Font['getPath']>[4]

/**
 * 元素 → SVG 原语字符串数组：
 * - `<img>` → `<image>`
 * - 有 backgroundColor → `<rect fill rx>`（满铺）
 * - 有 border → 单独一个 `<rect stroke rx>`，**内缩 strokeWidth/2**（让居中的 stroke
 *   完全落在 viewBox 内；CSS border 在内侧，这样边框不被裁、圆角不变形）
 * - 无视觉样式 → 返回空数组
 *
 * 位置全部相对根元素左上角（减去 rootLeft/rootTop）。
 */
function elementToPrimitives(element: Element, rootLeft: number, rootTop: number): string[] {
  const elementRect = element.getBoundingClientRect()
  if (elementRect.width === 0 || elementRect.height === 0) return []

  const x = elementRect.left - rootLeft
  const y = elementRect.top - rootTop
  const width = elementRect.width
  const height = elementRect.height

  if (element.tagName === 'IMG') {
    const imageElement = element as HTMLImageElement
    const src = imageElement.currentSrc || imageElement.src
    return [`<image href="${src}" x="${round(x, DECIMAL_PLACES)}" y="${round(y, DECIMAL_PLACES)}" width="${round(width, DECIMAL_PLACES)}" height="${round(height, DECIMAL_PLACES)}" preserveAspectRatio="none"/>`]
  }

  const style = getComputedStyle(element)
  const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent'
  const borderWidth = parseFloat(style.borderTopWidth) || 0
  const hasBorder = borderWidth > 0 && style.borderTopStyle !== 'none'
  if (!hasBackground && !hasBorder) return []

  const radius = parseFloat(style.borderTopLeftRadius) || 0
  const primitives: string[] = []

  // 背景层：满铺 rect（圆角 = CSS border-radius）
  if (hasBackground) {
    primitives.push(`<rect x="${round(x, DECIMAL_PLACES)}" y="${round(y, DECIMAL_PLACES)}" width="${round(width, DECIMAL_PLACES)}" height="${round(height, DECIMAL_PLACES)}" rx="${round(radius, DECIMAL_PLACES)}" fill="${style.backgroundColor}"/>`)
  }

  // 边框层：内缩 strokeWidth/2，stroke 居中后完全在 viewBox 内（= CSS border 内侧）
  if (hasBorder) {
    const halfBorder = borderWidth / 2
    primitives.push(`<rect x="${round(x + halfBorder, DECIMAL_PLACES)}" y="${round(y + halfBorder, DECIMAL_PLACES)}" width="${round(width - borderWidth, DECIMAL_PLACES)}" height="${round(height - borderWidth, DECIMAL_PLACES)}" rx="${round(Math.max(0, radius - halfBorder), DECIMAL_PLACES)}" fill="none" stroke="${style.borderTopColor}" stroke-width="${round(borderWidth, DECIMAL_PLACES)}"/>`)
  }

  return primitives
}

/**
 * 文本节点 → 每字 path data。
 * 每个字用 Range 量出浏览器渲染的实际位置（含字距/kerning），
 * opentype.js 按该位置取字形轮廓 → `<path d fill>`。
 */
function textNodeToPaths(
  textNode: Text,
  rootLeft: number,
  rootTop: number,
  font: Font,
  fontSize: number,
  color: string,
): string[] {
  const text = textNode.textContent ?? ''
  if (text.length === 0) return []

  const ascent = (font.ascender / font.unitsPerEm) * fontSize
  const paths: string[] = []
  const range = document.createRange()

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    // 跳过空白符（无字形，也不需要画）
    if (char === ' ' || char === '\n' || char === '\t' || char === '\r') continue

    range.setStart(textNode, i)
    range.setEnd(textNode, i + 1)
    const charRect = range.getBoundingClientRect()
    if (charRect.width === 0 || charRect.height === 0) continue

    const x = charRect.left - rootLeft
    const baselineY = (charRect.top - rootTop) + ascent
    const glyphPath = font.getPath(char, x, baselineY, fontSize, RENDER_OPTIONS)
    const pathData = glyphPath.toPathData(DECIMAL_PLACES)
    if (pathData.length > 0) paths.push(`<path d="${pathData}" fill="${color}"/>`)
  }

  return paths
}

/**
 * 递归遍历 DOM（按文档顺序，保证 SVG 绘制顺序 = 视觉层叠顺序）：
 * - 元素节点：先出自身原语（bg/border/image，垫在下层），再递归子节点（文字画在上层）
 * - 文本节点：取父元素 computedStyle 的字体/字号/颜色 → 逐字转曲
 */
function walkNode(
  node: Node,
  rootLeft: number,
  rootTop: number,
  fontMap: Map<string, Font>,
  out: string[],
): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement
    if (isNil(parent)) return

    const style = getComputedStyle(parent)
    const fontFamily = parseFirstFontFamily(style.fontFamily)
    const font = fontMap.get(fontFamily)
    if (isNil(font)) return  // 该字体没在 fontUrlMap 提供，跳过（不转曲）

    const fontSize = parseFloat(style.fontSize)
    if (Number.isNaN(fontSize) || fontSize === 0) return

    out.push(...textNodeToPaths(node as Text, rootLeft, rootTop, font, fontSize, style.color))
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return

  const element = node as Element
  out.push(...elementToPrimitives(element, rootLeft, rootTop))

  for (const child of element.childNodes) {
    walkNode(child, rootLeft, rootTop, fontMap, out)
  }
}

/**
 * 把一个已经渲染好的 DOM 元素「烘焙」成矢量 SVG 字符串。
 *
 * 读浏览器渲染后的布局结果（位置/尺寸/样式），把：
 * - 有 bg/border 的盒子 → `<rect>`
 * - `<img>` → `<image>`
 * - 文字 → opentype.js 转曲成 `<path>`（字体无关）
 * 拼成一份原封不动的 `<svg>`，可直接贴进微信。
 *
 * @param root    已渲染好的根元素（ref.current）
 * @param options 字体映射（哪些 font-family 要转曲）
 */
export async function bakeElement(root: HTMLElement, options: BakeOptions): Promise<BakeResult> {
  const rootRect = root.getBoundingClientRect()
  const fontMap = await loadFontMap(options.fontUrlMap)

  const parts: string[] = []
  walkNode(root, rootRect.left, rootRect.top, fontMap, parts)

  const width = round(rootRect.width, DECIMAL_PLACES)
  const height = round(rootRect.height, DECIMAL_PLACES)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${parts.join('')}</svg>`

  return { svg, width: rootRect.width, height: rootRect.height }
}
