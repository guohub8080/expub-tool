import $ from '../utils/dom-render-svg'
import type { ElementRenderer } from '../types'

/**
 * 内联 <svg> renderer:
 * - 把内部所有 <image href> 转成 dataURL(最大化兼容性)
 * - 默认把整个 svg 序列化成 base64 包进 <image>(rasterizeNestedSVG)
 * - 否则直接克隆结构(innerHTML)
 */
const SvgRenderer: ElementRenderer = ({ cache }) =>
  async (element, { x, y, width, height }, { rasterizeNestedSVG = true } = {}) => {
    const svgEl = element as SVGSVGElement

    // Convert all image to dataURL to maximize compatibility
    for (const image of svgEl.querySelectorAll('image[href]')) {
      const src = image.getAttribute('href') || ''

      if (!cache.has(src)) {
        // Fetch blob from image src
        const blob = await new Promise<Blob>(resolve => {
          const request = new XMLHttpRequest()
          request.open('GET', src, true)
          request.responseType = 'blob'
          request.onload = () => resolve(request.response)
          request.send()
        })

        // Convert blob to dataURL using the FileReader API
        const dataURL = await new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string)
          reader.readAsDataURL(blob)
        })

        // Cache dataURL
        cache.set(src, dataURL)
      }

      image.setAttribute('href', cache.get(src) as string)
    }

    if (rasterizeNestedSVG) {
      return $('image', {
        x,
        y,
        width,
        height,
        href: 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svgEl))
      })
    }

    const innerSvg = $('svg', {
      x,
      y,
      width,
      height,
      viewbox: `0 0 ${width} ${height}`
    })
    innerSvg.innerHTML = svgEl.innerHTML
    return innerSvg
  }

export default SvgRenderer
