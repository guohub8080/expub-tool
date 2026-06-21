import { parse } from 'opentype.js'
import type { Font } from 'opentype.js'

/** 按 URL 缓存已解析的字体（同字体只 fetch + parse 一次） */
const parsedFontByUrl = new Map<string, Font>()

/**
 * 拉取字体文件并解析成 opentype.js Font 对象（按 URL 缓存）。
 * 解析后的 Font 用于取字形轮廓（getPath）和度量（ascender/unitsPerEm）。
 */
export async function loadParsedFont(fontUrl: string): Promise<Font> {
  const cached = parsedFontByUrl.get(fontUrl)
  if (cached) return cached

  const response = await fetch(fontUrl)
  const buffer = await response.arrayBuffer()
  const font = parse(buffer)
  parsedFontByUrl.set(fontUrl, font)
  return font
}

/** 解析 computedStyle.fontFamily 的第一个字体名：'"My Font", sans-serif' → 'My Font' */
export function parseFirstFontFamily(fontFamily: string): string {
  const first = fontFamily.split(',')[0].trim()
  return first.replace(/^["']|["']$/g, '')
}

/** 按 fontUrlMap 预加载并解析所有字体 → family 名 → Font 映射 */
export async function loadFontMap(fontUrlMap: Record<string, string>): Promise<Map<string, Font>> {
  const fontMap = new Map<string, Font>()
  for (const [family, url] of Object.entries(fontUrlMap)) {
    fontMap.set(family, await loadParsedFont(url))
  }
  return fontMap
}
