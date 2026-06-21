import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { isDefined } from '@utils/fn/isDefined'
import { CascadeContent } from './components/CascadeContent'
import { CascadeSection } from './components/CascadeSection'
import type { I_CascadeSwipePagerProps } from './types'

export type { I_CascadeSwipePagerProps, I_CascadeSwipeChildItem, I_TagHandle, I_CascadeContent } from './types'

/**
 * CascadeSwipePager — 多卡抽拉分页器
 *
 * N 个抽拉卡以零高视差叠在同一画布上（复刻参考层化）；每卡含一个右侧把手
 * （手动 w/h/y，x 自动靠右）+ 一组横向面板 content（向左抽拉）。
 * 把手是全段唯一 pointer-events:visible，但不接点击动作（参考原样未接）。
 *
 * 注意：各卡零高叠加，只有 DOM 最后一张完全可见，其余靠面板图透明处透出。
 */
const CascadeSwipePager = (props: I_CascadeSwipePagerProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  const canvasWidth = props.canvasSize.w
  const canvasHeight = props.canvasSize.h

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'cascade-swipe-pager' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        overflow: 'hidden',
        textAlign: 'center',
        lineHeight: 0,
        ...spacingResult,
      }}
    >
      {/* 整体背景层：零高视差，渲染在所有卡背后 */}
      {isDefined(props.canvasBg) && (
        <section style={canvasBgLayerStyle}>
          <CascadeContent content={props.canvasBg} width={canvasWidth} height={canvasHeight} />
        </section>
      )}

      {/* N 个抽拉卡，零高视差叠加；把手按各自 w/h/y 摆放 */}
      {props.childItems.map((childItem, idx) => (
        <CascadeSection
          key={idx}
          childItem={childItem}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      ))}

      {/* 高程占位：所有卡为零高，靠这个透明 SVG 撑出画布高度 */}
      <SvgEx viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} style={heightGiverStyle} />
    </SectionEx>
  )
}

export default CascadeSwipePager

const canvasBgLayerStyle: CSSProperties = {
  height: 0,
  overflow: 'visible',
  width: '100%',
  margin: 0,
  pointerEvents: 'none',
  lineHeight: 0,
}

const heightGiverStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  transform: 'scale(1)',
  pointerEvents: 'none',
}
