/** 字体 URL 映射：CSS font-family 名 → 字体文件直链（TTF/OTF/WOFF） */
export interface BakeFontUrlMap {
  [fontFamily: string]: string
}

export interface BakeOptions {
  /** 要转曲的字体映射。key 是 CSS 里的 font-family 名，value 是字体文件直链 */
  fontUrlMap: BakeFontUrlMap
}

export interface BakeResult {
  /** 烘焙出的 `<svg>...</svg>` 字符串（文字已转曲，字体无关，可直接贴微信） */
  svg: string
  /** 根元素宽度（viewBox 宽） */
  width: number
  /** 根元素高度（viewBox 高） */
  height: number
}
