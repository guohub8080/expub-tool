import { uid } from 'uid'

import { createHarfbuzzFont } from './harfbuzz-font'

import walk from './utils/dom-walk'
import getZIndex from './utils/dom-get-zindex'
import getTextFragments from './utils/dom-get-text-fragments'
import parseTransform from './utils/parse-transform'
import lastOf from './utils/array-last'

import $ from './utils/dom-render-svg'
import { ELEMENT_RENDERERS, TEXT_RENDERER } from './renderers'

import type { FontConfig, GlobalContext, RenderOptions, ElementProps, BoundElementRenderer, BoundTextRenderer } from './types'
import type { SVGElementOf } from './utils/dom-render-svg'

/** 构造器参数 */
export interface HtmlToSvgOptions {
  debug?: boolean
  /** 跳过匹配该 CSS 选择器的元素 */
  ignore?: string
  /** 字体配置(必须显式声明所有用到的字体) */
  fonts?: FontConfig[]
}

/** transform 钩子:每个产物节点渲染后可被改写 */
export type TransformHook = (
  element: Element,
  rendered: SVGElement | null | undefined
) => SVGElement | null | undefined | Promise<SVGElement | null | undefined>

/** render() 返回的接口 */
export interface HtmlToSvgInstance {
  /** 字体/图片缓存 */
  readonly cache: Map<string, string>
  /** 还原所有被临时移除的 transform */
  cleanup: () => void
  /** 预加载所有字体(harfbuzzjs:fetch + parse) */
  preload: () => Promise<void>
  /** 清理所有资源 */
  destroy: () => void
  /** 把 root 渲染成 shadow SVG */
  render: (
    root: HTMLElement,
    options?: RenderOptions,
    transform?: TransformHook
  ) => Promise<SVGSVGElement>
}

/**
 * 创建一个 HTML→SVG 渲染器。
 *
 * @example
 * const renderer = htmlToSvg({ fonts: [{ family: 'Roboto', url: '/fonts/roboto.otf' }] })
 * await renderer.preload()
 * const svg = await renderer.render(document.querySelector('main'))
 */
export default function htmlToSvg({
  debug = false,
  ignore = '',
  fonts = []
}: HtmlToSvgOptions = {}): HtmlToSvgInstance {
  const cache = new Map<string, string>()
  // 只有 HTMLElement/SVGElement 有 .style,会被临时改 transform
  const detransformed = new Map<HTMLElement | SVGElement, string>()

  const globalCtx: GlobalContext = { debug, fonts, cache }

  // Init curried renderers:调用工厂绑定 ctx,注册表里存的是「已绑定 ctx 的渲染函数」
  const elementRenderers: Record<string, BoundElementRenderer> = {}
  for (const k in ELEMENT_RENDERERS) {
    elementRenderers[k] = ELEMENT_RENDERERS[k](globalCtx)
  }
  const textRenderer: BoundTextRenderer = TEXT_RENDERER(globalCtx)

  // Restore all removed transformation if any
  const cleanup = () => {
    for (const [element, transform] of detransformed) {
      element.style.transform = transform
      detransformed.delete(element)
    }
  }

  return {
    get cache() { return cache },
    cleanup,

    // Preload all fonts before resolving
    // 所有字体统一用 harfbuzzjs 解析(不再用 opentype.js —— 它对 woff/中文有缺陷)。
    // 字重区分:
    // - 可变字体(variable:true):一个文件覆盖所有字重,按 CSS weight 运行时切 wght 轴
    // - 静态字体(默认):一个文件一个固定字重,靠匹配不同文件(Regular/Bold)选字重
    preload: async function () {
      for (const font of fonts) {
        // 已加载则跳过
        if (font.harfbuzz) continue
        const response = await fetch(font.url)
        if (!response.ok) {
          throw new Error(`Failed to load font '${font.url}': ${response.status}`)
        }
        const buffer = await response.arrayBuffer()

        // ⚠️ 关键:把字体注册到浏览器的 document.fonts(FontFace API)。
        // 这样源 HTML 的 CSS font-family 也能找到这个字体,
        // 让「浏览器渲染源 HTML」和「bake-svg 读取测量值」用同一个字体,
        // 避免标点/字形不一致(如逗号形状不同)。
        // 不注册的话:源 HTML fallback 到系统字体,bake-svg 用自己的字体文件 → 不一致。
        //
        // ⚠️ 必须传 descriptors(weight/style):否则所有字体都注册成 weight 400(normal),
        // 导致 weight 700 的文字(strong)找不到正确字重,字体匹配混乱。
        //
        // ⚠️ 可变字体(variable:true)要用 weight 范围注册(如 '100 900'),
        // 这样浏览器知道该文件覆盖所有字重,weight 700(strong)也能匹配到它。
        // 静态字体用固定值(如 '400'/'700')。
        if (typeof document !== 'undefined') {
          try {
            const descriptors: FontFaceDescriptors = {
              // 可变字体用范围('100 900'),静态字体用固定值
              weight: font.variable ? '100 900' : (font.weight ?? '400'),
              style: font.style ?? 'normal',
            }
            const face = new FontFace(font.family, buffer, descriptors)
            await face.load()
            document.fonts.add(face)
          } catch (e) {
            // 注册失败不阻塞(可能字体格式不支持 FontFace,如 woff 在某些环境)
            console.warn(`[bake-svg] FontFace 注册失败(${font.family}/${font.weight}),源 HTML 可能用 fallback 字体`, e)
          }
        }

        // 所有字体统一用 harfbuzzjs 解析
        const hbFont = createHarfbuzzFont(buffer)
        // 可变字体:按 FontConfig.weight 设默认轴值(运行时会被 text.ts 按 CSS weight 覆盖)
        if (font.variable) {
          const defaultWeight = parseInt(font.weight ?? '400')
          if (!isNaN(defaultWeight)) hbFont.setVariation('wght', defaultWeight)
        }
        font.harfbuzz = hbFont
      }
    },

    // Clear cache and delete all resources
    destroy: function () {
      cache.clear()
      cleanup()
      for (const font of fonts) delete font.harfbuzz
    },

    // Render the HTML container as a shadow SVG
    render: async function (root, options = {}, transform) {
      cleanup()
      const viewBox = root.getBoundingClientRect()

      // Create the SVG container
      const svg = $('svg', {
        viewBox: `0 0 ${viewBox.width} ${viewBox.height}`,
        width: viewBox.width,
        height: viewBox.height,
        preserveAspectRatio: 'none'
      })

      const defs = $('defs', null, svg)

      // Set context to root SVG.
      // Context will change during walk push/pop
      const Context = (() => {
        const stack: SVGElement[] = [svg]
        const pop = (): void => {
          if (stack.length > 0) stack.pop()
        }
        const push = (): void => {
          stack.push($('g', null, lastOf(stack)))
        }
        return {
          pop,
          push,
          get current(): SVGElement {
            return lastOf(stack) as SVGElement
          },
          apply: (depth: number): void => {
            const deltaDepth = depth - (stack.length - 1)
            for (let i = 0; i < -deltaDepth; i++) pop()
            for (let i = 0; i < deltaDepth; i++) push()
          }
        }
      })()

      // z-index 缓存:原版把 zIndex 直接挂在 Element 上(hacky),这里用 WeakMap 更干净
      const zIndexCache = new WeakMap<Element, number>()

      // Render every children
      await walk(root, async (element, depth) => {
        if (ignore && element !== root && element.matches(ignore)) return
        Context.apply(depth)

        const el = element as HTMLElement

        // Extract geometric and style data from element
        const style = window.getComputedStyle(element)
        const matrix = element !== root && parseTransform(style.getPropertyValue('transform'))
        const opacity = style.getPropertyValue('opacity')
        const mixBlendMode = style.getPropertyValue('mix-blend-mode')
        const clipPath = style.getPropertyValue('clip-path')
        const overflow = style.getPropertyValue('overflow')

        // Temporarily remove transformation to simplify coordinates calc
        if (matrix) {
          // WARNING this will cause issues with concurent renderings:
          // cleanup() is called before to ensure purity
          detransformed.set(el, el.style.transform)
          el.style.transform = 'none'
        }

        const { x, y, width, height } = el.getBoundingClientRect()

        // Create a new context
        if (
          +opacity !== 1 ||
          matrix ||
          mixBlendMode !== 'normal' ||
          overflow === 'hidden' ||
          clipPath !== 'none'
        ) Context.push()

        const current = Context.current
        const ctxProps: ElementProps = {
          x: x - viewBox.x,
          y: y - viewBox.y,
          width,
          height,
          style,
          viewBox,
          defs
        }

        // Handle opacity
        if (+opacity !== 1) {
          current.setAttribute('opacity', opacity)
        }

        // Handle mix-blend-mode
        if (mixBlendMode !== 'normal') {
          current.style.mixBlendMode = mixBlendMode
        }

        // Handle transformation
        if (matrix) {
          current.setAttribute('transform', matrix.toSVGTransform({
            x: x - viewBox.x,
            y: y - viewBox.y,
            origin: style.getPropertyValue('transform-origin')
              .split(' ')
              .map(v => parseFloat(v)) as [number, number]
          }))
        }

        // Handle overflow: hidden
        if (overflow === 'hidden') {
          const clipPathEl = $('clipPath', { id: 'clip_' + uid() }, defs, [
            $('rect', {
              x: x - viewBox.x,
              y: y - viewBox.y,
              width,
              height
            })
          ])

          current.setAttribute('clip-path', `url(#${clipPathEl.id})`)
        }

        // Handle CSS clip-path property
        if (clipPath !== 'none') {
          // WARNING: CSS clip-path implementation is not done yet on arnaudjuracek/svg-to-pdf
          current.setAttribute('style', `clip-path: ${clipPath.replace(/"/g, "'")}`)
        }

        // Render element
        const render = elementRenderers[el.tagName] ?? elementRenderers.div
        let rendered = await render(element, ctxProps, options)

        if (transform) rendered = await transform(element, rendered)
        if (rendered) current.appendChild(rendered)

        // Render text nodes inside the element
        // ⚠️ 逐字独立渲染:每个字符自己建 Range、自己量 bbox、自己渲染。
        // 不分行、不攒数组、不做索引配对 —— 字符在哪浏览器量出来在哪,就画在哪。
        const g = $('g', { class: 'text' })
        const charRange = document.createRange()
        for (const childNode of element.childNodes) {
          if (childNode.nodeType !== Node.TEXT_NODE) continue
          const textNode = childNode as Text
          const len = textNode.textContent?.length ?? 0
          for (let i = 0; i < len; i++) {
            const ch = textNode.textContent![i]
            if (ch.match(/\s/)) continue  // 跳过纯空白(不渲染)

            try {
              // 该字符自己的 bbox(viewport 坐标)
              charRange.setStart(textNode, i)
              charRange.setEnd(textNode, i + 1)
              const charRect = charRange.getBoundingClientRect()
              if (charRect.width === 0) continue  // 零宽字符跳过

              let text = await textRenderer(
                ch,
                {
                  x: charRect.x - viewBox.x,
                  y: charRect.y - viewBox.y,
                  width: charRect.width,
                  height: charRect.height,
                  style
                }
              )

              if (transform) text = await transform(element, text)
              if (text) g.appendChild(text)
            } catch (error) {
              console.warn(`Rendering failed for char '${ch}'`, error)
            }
          }
        }

        if (g.children.length) current.appendChild(g)
      }, {
        sort: (a, b) => {
          const za = zIndexCache.get(a) ?? getZIndex(a)
          const zb = zIndexCache.get(b) ?? getZIndex(b)
          if (!zIndexCache.has(a)) zIndexCache.set(a, za)
          if (!zIndexCache.has(b)) zIndexCache.set(b, zb)
          return za - zb
        }
      })

      cleanup()
      return svg
    }
  }
}

// 导出类型与子模块,便于外部按需使用
export type { FontConfig, ElementProps, RenderOptions } from './types'
export type { SVGElementTagMap, SVGTagName } from './utils/dom-render-svg'
export type { SVGElementOf } from './utils/dom-render-svg'
