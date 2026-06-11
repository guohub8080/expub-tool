import type { ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 横向滑动视口容器
 *
 * 将多个子组件排列在横向轨道上，用户可以左右滑动浏览。
 * 支持 exposedPercent 实现下一张部分透出效果。
 *
 * @param items           - 子组件数组
 * @param exposedPercent  - 每个 item 占视口宽度的百分比（默认按 items 数量等分）
 * @param isReverse       - 是否反向排列（rtl）
 * @param spacing         - 外边距配置
 */
const SwipeViewXContainer = (props: {
  items?: ReactNode[]
  exposedPercent?: number
  isReverse?: boolean
  spacing?: T_SpacingProps
}) => {
  const isReverse = defaultTo(props.isReverse, false)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const items = defaultTo(props.items, [])
  if (items.length === 0) return null

  const groupCount = items.length
  // childWidthPercent 始终是轨道的 1/N（相对轨道父元素）
  const childWidthPercent = 100 / groupCount
  // exposedPercent 控制每个 item 占视口宽度的百分比
  // 不传时轨道 = N*100%（默认等分），传入时轨道 = N * exposedPercent%
  // 例：N=3, exposedPercent=80 → 轨道 240%，item=80%视口，露出下一张 20%
  const totalWidthPercent = props.exposedPercent
    ? groupCount * props.exposedPercent
    : groupCount * 100
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'swipe-view-x-container' } : {})}
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

export default SwipeViewXContainer
