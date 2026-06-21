import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import isNil from 'lodash/isNil'
import { isDefined } from '@utils/fn/isDefined'
import type { I_CascadeContent } from '../types'

/**
 * 渲染 url 或 jsx 内容单元（统一路径）：
 * - jsx 优先：有 jsx 直接渲染
 * - url：渲染成带 background-image 的 SVG（拉伸铺满，viewBox = width×height）
 * - 都为空：返回 null
 */
export function CascadeContent({ content, width, height }: {
  content: I_CascadeContent
  width: number
  height: number
}) {
  if (isDefined(content.jsx)) return <>{content.jsx}</>
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
