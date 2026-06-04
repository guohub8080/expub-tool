import type { ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 横向吸附滑动视口容器
 *
 * 在 SwipeViewXContainer 基础上增加 scroll snap 吸附效果，
 * 滑动时子组件会自动对齐到指定位置（start / center / end）。
 *
 * @param items           - 子组件数组
 * @param exposedPercent  - 每个 item 占视口宽度的百分比（默认按等分）
 * @param isReverse       - 是否反向排列（rtl）
 * @param spacing         - 外边距配置
 * @param snapAlign       - 吸附对齐方式，默认 'center'
 */
import type { T_SnapAlign } from '@svg/types'

const SnapSwipeViewXContainer = (props: {
  items?: ReactNode[]
  exposedPercent?: number
  isReverse?: boolean
  spacing?: T_SpacingProps
  snapAlign?: T_SnapAlign
}) => {
  const isReverse = defaultTo(props.isReverse, false)
  const snapAlign: T_SnapAlign = defaultTo(props.snapAlign, 'center')
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const items = defaultTo(props.items, [])
  if (items.length === 0) return null

  const groupCount = items.length
  const childWidthPercent = 100 / groupCount
  const totalWidthPercent = props.exposedPercent
    ? groupCount * props.exposedPercent
    : groupCount * 100
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'snap-swipe-view-x-container' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'text',
        overflow: 'hidden',
        textAlign: 'center',
        lineHeight: 0,
        ...spacingResult
      }}
    >
      {/* 滚动层：横向滚动 + scroll snap 吸附 */}
      <section style={{
        overflow: 'scroll hidden',
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        margin: 0,
        lineHeight: 0,
        pointerEvents: 'auto',
        direction: isReverse ? 'rtl' : 'ltr',
      }}>
        {/* 轨道层 */}
        <SectionEx
          important={[['width', `${totalWidthPercent}%`], ['max-width', `${totalWidthPercent}%`]]}
          style={{ whiteSpace: 'nowrap', lineHeight: 0, display: 'flex' }}
        >
          {items.map((comp, idx) => (
            <section key={idx} style={{
              width: `${childWidthPercent}%`,
              flex: `0 0 ${childWidthPercent}%`,
              verticalAlign: 'top',
              lineHeight: 0,
              overflow: 'hidden',
              scrollSnapAlign: snapAlign,
            }}>
              {comp}
            </section>
          ))}
        </SectionEx>
      </section>
    </SectionEx>
  )
}

export default SnapSwipeViewXContainer
