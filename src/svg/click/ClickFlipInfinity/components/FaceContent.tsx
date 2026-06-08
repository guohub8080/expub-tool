import React from 'react'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import isNil from 'lodash/isNil'
import { isDefined } from '@utils/fn/isDefined'
import type { I_FaceContent } from '../types'

/**
 * 渲染卡牌单面内容（url 或 jsx）
 *
 * url 模式：生成带背景图的 SVG
 * jsx 模式：直接渲染用户提供的 ReactNode
 */
export function FaceContent({ content, width, height }: {
  content: I_FaceContent
  width: number
  height: number
}) {
  if (isDefined(content.jsx)) {
    return <>{content.jsx}</>
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
        backgroundSize: '100% 100%',
        backgroundPosition: '0px 0px',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
