import type { ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import type { T_SnapAlign, T_ViewBox } from '@svg/types'

/**
 * 纵向吸附滑动视口容器（抖音效果）
 *
 * 在 SlideViewYContainer 基础上增加 scroll snap 吸附效果，
 * 滑动松手后自动对齐到最近的一页。
 *
 * @param items       - 子组件数组
 * @param viewBox     - 视口尺寸 {w, h}
 * @param isReverse   - 是否反向排列
 * @param isBottomUp  - 是否底部向上滑动（180° 翻转）
 * @param snapAlign   - 吸附对齐方式，默认 'start'
 * @param spacing     - 外边距配置
 */
const SnapSlideViewYContainer = (props: {
  items?: ReactNode[]
  viewBox: Required<T_ViewBox>
  isReverse?: boolean
  isBottomUp?: boolean
  snapAlign?: T_SnapAlign
  spacing?: T_SpacingProps
}) => {
  const isReverse = defaultTo(props.isReverse, false)
  const isBottomUp = defaultTo(props.isBottomUp, false)
  const snapAlign: T_SnapAlign = defaultTo(props.snapAlign, 'start')
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const items = defaultTo(props.items, [])
  if (items.length === 0) return null

  const aspectRatio = `${props.viewBox.w} / ${props.viewBox.h}`
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'snap-slide-view-y-container' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'text',
        overflow: 'hidden scroll',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        textAlign: 'center',
        lineHeight: 0,
        aspectRatio,
        transform: isBottomUp ? 'rotate(180deg)' : undefined,
        ...spacingResult
      }}
    >
      <section style={{
        display: 'flex',
        flexDirection: isReverse ? 'column-reverse' : 'column',
        width: '100%',
        lineHeight: 0,
      }}>
        {items.map((item, idx) => (
          <section key={idx} style={{
            width: '100%',
            flex: 'none',
            verticalAlign: 'top',
            lineHeight: 0,
            overflow: 'hidden',
            scrollSnapAlign: snapAlign,
            transform: isBottomUp ? 'rotate(180deg)' : undefined,
          }}>
            {item}
          </section>
        ))}
      </section>
    </SectionEx>
  )
}

export default SnapSlideViewYContainer
