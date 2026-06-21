import { useCallback, useRef } from 'react'
import isNil from 'lodash/isNil'
import { bakeElement } from './bake'
import type { BakeOptions, BakeResult } from './types'

/**
 * useBake — 把 ref 指向的已渲染 DOM 烘焙成矢量 SVG。
 *
 * 用法：
 * ```tsx
 * const { ref, bake } = useBake({ fontUrlMap: { MyFont: 'https://cdn/myfont.ttf' } })
 * <div ref={ref} style={{ fontFamily: 'MyFont' }}>你好</div>
 * <button onClick={async () => {
 *   const { svg } = await bake()          // 烘焙 → 矢量 SVG
 *   navigator.clipboard.writeText(svg)    // 复制，贴微信
 * }}>烘焙并复制</button>
 * ```
 *
 * `bake()` 读 `ref.current`（已渲染好的元素），遍历其 DOM → 输出原封不动的
 * 矢量 SVG（文字转曲、字体无关）。异步（要 fetch 字体给转曲用）。
 *
 * 泛型 T 传元素类型（默认 HTMLDivElement），ref 直接挂到对应元素上。
 */
export function useBake<T extends HTMLElement = HTMLDivElement>(options: BakeOptions): {
  ref: React.RefObject<T | null>
  bake: () => Promise<BakeResult>
} {
  const ref = useRef<T | null>(null)

  const bake = useCallback(async (): Promise<BakeResult> => {
    const element = ref.current
    if (isNil(element)) throw new Error('useBake: ref 还没挂载到任何元素，无法烘焙')
    return bakeElement(element, options)
  }, [options])

  return { ref, bake }
}
