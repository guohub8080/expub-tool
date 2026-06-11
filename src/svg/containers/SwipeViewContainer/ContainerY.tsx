import type { ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import type { T_CanvasSize } from '@svg/types'

/**
 * 纵向滑动视口容器
 *
 * 将多个子组件纵向排列，每页占满容器高度，用户可上下滑动浏览。
 * 通过 aspect-ratio 根据宽高比自动计算容器高度。
 *
 * @param items       - 子组件数组
 * @param canvasSize - 画布尺寸 {w, h}
 * @param isReverse   - 是否反向排列
 * @param isBottomUp  - 是否底部向上滑动（180° 翻转）
 * @param spacing     - 外边距配置
 */
const SwipeViewYContainer = (props: {
  items?: ReactNode[]
  canvasSize: Required<T_CanvasSize>
  isReverse?: boolean
  isBottomUp?: boolean
  spacing?: T_SpacingProps
}) => {
  const isReverse = defaultTo(props.isReverse, false)
  const isBottomUp = defaultTo(props.isBottomUp, false)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const items = defaultTo(props.items, [])
  if (items.length === 0) return null

  const aspectRatio = `${props.canvasSize.w} / ${props.canvasSize.h}`
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'swipe-view-y-container' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'text',
        overflow: 'hidden scroll',
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
            transform: isBottomUp ? 'rotate(180deg)' : undefined,
          }}>
            {item}
          </section>
        ))}
      </section>
    </SectionEx>
  )
}

export default SwipeViewYContainer
