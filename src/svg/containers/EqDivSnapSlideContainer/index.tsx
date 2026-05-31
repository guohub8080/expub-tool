import type { ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 等分吸附横向滑动容器
 *
 * 在 EqDivSlideXContainer 基础上增加 scroll snap 吸附效果，
 * 滑动时子组件会自动对齐到指定位置（start / center / end），
 * 实现类似轮播的"翻页"体验。
 *
 * 与 EqDivSlideXContainer 的区别：
 * - scrollSnapType: x mandatory  → 强制横向吸附
 * - scrollBehavior: smooth       → 平滑滚动
 * - scrollSnapAlign              → 每个子组件设置对齐方式
 * - pointerEvents: auto          → 确保滚动区域可交互
 *
 * @param items      - 子组件数组
 * @param isReverse  - 是否反向排列（rtl）
 * @param spacing    - 外边距配置
 * @param snapAlign  - 吸附对齐方式，默认 'center'
 */
const EquallyDividedSnapSlideContainer = (props: {
  items?: ReactNode[]
  isReverse?: boolean
  spacing?: T_SpacingProps
  snapAlign?: 'start' | 'center' | 'end'
}) => {
  const isReverse = defaultTo(props.isReverse, false)
  const snapAlign = defaultTo(props.snapAlign, 'center')
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const items = defaultTo(props.items, [])
  if (items.length === 0) return null

  const groupCount = items.length
  const totalWidthPercent = groupCount * 100
  const childWidthPercent = 100 / groupCount
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'equally-divided-snap-slide-container' } : {})}
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

export default EquallyDividedSnapSlideContainer
