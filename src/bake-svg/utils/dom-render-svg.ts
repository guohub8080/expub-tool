/**
 * 创建 SVG 元素并设置属性 / 挂载到父节点 / 追加子节点。
 *
 * 原版是无类型 `$(name, props, parent, children)`。
 * TS 精确版:按 tag 名返回精确的 SVG 元素类型(SVGRectElement / SVGGElement ...)。
 *
 * 属性值用 SVG 标准属性联合类型;数值会被 setAttribute 自动转字符串。
 * 浏览器对 SVG 属性值的大小写敏感:部分属性(如 strokeWidth)需用 camelCase。
 */
const NS = 'http://www.w3.org/2000/svg'
const XMLNS_NS = 'http://www.w3.org/2000/xmlns/'

/** SVG 属性值:支持字符串、数值、布尔;null/undefined 表示「跳过此属性」 */
export type SVGAttributeValue = string | number | boolean | null | undefined

/** SVG 元素的 props 映射 */
export type SVGProps = Record<string, SVGAttributeValue>

/**
 * tag 名 → 精确的 SVG 元素接口映射。
 * 覆盖 bake-svg 实际创建的所有标签。
 */
export interface SVGElementTagMap {
  svg: SVGSVGElement
  g: SVGGElement
  defs: SVGDefsElement
  rect: SVGRectElement
  line: SVGLineElement
  image: SVGImageElement
  path: SVGPathElement
  clipPath: SVGClipPathElement
  linearGradient: SVGLinearGradientElement
  radialGradient: SVGRadialGradientElement
  stop: SVGStopElement
  filter: SVGFilterElement
  feGaussianBlur: SVGFEGaussianBlurElement
}

/** tag 名联合类型 */
export type SVGTagName = keyof SVGElementTagMap

/** tag 名 → 对应的精确 SVG 元素类型 */
export type SVGElementOf<T extends SVGTagName> = SVGElementTagMap[T]

/** 创建结果类型:从 tag 名推导 */
export type CreateSVGResult<T extends SVGTagName | string> =
  T extends SVGTagName ? SVGElementOf<T> : SVGElement

/**
 * 创建并配置一个 SVG 元素。
 *
 * @param name    SVG 标签名
 * @param props   属性(键值对);值为 null/undefined 时跳过
 * @param parent  可选父节点,创建后立即 appendChild
 * @param children 可选子节点数组
 * @returns 创建好的 SVG 元素(已挂载到 parent)
 */
function create<T extends SVGTagName | string = string>(
  name: T,
  props?: SVGProps | null,
  parent?: SVGElement | null,
  children?: Iterable<SVGElement> | null
): CreateSVGResult<T> {
  const element = document.createElementNS(NS, name) as CreateSVGResult<T>

  // <svg> 根节点要补 xmlns 属性
  if (name === 'svg') {
    element.setAttributeNS(XMLNS_NS, 'xmlns', NS)
  }

  if (props) {
    for (const key in props) {
      const value = props[key]
      if (value === null || value === undefined) continue
      element.setAttribute(key, String(value))
    }
  }

  if (parent) {
    parent.appendChild(element)
  }

  if (children) {
    for (const child of children) {
      element.appendChild(child)
    }
  }

  return element
}

export default create
