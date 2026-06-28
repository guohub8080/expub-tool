/**
 * bake-svg 共享类型定义
 *
 * 逻辑保持原版,只补类型。Renderer 采用「柯里化工厂」签名:
 * 第一层注入全局配置(debug/fonts/cache),第二层是渲染函数本身。
 */
import type * as Transform from 'transformation-matrix'

/* -------------------------------------------------------------------------- */
/* 字体配置                                                                     */
/* -------------------------------------------------------------------------- */

/** 字体配置项,preload() 后会挂上已解析的 harfbuzz 字体对象。
 *
 * 所有字体统一用 harfbuzzjs 渲染(不再用 opentype.js —— 它对 woff/中文支持有缺陷)。
 * 字重来源:
 * - 静态字体(variable=false,默认):一个文件一个固定字重,weight 字段标识该文件的字重。
 *   字重选择靠「匹配不同文件」(如 Regular.ttf=400 + Bold.ttf=700),不靠运行时切轴。
 * - 可变字体(variable=true):一个文件覆盖所有字重,运行时按 CSS weight 切 wght 轴。
 *   用户在配置里声明 variable:true 即可(如 Inter-Variable.ttf)。
 */
export interface FontConfig {
  /** CSS font-family 名 */
  family: string
  /** 字体文件 URL(同源或已开 CORS 的源)。⚠️ 必须是 ttf/otf,harfbuzzjs 不支持 woff */
  url: string
  /** CSS font-weight,默认 '400'。
   *  静态字体:该文件的固定字重;可变字体:默认轴值(preload 后可被 CSS weight 覆盖) */
  weight?: string
  /** CSS font-style,默认 'normal' */
  style?: string
  /** 是否可变字体(含 wght 轴)。可变字体运行时按 CSS weight 切轴;静态字体靠选不同文件 */
  variable?: boolean
  /** preload() 后挂载:harfbuzz 适配层字体(所有字体统一走这个) */
  harfbuzz?: import('./harfbuzz-font').HarfbuzzFont
}

/* -------------------------------------------------------------------------- */
/* 全局配置                                                                     */
/* -------------------------------------------------------------------------- */

/** 构造器第一层注入的全局配置 */
export interface GlobalContext {
  debug: boolean
  fonts: FontConfig[]
  cache: Map<string, string>
}

/* -------------------------------------------------------------------------- */
/* 几何 / 样式 Props                                                            */
/* -------------------------------------------------------------------------- */

/** 与 viewBox 的相对坐标(已减去 viewBox 偏移) */
export interface ElementProps {
  x: number
  y: number
  width: number
  height: number
  /** 浏览器算出的最终样式 */
  style: CSSStyleDeclaration
  /** 整个渲染区域的视口,用于坐标换算 */
  viewBox: DOMRect
  /** SVG <defs> 容器,供 div/svg renderer 注册渐变/滤镜/裁剪 */
  defs?: SVGDefsElement
}

/** text renderer 用的 props(无 viewBox/defs) */
export interface TextProps {
  x: number
  y: number
  width: number
  height: number
  style: CSSStyleDeclaration
}

/* -------------------------------------------------------------------------- */
/* 渲染选项                                                                     */
/* -------------------------------------------------------------------------- */

/** render(root, options) 的 options */
export interface RenderOptions {
  /** 是否把内联 SVG 光栅化为 <image>(默认 true) */
  rasterizeNestedSVG?: boolean
}

/* -------------------------------------------------------------------------- */
/* Renderer 签名                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Renderer 的类型层次(柯里化两层):
 *
 * 1. RenderFactory:工厂,接收 GlobalContext,返回 BoundRenderer
 *    例:div({debug, fonts, cache}) => boundDiv
 *
 * 2. BoundRenderer:已绑定 ctx 的渲染函数,index.ts 的注册表里存的是这种
 *    例:boundDiv(element, props, options) => Promise<SVGElement|null>
 *
 * 关键:index.ts 调用时用的是 BoundRenderer(第二层),不是工厂(第一层)。
 */

/** 已绑定 ctx 的元素渲染函数 */
export type BoundElementRenderer = (
  element: HTMLElement | SVGElement | Node,
  props: ElementProps,
  options: RenderOptions
) => Promise<SVGElement | null | undefined>

/** 已绑定 ctx 的文本渲染函数 */
export type BoundTextRenderer = (
  string: string,
  props: TextProps
) => Promise<SVGElement | null | undefined>

/** 元素 renderer 工厂 */
export type ElementRenderer = (ctx: GlobalContext) => BoundElementRenderer

/** Text renderer 工厂 */
export type TextRenderer = (ctx: GlobalContext) => BoundTextRenderer

/** 所有 renderer 工厂的联合 */
export type AnyRenderer = ElementRenderer | TextRenderer

/* -------------------------------------------------------------------------- */
/* transform 工具(来自 parse-transform)                                        */
/* -------------------------------------------------------------------------- */

/** parseTransform 返回的可调用 transform 对象 */
export interface ParsedTransform {
  raw: string
  translate: { tx: number; ty: number } | undefined
  scale: { sx: number; sy: number } | undefined
  rotation: { angle: number } | undefined
  /** 转成 SVG transform 字符串 */
  toSVGTransform: (opts: {
    x?: number
    y?: number
    origin?: [number, number]
  }) => string
}

export type { Transform }
