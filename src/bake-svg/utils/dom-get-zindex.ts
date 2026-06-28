/**
 * 读取元素的 z-index。
 * 原版逻辑:取 computed style 的 z-index,'auto' → 0,否则 parseInt。
 * 用于 walk() 的 sort:按 z-index 重排子元素,保证堆叠顺序正确。
 */
export default function getZIndex(el: Element): number {
  const zindex = window.getComputedStyle(el).getPropertyValue('z-index')
  return zindex === 'auto' ? 0 : parseInt(zindex ?? '0', 10)
}
