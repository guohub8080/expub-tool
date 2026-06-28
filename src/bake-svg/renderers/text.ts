// TODO text-decoration

import $ from '../utils/dom-render-svg'
import type { TextRenderer, FontConfig } from '../types'

/**
 * 统一字形引擎抽象:屏蔽 harfbuzz 的底层细节。
 * 所有字体(静态 + 可变)都走 harfbuzzjs —— opentype.js 已移除(对 woff/中文有缺陷)。
 * 字重区分:静态字体靠选不同文件(Regular/Bold),可变字体靠运行时切 wght 轴。
 */
interface GlyphEngine {
  /** 字体是否含某字符的字形 */
  glyphExists(c: string): boolean
  /** 取字符轮廓(已缩放 + 偏移),y 是 baseline。返回带 toPathData 的对象 */
  getPath(c: string, x: number, y: number, fontSize: number): { toPathData(precision?: number): string }
  /** 取字符推进宽度(像素) */
  getAdvanceWidth(c: string, fontSize: number): number
  /** 字体度量(用于算 leading) */
  readonly metrics: { unitsPerEm: number; ascender: number; descender: number }
}

/** 把 FontConfig 包装成 GlyphEngine。所有字体统一走 harfbuzz 适配层。 */
function toGlyphEngine(font: FontConfig): GlyphEngine | null {
  if (font.harfbuzz) {
    const hb = font.harfbuzz
    return {
      glyphExists: (c) => hb.glyphExists(c),
      getPath: (c, x, y, fs) => hb.getPath(c, x, y, fs),
      getAdvanceWidth: (c, fs) => hb.getAdvanceWidth(c, fs),
      metrics: hb.metrics
    }
  }
  return null
}

/** 把 CSS font-weight 字符串归一化成数字字符串。
 *  浏览器 computed style 可能返回 'bold'/'normal'/'700' 等不同写法,
 *  FontConfig 里 weight 可能是数字或字符串,统一归一化后比较。
 */
function normalizeWeight(w: string): string {
  const mapped: Record<string, string> = {
    normal: '400',
    bold: '700',
    lighter: '300',
    bolder: '600'
  }
  return mapped[w] ?? w
}

/** 把 CSS font-family 列表解析成有序数组(靠前的优先级高)。
 * 例:'Noto Sans SC, Arial, sans-serif' → ['Noto Sans SC', 'Arial', 'sans-serif']
 */
function parseFontFamilyList(s: CSSStyleDeclaration): string[] {
  return (s.getPropertyValue('font-family') ?? '')
    .split(',')
    .map(f => f.trim().replace(/['"]/g, ''))
}

const createTextRenderer: TextRenderer = ({ debug, fonts }) =>
  async (string, { x, y, width, height, style }) => {
    if (!string) return

    const g = $('g', { class: 'text-fragment' })

    // 按 CSS font-family 列表构建「候选字体数组」(优先级从高到低),
    // 用于逐字符回退:每个字符先用列表里第一个含该字形的字体。
    // 这复现了 CSS 的字体回退语义(英文用 Arial,中文 fallback 到 Noto Sans SC)。
    const cssFamilyList = parseFontFamilyList(style)
    const cssStyle = style.getPropertyValue('font-style') ?? 'normal'
    const cssWeight = normalizeWeight(style.getPropertyValue('font-weight') ?? '400')

    const candidateFonts: FontConfig[] = []
    for (const familyName of cssFamilyList) {
      // 精确匹配 family+style+weight
      const exact = fonts.find(f =>
        f.family === familyName &&
        (f.style ?? 'normal') === cssStyle &&
        normalizeWeight(f.weight ?? '400') === cssWeight
      )
      if (exact) { candidateFonts.push(exact); continue }
      // 兜底:同 family 任一字重
      const fallback = fonts.find(f => f.family === familyName)
      if (fallback) candidateFonts.push(fallback)
    }
    // 最后兜底:任意已注册字体(保证至少有字)
    if (candidateFonts.length === 0 && fonts.length > 0) candidateFonts.push(fonts[0])

    // 把候选字体转成 GlyphEngine(屏蔽 opentype/harfbuzz 差异)
    const candidateEngines: GlyphEngine[] = []
    const candidateOwners: FontConfig[] = []
    for (const f of candidateFonts) {
      const engine = toGlyphEngine(f)
      if (engine) {
        candidateEngines.push(engine)
        candidateOwners.push(f)
      }
    }
    if (candidateEngines.length === 0) {
      console.warn(`[bake-svg] 无法找到字体,跳过文本: '${string.slice(0, 20)}'`)
      return g
    }

    // 主引擎:取第一个候选(用于算行高/leading,整行共享)
    const mainEngine = candidateEngines[0]

    // 可变字体:按 CSS weight 切 wght 轴。
    // ⚠️ 只对 variable:true 的字体设轴 —— 静态字体没有 wght 轴,设了无意义/有害。
    // 静态字体的字重靠上面选了对应文件(Regular=400 / Bold=700),不需要切轴。
    const targetWeight = parseInt(cssWeight)
    if (!isNaN(targetWeight)) {
      for (const owner of candidateOwners) {
        if (owner.variable && owner.harfbuzz) owner.harfbuzz.setVariation('wght', targetWeight)
      }
    }

    /** 逐字符选引擎:返回第一个含该字符字形的候选引擎 */
    const engineForChar = (c: string): GlyphEngine => {
      for (const engine of candidateEngines) {
        if (engine.glyphExists(c)) return engine
      }
      return mainEngine // 全都没有就用主引擎(画 .notdef,至少不崩)
    }

    // Extract font metrics(用主引擎算 descent,用于 baseline)
    const { unitsPerEm, descender } = mainEngine.metrics
    const fontSize = parseFloat(style.getPropertyValue('font-size'))

    // ⚠️ baseline 定位:用该字符自己的 bbox(浏览器测量的真实渲染框)。
    // baseline = charRect.bottom - fontBoundingBoxDescent
    //   (charRect 来自 index.ts 的单字符 Range.getBoundingClientRect)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('[bake-svg] Canvas 2D context 不可用,bake-svg 需要浏览器环境渲染文字')
    }
    ctx.font = `${style.getPropertyValue('font-weight')} ${fontSize}px/${style.getPropertyValue('line-height')} ${style.getPropertyValue('font-family')}`
    const m = ctx.measureText('Agp荧光')
    const fbDescent = (m as TextMetrics & { fontBoundingBoxDescent?: number }).fontBoundingBoxDescent ?? (Math.abs(descender) / unitsPerEm) * fontSize

    const baselineY = y + height - fbDescent  // y/height 是该字符自己的 bbox(SVG 坐标)
    const color = style.getPropertyValue('color')

    // Render debug metrics
    if (debug) {
      line('leading', height - fbDescent, { orientation: 'horizontal', stroke: '#4b96ff' })
    }

    // ⚠️ 逐字独立:string 是单个字符,x/width 是它自己的 bbox。
    // 直接用 bbox 的 x 放字形,不做累加、不依赖 advanceWidth。
    for (const c of string) {
      const engine = engineForChar(c)
      $('path', {
        d: engine.getPath(c, x, baselineY, fontSize).toPathData(3),
        fill: color
      }, g)
    }

    return g

    function line(
      title: string,
      v: number,
      { orientation = 'horizontal', stroke = 'black' }: { orientation?: string; stroke?: string } = {}
    ): void {
      if (!debug) return
      $('line', {
        title,
        'data-value': String(v),
        x1: orientation === 'horizontal' ? x : x + v,
        x2: orientation === 'horizontal' ? x + width : x + v,
        y1: orientation === 'horizontal' ? y + v : y,
        y2: orientation === 'horizontal' ? y + v : y + height,
        stroke,
        class: 'debug'
      }, g)
    }
  }

export default createTextRenderer
