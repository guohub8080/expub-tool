import $ from '../utils/dom-render-svg'
import type { ElementRenderer } from '../types'

/**
 * <canvas> renderer:把 canvas 内容导出为 PNG dataURL,放进 SVG <image>。
 */
const CanvasRenderer: ElementRenderer = ({ debug, fonts }) =>
  async (element, { x, y, width, height }) => {
    return $('image', {
      x,
      y,
      width,
      height,
      href: (element as HTMLCanvasElement).toDataURL('image/png')
    })
  }

export default CanvasRenderer
