import $ from '../utils/dom-render-svg'
import getTextFragments from '../utils/dom-get-text-fragments'

import DivRenderer, { isTransparent } from './div'
import type { ElementProps, GlobalContext, RenderOptions } from '../types'

/** 临时去掉 style 的 border 属性(返回新的 style-like 对象),用于避免 div.ts 画错位置的 border */
function stripBorders(style: CSSStyleDeclaration): CSSStyleDeclaration {
  // CSSStyleDeclaration 不能直接改,用 Proxy 拦截 border 相关属性的读取
  return new Proxy(style, {
    get(target, prop: string) {
      if (prop === 'getPropertyValue') {
        return (name: string) => {
          if (name.startsWith('border')) return '0px'  // border 相关都返回 0
          return target.getPropertyValue(name)
        }
      }
      return (target as unknown as Record<string, unknown>)[prop]
    }
  })
}

/**
 * <span> renderer(也用于 MARK)。
 *
 * 自递归结构:对每个子节点调用自己(当 span 渲染),并对「有可见背景/边框」的
 * inline 元素按文本片段逐行画背景。
 *
 * 注:span 的签名与标准 ElementRenderer 略有差异(自递归 + 接收 Node 而非 HTMLElement),
 * 所以单独实现,不套 ElementRenderer 类型。
 */
type RenderChild = (
  node: Node,
  props: ElementProps,
  options: RenderOptions
) => Promise<SVGGElement>

/**
 * ⚠️ 用户自定义渲染规则(故意不照浏览器原生表现)。
 *
 * 这里画的是「跨行 inline 背景」的特殊形态。和浏览器原生 inline 背景的区别:
 *
 *   浏览器原生:每行背景 = 该行 inline 文本片段的 actualBoundingBox,贴着文字。
 *   本 renderer:按「justify 式行块」画背景,每行宽度按规则撑满,圆角按行位分角。
 *
 * 这套规则是项目要求(非 bug、非疏漏),改这个文件前务必先读下面的规则说明。
 */

/**
 * 生成「分角圆角矩形」的 SVG path d 字符串。
 *
 * 支持四角各自的圆角半径:0 = 该角直角,>0 = 该角圆角。
 *
 * 为什么需要分角(而不是 <rect rx>)?
 *   SVG 的 <rect rx> 是四角统一半径,无法表达「只有左侧圆角」。
 *   跨行 inline 背景需要每行不同角的圆角组合,必须用 path 的 arc 命令逐角控制。
 *
 * @param x,y,w,h  矩形位置和尺寸
 * @param r        四角半径 { tl:左上, tr:右上, br:右下, bl:左下 }
 */
function roundedRectPath(
  x: number, y: number, w: number, h: number,
  r: { tl: number; tr: number; br: number; bl: number }
): string {
  // 防止圆角半径超过半边(否则 arc 会变形)
  const maxR = Math.min(w, h) / 2
  const tl2 = Math.min(r.tl, maxR)
  const tr2 = Math.min(r.tr, maxR)
  const br2 = Math.min(r.br, maxR)
  const bl2 = Math.min(r.bl, maxR)
  return [
    `M${x + tl2} ${y}`,                              // 从左上圆角终点开始
    `h${w - tl2 - tr2}`,                              // 顶边
    tr2 > 0 ? `a${tr2} ${tr2} 0 0 1 ${tr2} ${tr2}` : '',  // 右上圆角
    `v${h - tr2 - br2}`,                              // 右边
    br2 > 0 ? `a${br2} ${br2} 0 0 1 ${-br2} ${br2}` : '', // 右下圆角
    `h${-(w - br2 - bl2)}`,                           // 底边
    bl2 > 0 ? `a${bl2} ${bl2} 0 0 1 ${-bl2} ${-bl2}` : '', // 左下圆角
    `v${-(h - bl2 - tl2)}`,                           // 左边
    tl2 > 0 ? `a${tl2} ${tl2} 0 0 1 ${tl2} ${-tl2}` : '', // 左上圆角
    'z'
  ].filter(Boolean).join('')
}

function SpanRenderer(ctx: GlobalContext): RenderChild {
  const { debug, fonts, cache } = ctx

  const renderSpan: RenderChild = async (node, props, options) => {
    const g = $('g')

    // ── 递归子节点 ──────────────────────────────────────────
    // 每个 child node 当一个 span 渲染(保持 DOM 树结构)
    const innerRenderSpan = SpanRenderer({ debug, fonts, cache })
    for (const child of (node as Element).childNodes ?? []) {
      g.appendChild(await innerRenderSpan(child, props, options))
    }

    const renderDiv = DivRenderer({ debug, fonts, cache })

    // ── inline 背景渲染 ─────────────────────────────────────
    // 只对 Element(非 Text 节点)且「有可见背景或边框」时画背景。
    // Text 节点没有自己的盒模型,由父级 span 负责背景。
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const elStyle = window.getComputedStyle(el)

      // 判断是否有可见背景(过滤掉 transparent / 初始值)
      const hasBg = !['transparent', 'rgba(0, 0, 0, 0)', ''].includes(elStyle.backgroundColor)
      // 判断是否有可见边框(任一边宽度 > 0)
      const hasBorder = ['top', 'right', 'bottom', 'left'].some(d => {
        const w = parseInt(elStyle.getPropertyValue(`border-${d}-width`))
        return !isNaN(w) && w > 0
      })

      if (hasBg || hasBorder) {
        await renderInlineBackground(el, elStyle, props, renderDiv, options, g)
      }
    }

    // 文字本身的矢量化由 text renderer 负责(通过 getTextFragments 提供的 baseline 定位)
    // 这里遍历文本片段仅为占位,不做实际渲染
    for (const { rect } of getTextFragments(node as Element) ?? []) {
      void rect
    }

    return g
  }

  return renderSpan
}

/**
 * 渲染 inline 元素的背景 —— 这是本 renderer 的核心,实现了「用户自定义跨行背景规则」。
 *
 * ⚠️ 以下规则是项目要求,故意和浏览器原生 inline 背景不同:
 *
 * 【背景高度】用 Canvas measureText 的 fontBoundingBox(ascent+descent),
 *    而非浏览器原生(actualBoundingBox / inline box / line-height)。
 *    实测 fontBoundingBox 和浏览器原生黄底像素最接近。
 *
 * 【跨行宽度 - justify 式撑满】
 *    - 第一行(span 开始):左边 = span 实际起点,右边 = 容器内容区右边(撑满)
 *    - 中间行:左右都 = 容器内容区边界(整行撑满,像 text-align:justify)
 *    - 最后行(span 结束):左边 = 容器内容区左边,右边 = span 文字实际结束
 *    - 单行:左 = span 起点,右 = span 结束
 *    浏览器原生:每行只贴文字宽度。本规则:非最后行撑满到容器右边。
 *
 * 【圆角分角】
 *    - 第一行:左侧两角圆角(tl, bl)
 *    - 最后行:右侧两角圆角(tr, br)
 *    - 中间行:无圆角
 *    - 单行:四角全圆角
 *    浏览器原生:四角统一圆角(每行独立)。本规则:按行位分角,体现「整体跨行块」的视觉。
 */
async function renderInlineBackground(
  el: Element,
  elStyle: CSSStyleDeclaration,
  props: ElementProps,
  renderDiv: (el: HTMLElement, props: ElementProps, opts: RenderOptions) => Promise<SVGElement | null | undefined>,
  options: RenderOptions,
  g: SVGGElement
): Promise<void> {
  // ── Canvas 测量:背景高度 = fontBoundingBox(用户自定义,非 line-height)──
  const canvas = document.createElement('canvas')
  const ctx2d = canvas.getContext('2d')!
  ctx2d.font = `${elStyle.fontWeight} ${elStyle.fontSize}/${elStyle.lineHeight} ${elStyle.fontFamily}`
  // 用含 ascender + descender 的字符测字体全高框
  const fbMetrics = ctx2d.measureText('Agp荧光')
  const fbAscent = (fbMetrics as TextMetrics & { fontBoundingBoxAscent?: number }).fontBoundingBoxAscent ?? 0
  const fbDescent = (fbMetrics as TextMetrics & { fontBoundingBoxDescent?: number }).fontBoundingBoxDescent ?? 0
  const fontBoxHeight = fbAscent + fbDescent  // 背景真实高度(用户自定义)

  // ── 盒模型参数 ──
  const padL = parseFloat(elStyle.paddingLeft) || 0
  const padR = parseFloat(elStyle.paddingRight) || 0
  const padT = parseFloat(elStyle.paddingTop) || 0
  const padB = parseFloat(elStyle.paddingBottom) || 0
  const borderRadius = parseFloat(elStyle.borderRadius) || 0
  const bgColor = elStyle.backgroundColor

  // ── 容器内容区边界(用于跨行撑满规则)──
  // ⚠️ 用户自定义:非最后行的背景要撑到容器右边(像 justify),所以需要容器的 content box。
  // 容器 = 父元素(通常是 <p> / <div>),取其 getBoundingClientRect 减去 padding。
  const parentEl = el.parentElement
  const parentStyle = parentEl ? window.getComputedStyle(parentEl) : null
  const parentBcr = parentEl?.getBoundingClientRect()
  const parentPadL = parentStyle ? (parseFloat(parentStyle.paddingLeft) || 0) : 0
  const parentPadR = parentStyle ? (parseFloat(parentStyle.paddingRight) || 0) : 0
  const containerLeft = parentBcr ? parentBcr.x + parentPadL : null   // 容器内容区左(viewport)
  const containerRight = parentBcr ? parentBcr.x + parentBcr.width - parentPadR : null  // 容器内容区右(viewport)

  // ── 逐文本片段(每行一个 rect)画背景 ──
  const fragments = getTextFragments(el) ?? []
  const fragCount = fragments.length

  for (let i = 0; i < fragCount; i++) {
    const rect = fragments[i].rect
    const isFirst = i === 0              // span 开始行
    const isLast = i === fragCount - 1   // span 结束行

    // ── 宽度规则(⚠️ 用户自定义 justify 式撑满)──
    // 默认:bgX = span 实际起点,bgRight = span 实际结束
    let bgX = rect.x
    let bgRight = rect.x + rect.width

    if (!isLast && containerRight !== null) {
      // 非最后行:右边缘撑到容器右边(像 justify)
      bgRight = containerRight
    }
    if (!isFirst && containerLeft !== null) {
      // 非第一行:左边缘从容器左边开始
      bgX = containerLeft
    }
    // 加 padding(背景区 = padding box,向外扩)
    bgX -= padL
    bgRight += padR
    // ⚠️ margin:不额外处理。getClientRects 返回的 rect.x 已含 margin 偏移
    // (浏览器把 margin 算进文本片段的位置了),所以 rect 本身就反映了 margin。

    const bgW = bgRight - bgX
    const bgY = rect.y - padT
    // ⚠️ 背景高度:用 rect.height(测量值)+ padding。
    // 注意:border-bottom 的位置用 rect.bottom 单独定位(见下方),不依赖 bgH。
    const bgH = rect.height + padT + padB

    // ── border-bottom:完全独立测量,用元素自身的 getClientRects(每行盒模型框)──
    // ⚠️ 核心原则:border 不依赖文字片段、不依赖背景。直接量浏览器把 border 画在哪。
    // 用 el.getClientRects()[i] 拿每行的盒模型框(含 border 的外边缘),
    // border-bottom 矩形 = 该行框的底部 bw 像素。
    const borderBottomWidth = parseFloat(elStyle.borderBottomWidth) || 0
    const borderBottomColor = elStyle.borderBottomColor
    const hasBorderBottom = borderBottomWidth > 0 && borderBottomColor && !isTransparent(borderBottomColor)
    const elLineRects = el.getClientRects()
    // 用元素自身的第 i 行框(和 getTextFragments 的 i 对应:都是按行)
    const elLine = elLineRects[i]
    const elLineBottom = elLine?.bottom ?? (rect.y + rect.height)
    const elLineX = elLine?.x ?? rect.x
    const elLineW = elLine?.width ?? rect.width

    // SVG 坐标
    const svgX = bgX - props.viewBox.x
    const svgY = bgY - props.viewBox.y
    // border-bottom 的 y = 元素该行框的 bottom - borderWidth。
    // ⚠️ 不做 Math.floor:SVG 原生支持亚像素坐标,而 floor 会把 border 向下取整
    // 拉离真实位置。CJK 行框 bottom 常落在 .6~.98(flat floor 偏移 ~1px,肉眼明显),
    // LATIN 常落在 .1~.2(floor 偏移极小)—— 这正是「中文下划线对不齐、英文没事」的根因。
    const borderY = elLineBottom - props.viewBox.y - borderBottomWidth
    // border 的 x/width = 元素该行框的 x/width(测量值,不撑满,不取整)
    const borderX = elLineX - props.viewBox.x
    const borderW = elLineW

    // ── 圆角规则(⚠️ 用户自定义分角)──
    // 第一行左侧圆角,最后行右侧圆角,中间无圆角,单行全圆角
    const radius = {
      tl: isFirst ? borderRadius : 0,
      bl: isFirst ? borderRadius : 0,
      tr: isLast ? borderRadius : 0,
      br: isLast ? borderRadius : 0,
    }

    // 把 viewport 坐标转 SVG 内部坐标(减 viewBox 偏移)—— 已在上面定义 svgX/svgY

    if (borderRadius > 0) {
      // 有圆角:用 path 画分角圆角矩形
      const d = roundedRectPath(svgX, svgY, bgW, bgH, radius)
      $('path', { d, fill: bgColor }, g)
    } else {
      // 无圆角:只画背景(不画 border,border 单独处理)
      if (!isTransparent(bgColor)) {
        const rendered = await renderDiv(el as HTMLElement, {
          ...props,
          x: svgX,
          y: svgY,
          width: bgW,
          height: bgH,
          // ⚠️ 用 span 自己的 style,但临时去掉 border(避免 div.ts 画错位置的 border)
          style: stripBorders(elStyle)
        }, options)
        if (rendered) g.appendChild(rendered)
      }
    }

    // ⚠️ border-bottom 单独画,完全用 el.getClientRects() 的测量值(x/y/w/h)。
    // 不依赖背景的 bgW,不撑满。CSS 是什么样就画什么样。
    if (hasBorderBottom && borderRadius <= 0) {
      $('rect', {
        x: borderX,
        y: borderY,
        width: borderW,
        height: borderBottomWidth,
        fill: borderBottomColor
      }, g)
    }
  }
}

export default SpanRenderer
