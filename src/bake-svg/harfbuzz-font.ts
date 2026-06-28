/**
 * harfbuzzjs 适配层:把 HarfBuzz 的底层 API 封装成统一字形接口,供 text.ts 调用。
 *
 * 所有字体(静态 + 可变)都走这一层:
 * - 静态字体(Regular/Bold 各一个文件):字重靠选不同文件,不切轴
 * - 可变字体(含 wght 轴):text.ts 按 CSS weight 调 setVariation 切轴
 *
 * API:
 *   glyphExists(c) / getPath(c,x,y,size) / getAdvanceWidth(c,size) / metrics
 */
import * as hb from 'harfbuzzjs'

/** harfbuzzjs 的 metrics(等价字体的 hhea 表 + unitsPerEm) */
export interface HarfbuzzMetrics {
  unitsPerEm: number
  ascender: number
  descender: number
}

/** harfbuzz 字体的 path 结果(带 toPathData,输出 SVG d 字符串) */
export interface HarfbuzzPath {
  toPathData(precision?: number): string
}

/**
 * 封装后的 harfbuzz 字体,提供与 opentype.js Font 同构的接口。
 *
 * 关键:harfbuzzjs 的 glyphToPath 返回的设计单位坐标,本层负责按 fontSize 缩放,
 * 并应用 (x, y) 偏移。返回的 toPathData() 给出像素坐标的 SVG d 字符串。
 */
export interface HarfbuzzFont {
  /** 是否可变字体(含 fvar 表)。preload 时自动探测,无需用户声明 */
  readonly variable: boolean
  /** 设可变字体轴(如 wght=700)。静态字体调用无效。 */
  setVariation(axis: string, value: number): void
  /** 字体是否含某字符的字形 */
  glyphExists(char: string): boolean
  /** 取字符轮廓路径(已按 fontSize 缩放 + 偏移),y 是 baseline。
   *  inkOffset:浏览器实测的 ink 左边缘相对 advance 原点偏移(Canvas actualBoundingBoxLeft) */
  getPath(char: string, x: number, y: number, fontSize: number, inkOffset?: number): HarfbuzzPath
  /** 取字符推进宽度(像素) */
  getAdvanceWidth(char: string, fontSize: number): number
  /** 字体度量(设计单位) */
  readonly metrics: HarfbuzzMetrics
}

/**
 * 从 ArrayBuffer 创建 harfbuzz 字体。
 * 一个 FontConfig 对应一个 HarfbuzzFont 实例。
 */
export function createHarfbuzzFont(buffer: ArrayBuffer): HarfbuzzFont {
  const blob = new hb.Blob(buffer)
  const face = new hb.Face(blob, 0)
  const font = new hb.Font(face)

  // ⚠️ 自动探测可变字体:读 fvar 表,有轴就是可变字体。
  // 这样用户传字体配置时不需要手动声明 variable,bake-svg 自己判断。
  let isVariable = false
  try {
    const axes = face.getAxisInfos?.()
    isVariable = !!(axes && Object.keys(axes).length > 0)
  } catch { /* getAxisInfos 不存在 = 静态字体 */ }

  const unitsPerEm = face.upem
  // 字体 metrics(ascender/descender):用测量值,不硬编码。
  // ⚠️ 用 Canvas measureText 的 fontBoundingBoxAscent/Descent(浏览器真实度量),
  //    不用字体文件公式推算,也不用 0.8/0.2 经验值。
  //    需要 Canvas(browser 环境)。无 Canvas(Node)时用 harfbuzz 的 font.extents 兜底。
  const fontExtents = (font as unknown as { extents?: { ascender?: number; descender?: number } }).extents
  let ascender: number
  let descender: number
  if (typeof document !== 'undefined') {
    // browser:用 Canvas 测量(最准,和浏览器原生渲染一致)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = `1000px sans-serif`  // 用 1000px 量,再除回设计单位
      const m = ctx.measureText('Agp荧光')
      const fbAscent = (m as TextMetrics & { fontBoundingBoxAscent?: number }).fontBoundingBoxAscent ?? 800
      const fbDescent = (m as TextMetrics & { fontBoundingBoxDescent?: number }).fontBoundingBoxDescent ?? 200
      // Canvas 给的是 px(1000px 字号下),转回设计单位(× unitsPerEm / 1000)
      ascender = fbAscent * unitsPerEm / 1000
      descender = -(fbDescent * unitsPerEm / 1000)
    } else {
      ascender = fontExtents?.ascender ?? Math.round(unitsPerEm * 0.8)
      descender = fontExtents?.descender ?? -Math.round(unitsPerEm * 0.2)
    }
  } else {
    // Node:无 Canvas,用 harfbuzz 的 extents 兜底(标注:仅 Node,不精确)
    ascender = fontExtents?.ascender ?? Math.round(unitsPerEm * 0.8)
    descender = fontExtents?.descender ?? -Math.round(unitsPerEm * 0.2)
  }

  /** 把设计单位的 path 缩放到 fontSize,并应用 (x, y) baseline 偏移。
   *
   * 关键坐标变换(实测确认):
   * harfbuzzjs 的 glyphToPath 返回字体设计单位坐标,y 轴**向上为正**(原点在 baseline,
   * 字形顶部 py>0)。SVG 的 y 轴向下为正。所以 y 方向要翻转:svgY = baseline - py*scale。
   * x 方向两者一致(向右为正),直接 x + px*scale。
   */
  function scalePath(designPath: string, x: number, y: number, fontSize: number, precision: number): string {
    const scale = fontSize / unitsPerEm
    const coordRegex = /([MLQCZ])([^MLQCZ]*)/gi
    return designPath.replace(coordRegex, (match, cmd: string, coords: string) => {
      if (cmd.toUpperCase() === 'Z') return cmd
      const nums = coords.trim().split(/[\s,]+/).filter(Boolean).map(Number)
      const scaled: string[] = []
      for (let i = 0; i < nums.length; i += 2) {
        const px = nums[i]
        const py = nums[i + 1]
        scaled.push((x + px * scale).toFixed(precision))
        // y 翻转:harfbuzz 向上为正 → SVG 向下为正
        scaled.push((y - py * scale).toFixed(precision))
      }
      return cmd + scaled.join(' ')
    })
  }

  /** shape 单个字符拿 glyphId + advance(每次新建 buffer,harfbuzzjs 无 clear 方法) */
  function shapeOne(char: string): { glyphId: number; xAdvance: number } {
    const buffer = new hb.Buffer()
    buffer.addText(char)
    buffer.guessSegmentProperties()
    hb.shape(font, buffer)
    const info = buffer.getGlyphInfosAndPositions()[0]
    // 空结果兜底(shape 失败时返回 .notdef)
    if (!info) return { glyphId: 0, xAdvance: 0 }
    return { glyphId: info.codepoint ?? 0, xAdvance: info.xAdvance ?? 0 }
  }

  /** 取字形的 ink 左边缘相对 advance 原点的偏移(设计单位,harfbuzz glyphExtents) */
  function leftBearing(glyphId: number): number {
    try {
      const ext = font.glyphExtents(glyphId) as { xBearing?: number } | undefined
      return ext?.xBearing ?? 0
    } catch {
      return 0
    }
  }

  return {
    variable: isVariable,

    setVariation(axis: string, value: number) {
      font.setVariations([new hb.Variation(axis, value)])
    },

    glyphExists(char: string) {
      // shape 后 glyphId 为 0(.notdef)表示字体不含该字形
      return shapeOne(char).glyphId !== 0
    },

    getPath(char: string, x: number, y: number, fontSize: number, inkOffset?: number): HarfbuzzPath {
      const { glyphId } = shapeOne(char)
      const designPath = font.glyphToPath(glyphId) as string
      const scale = fontSize / unitsPerEm
      // x 是 advance 原点(Range.getBoundingClientRect 量的占位框左边缘)。
      // inkOffset 是浏览器 Canvas actualBoundingBoxLeft 量的 ink 左边缘相对 advance 原点的偏移。
      // 字形 path 的 ink 在 advance 原点 + xBearing 处(harfbuzz 设计坐标),
      // 要让 path 的 ink 对齐浏览器的 ink,需把 path 整体平移:
      //   path 画在 advance原点 + (inkOffset - xBearing*scale)
      // 这样 path 的 ink(在 path原点 + xBearing*scale)正好落在 advance原点 + inkOffset。
      const lb = leftBearing(glyphId)
      const offset = (inkOffset ?? 0) - lb * scale
      return {
        toPathData(precision = 3) {
          return scalePath(designPath, x + offset, y, fontSize, precision)
        }
      }
    },

    getAdvanceWidth(char: string, fontSize: number) {
      const { xAdvance } = shapeOne(char)
      return (xAdvance / unitsPerEm) * fontSize
    },

    metrics: { unitsPerEm, ascender, descender }
  }
}
