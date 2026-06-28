import $ from '../utils/dom-render-svg'
import type { ElementRenderer } from '../types'

/**
 * <img> renderer:把 HTML <img> 转成 SVG <image>。
 * 无尺寸或无 src 时跳过。
 */
const ImageRenderer: ElementRenderer = ({ debug, fonts }) =>
  async (element, { x, y, width, height }) => {
    if (!width || !height) return
    const src = (element as HTMLImageElement).src
    if (!src) return

    return $('image', {
      x,
      y,
      width,
      height,
      href: src
    })
  }

export default ImageRenderer
