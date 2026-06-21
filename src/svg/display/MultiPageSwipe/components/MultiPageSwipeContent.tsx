import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import isNil from 'lodash/isNil'
import { isDefined } from '@utils/fn/isDefined'
import type { I_MultiPageSwipeContent } from '../types'

/**
 * 渲染 url 或 jsx 内容单元（统一路径）：
 * - jsx 优先：有 jsx 直接渲染
 * - url：渲染成带 background-image 的 SVG（拉伸铺满，viewBox = width×height）
 * - 都为空：返回 null
 */
export function MultiPageSwipeContent({ content, width, height }: {
  content: I_MultiPageSwipeContent
  width: number
  height: number
}) {
  if (isDefined(content.jsx)) {
    // 包一层 pointer-events:none：让 jsx 内部元素（rect/text 等）继承 pointer-events:none，
    // 不捕获触摸 → 触摸穿透到把手槽（pointer-events:visible），保证多卡独立交互
    return <section style={{ pointerEvents: 'none' }}>{content.jsx}</section>
  }
  if (isNil(content.url)) return null

  return (
    <SvgEx
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: 'block',
        width: '100%',
        margin: 0,
        backgroundImage: svgURL(content.url),
        backgroundSize: '100%',
        backgroundPosition: '0 0',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
