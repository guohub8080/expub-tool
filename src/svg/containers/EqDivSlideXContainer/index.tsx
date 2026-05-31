import type { ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 等分横向滑动容器
 *
 * 将多个子组件等分排列在横向轨道上，用户可以左右滑动浏览。
 * 每个子组件宽度 = 容器宽度 / 子组件数量，所有子组件拼成一条横向轨道，
 * 通过 overflow: scroll 实现横向滚动。
 *
 * 结构：
 * ┌─ 外层 SectionEx ─────────────────────────┐
 * │  overflow: hidden（裁剪溢出）              │
 * │  ┌─ 滚动层 section ─────────────────────┐ │
 * │  │  overflow: scroll hidden              │ │
 * │  │  ┌─ 轨道 SectionEx ───────────────┐  │ │
 * │  │  │  width: N*100%（important 强制） │  │ │
 * │  │  │  display: flex, nowrap          │  │ │
 * │  │  │  ┌──────┐ ┌──────┐ ┌──────┐    │  │ │
 * │  │  │  │ comp1│ │ comp2│ │ comp3│    │  │ │
 * │  │  │  └──────┘ └──────┘ └──────┘    │  │ │
 * │  │  └────────────────────────────────┘  │ │
 * │  └──────────────────────────────────────┘ │
 * └────────────────────────────────────────────┘
 *
 * @param items      - 子组件数组，每个元素占一等分宽度
 * @param isReverse  - 是否反向排列（rtl），滚动起始位置变为右侧
 * @param spacing    - 外边距配置
 */
const EquallyDividedSlideContainer = (props: {
  items?: ReactNode[]
  isReverse?: boolean
  spacing?: T_SpacingProps
}) => {
  const isReverse = defaultTo(props.isReverse, false)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const items = defaultTo(props.items, [])
  if (items.length === 0) return null

  // 根据子组件数量计算等分比例
  // 例：3 个子组件 → 轨道总宽 300%，每个子组件 33.33%
  const groupCount = items.length
  const totalWidthPercent = groupCount * 100
  const childWidthPercent = 100 / groupCount
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'equally-divided-slide-container' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'text',
        overflow: 'hidden',
        textAlign: 'center',
        lineHeight: 0,
        ...spacingResult
      }}
    >
      {/* 滚动层：横向滚动，overflow-x scroll / overflow-y hidden */}
      <section style={{
        overflow: 'scroll hidden',
        margin: 0,
        lineHeight: 0,
        direction: isReverse ? 'rtl' : 'ltr',
      }}>
        {/* 轨道层：总宽度 = 子组件数量 × 100%，通过 important 强制生效 */}
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
            }}>
              {comp}
            </section>
          ))}
        </SectionEx>
      </section>
    </SectionEx>
  )
}

export default EquallyDividedSlideContainer
