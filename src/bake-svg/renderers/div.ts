// TODO[refactor] split into smaller functions

import $ from '../utils/dom-render-svg'
import { parse as parseGradient } from 'gradient-parser'
import { uid } from 'uid'

import ImageRenderer from './image'
import type { ElementRenderer } from '../types'

const kebabToCamel = (s: string): string => s.replace(/-./g, x => x[1].toUpperCase())

export function isTransparent(color: string | null | undefined): boolean {
  if (!color || color === 'none' || color === 'transparent') return true

  if (color.startsWith('rgba')) {
    const rgba = color.match(/[\d.]+/g)
    if (rgba && rgba[3] === '0') return true
  }

  return false
}

interface BorderInfo {
  color: string
  width: number
  style: string
}

type Borders = Record<'top' | 'right' | 'bottom' | 'left', BorderInfo> | null

function parseBorders(s: CSSStyleDeclaration): Borders {
  const acc: Partial<Record<'top' | 'right' | 'bottom' | 'left', BorderInfo>> = {}

  for (const dir of ['top', 'right', 'bottom', 'left'] as const) {
    const color = s.getPropertyValue(`border-${dir}-color`)
    // ⚠️ 用 parseFloat 不用 parseInt:浏览器对 border-width 可能做缩放(如 2px → 1.81818px),
    // parseInt 会截断小数(1.81818 → 1),导致 border 比实际细。
    const width = parseFloat(s.getPropertyValue(`border-${dir}-width`))
    const style = s.getPropertyValue(`border-${dir}-style`)

    // Skip invisible
    if (isTransparent(color)) continue
    if (!width || isNaN(width)) continue
    if (style === 'none' || style === 'hidden') continue

    acc[dir] = { color, width, style }
  }

  const keys = Object.keys(acc) as Array<keyof typeof acc>
  return keys.length ? (acc as Borders) : null
}

function getImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise(resolve => {
    const image = new Image()
    image.onload = () => resolve({ width: image.width, height: image.height })
    image.src = url
  })
}

/**
 * div renderer(也作为所有未匹配标签的 fallback):
 * 渲染背景色、背景图(url / 渐变)、box-shadow、边框、圆角。
 */
const DivRenderer: ElementRenderer = ({ debug, fonts, cache }) =>
  async (element, { x, y, width, height, style, defs }) => {
    if (!width || !height) return

    const backgroundColor = style.getPropertyValue('background-color')
    const backgroundImage = style.getPropertyValue('background-image') ?? 'none'
    const boxShadow = style.getPropertyValue('box-shadow') ?? 'none'
    const borderRadius = parseInt(style.getPropertyValue('border-radius')) ?? null
    const borders = parseBorders(style)

    // Skip visually empty blocks
    if (isTransparent(backgroundColor) && isTransparent(backgroundImage) && !borders) return

    // Render initial rect
    const g = $('g')
    const rect = $('rect', {
      x,
      y,
      width,
      height,
      fill: backgroundColor,
      rx: borderRadius
    }, g)

    // Render background-image
    if (!isTransparent(backgroundImage)) {
      const url = (backgroundImage.match(/url\("?(.*?)"?\)/) ?? [])[1]

      // Render background-image
      if (url) {
        const backgroundSize = style.getPropertyValue('background-size')
        const renderImage = ImageRenderer({ debug, fonts, cache })
        // TODO handle background-size
        // TODO handle background-repeat
        const size = await getImageSize(url)
        const image = await renderImage({ src: url } as unknown as HTMLElement, {
          x,
          y,
          width: Math.max(width, size.width),
          height: Math.max(height, size.height),
          style,
          viewBox: undefined as unknown as DOMRect,
          defs
        }, {})
        if (defs) {
          const clipPath = $('clipPath', { id: 'clip_' + uid() }, defs, [
            $('rect', { x, y, width, height })
          ])
          image?.setAttribute('clip-path', `url(#${clipPath.id})`)
        }
        if (image) g.appendChild(image)
      } else {
        // TODO handle multiple gradients
        const gradientAst = parseGradient(backgroundImage)?.[0]
        if (gradientAst) {
          const { colorStops, orientation, type } = gradientAst

          // TODO handle repeating gradients type, SEE https://github.com/rafaelcarcio/gradient-parser?tab=readme-ov-file#ast
          const gradient = $(kebabToCamel(type), {
            id: 'gradient_' + uid(),
            gradientUnits: 'objectBoundingBox', // Allow specifying rotation center in %
            gradientTransform: orientation
              ? (() => {
                  // 仅 linear 的 orientation 是 DirectionalNode | AngularNode
                  const o = orientation as
                    | { type: 'angular'; value: string }
                    | { type: 'directional'; value: string }
                  if (o.type === 'angular') {
                    return `rotate(${270 + parseFloat(o.value)}, 0.5, 0.5)`
                  }
                  // directional
                  switch (o.value) {
                    case 'top': return 'rotate(270, 0.5, 0.5)'
                    case 'right': return null
                    case 'bottom': return 'rotate(90, 0.5, 0.5)'
                    case 'left': return 'rotate(180, 0.5, 0.5)'
                  }
                  return undefined
                })()
              : 'rotate(90, 0.5, 0.5)'
          }, defs)

          // Add color stops
          for (let index = 0; index < colorStops.length; index++) {
            const colorStop = colorStops[index]
            const stop = $('stop', {
              offset: colorStop.length
                // TODO handle colorStop.length.type other than '%'
                ? +('value' in colorStop.length ? colorStop.length.value : '0') / 100
                : index / (colorStops.length - 1),
              'stop-color': `${colorStop.type}(${(colorStop as { value: string | string[] }).value})`
            })

            gradient.appendChild(stop)
          }

          rect.setAttribute('fill', `url(#${gradient.id})`)
        }
      }
    }

    // Render box shadow
    if (boxShadow !== 'none') {
      const filter = $('filter', { id: 'filter_' + uid() }, defs)
      // This assumes browser consistency of the CSSStyleDeclaration.getPropertyValue returned string
      const REGEX_SHADOW_DECLARATION = /rgba?\(([\d.]{1,3}(,\s)?){3,4}\)\s(-?(\d+)px\s?){4}/g
      const REGEX_SHADOW_DECLARATION_PARSER = /(rgba?\((?:[\d.]{1,3}(?:,\s)?){3,4}\))\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px\s(-?[\d.]+)px/

      for (const shadowString of boxShadow.match(REGEX_SHADOW_DECLARATION) ?? []) {
        const match = shadowString.match(REGEX_SHADOW_DECLARATION_PARSER)!
        const [, color, offxStr, offyStr, blurStr, spreadStr] = match
        const offx = parseInt(offxStr)
        const offy = parseInt(offyStr)
        const spread = parseInt(spreadStr)

        filter.appendChild($('feGaussianBlur', { stdDeviation: (parseFloat(blurStr)) / 2 }))

        const shadow = $('rect', {
          x: x + offx - spread,
          y: y + offy - spread,
          width: width + spread * 2,
          height: height + spread * 2,
          fill: color,
          rx: borderRadius,
          filter: `url(#${filter.id})`
        })

        g.prepend(shadow)
      }
    }

    // Render border
    // ⚠️ 用 props 传来的尺寸(span.ts 按行算好的,或 index.ts 的元素测量值)。
    // 不自己重新量 element —— 那对 inline span 跨行会得到整体外接框(错)。
    // span.ts 已经按 justify 规则算好每行的 bgX/bgW/bgH,div.ts 信任它。
    if (!borderRadius) {
      for (const [dir, border] of Object.entries(borders ?? {})) {
        const info = border as BorderInfo
        const bw = info.width
        let borderRect: { x: number; y: number; width: number; height: number }
        switch (dir) {
          case 'top':
            borderRect = { x, y, width, height: bw }
            break
          case 'bottom':
            borderRect = { x, y: y + height - bw, width, height: bw }
            break
          case 'left':
            borderRect = { x, y, width: bw, height }
            break
          case 'right':
            borderRect = { x: x + width - bw, y, width: bw, height }
            break
          default:
            continue
        }

        $('rect', {
          x: borderRect.x,
          y: borderRect.y,
          width: borderRect.width,
          height: borderRect.height,
          fill: info.color,
          ...(() => {
            switch (info.style) {
              case 'dotted': return {
                fill: 'none',
                stroke: info.color,
                'stroke-width': bw,
                'stroke-dasharray': [0, bw * 2].join(' '),
                'stroke-dashoffset': 1,
                'stroke-linejoin': 'round',
                'stroke-linecap': 'round'
              }
              case 'dashed': return {
                fill: 'none',
                stroke: info.color,
                'stroke-width': bw,
                'stroke-dasharray': [bw * 2, 4].join(' ')
              }
              default: return {}  // solid:用 rect fill
            }
          })()
        }, g)
      }
    } else if (borders?.top) {
      // border-radius 分支:用 CSS 声明的 borderRadius(测量值)直接画,不内缩。
      // 原版用 borderRadius - bw/2 推算内缩(不准)。
      // 改成:背景用完整圆角 rect,border 用 stroke 画在外圆角(border-box)上。
      rect.setAttribute('stroke', borders.top.color)
      rect.setAttribute('stroke-width', String(borders.top.width))
      // 圆角半径用 CSS 声明值,不内缩(stroke 会从路径中心向两侧扩散,天然覆盖 border 区域)
      rect.setAttribute('rx', String(borderRadius))
      // 不再改 x/y/width/height(用原始测量值,不内缩)
    }

    return g
  }

export default DivRenderer
