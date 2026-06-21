import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import svgURL from '@utils/svg/svgURL'
import { isDefined } from '@utils/fn/isDefined'
import type { I_SwipePagerProps, I_SwipePagerContent } from './types'

export type { I_SwipePagerProps, I_SwipePagerContent } from './types'

/**
 * 渲染单个内容单元（url 或 jsx），统一路径：
 * - jsx 优先：有 jsx 直接渲染
 * - url：渲染成带 background-image 的 SVG（拉伸铺满）
 * - 都为空：返回 null（该单元不渲染）
 */
function SwipePagerContent({ content, width, height }: {
  content: I_SwipePagerContent
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

/**
 * SwipePager — 横向可抽拉分页器
 *
 * N 个满屏 slide 排在横向轨道上，用户自由抽拉（横向滚动）浏览，不吸附。
 * 容器背景独立成一层（零高 + overflow visible），渲染在轨道背后。
 *
 * 结构：
 * - 滚动层：overflow: scroll hidden（横向自由滚动）
 * - 轨道：display:flex，width = N×100%（!important 强制，防微信剥样式）
 * - slide：width = 100/N%（相对轨道 → 恰好满视口宽），高度由 viewBox 宽高比撑出
 */
const SwipePager = (props: I_SwipePagerProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  const canvasWidth = props.canvasSize.w
  const canvasHeight = props.canvasSize.h
  const peekWidth = defaultTo(props.peekWidth, 0)
  if (peekWidth < 0 || peekWidth >= canvasWidth) {
    throw new Error(`SwipePager: peekWidth 须在 [0, ${canvasWidth}) 内，当前为 ${peekWidth}`)
  }
  const items = props.items
  const groupCount = items.length

  // peekWidth（viewBox 单位）→ 每个 slide 占 (canvasWidth - peekWidth)，下一张露出 peekWidth
  // 对应 exposedPercent = (canvasWidth - peekWidth) / canvasWidth × 100
  const exposedPercent = ((canvasWidth - peekWidth) / canvasWidth) * 100
  // 轨道总宽 = N × exposedPercent%；每个 slide 相对轨道仍 100/N%（恰好 exposedPercent% 视口宽）
  const trackWidthPercent = groupCount * exposedPercent
  const slideWidthPercent = groupCount > 0 ? 100 / groupCount : 0

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'swipe-pager' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        overflow: 'hidden',
        textAlign: 'center',
        lineHeight: 0,
        ...spacingResult,
      }}
    >
      {/* 容器背景层：零高 + overflow visible，渲染在轨道背后（slide 透明处可见） */}
      {isDefined(props.canvasBg) && (
        <section style={canvasBgLayerStyle}>
          <SwipePagerContent content={props.canvasBg} width={canvasWidth} height={canvasHeight} />
        </section>
      )}

      {/* 滚动层：横向自由抽拉 */}
      <section style={scrollLayerStyle}>
        {/* 轨道：width = N×100%，important 强制生效 */}
        <SectionEx
          important={[
            ['width', `${trackWidthPercent}%`],
            ['max-width', `${trackWidthPercent}%`],
          ]}
          style={trackStyle}
        >
          {items.map((item, idx) => (
            <section
              key={idx}
              style={{
                width: `${slideWidthPercent}%`,
                flex: `0 0 ${slideWidthPercent}%`,
                verticalAlign: 'top',
                lineHeight: 0,
                overflow: 'hidden',
              }}
            >
              <SwipePagerContent content={item} width={canvasWidth} height={canvasHeight} />
            </section>
          ))}
        </SectionEx>
      </section>
    </SectionEx>
  )
}

export default SwipePager

const canvasBgLayerStyle: CSSProperties = {
  height: 0,
  overflow: 'visible',
  width: '100%',
  margin: 0,
  pointerEvents: 'none',
  lineHeight: 0,
}

const scrollLayerStyle: CSSProperties = {
  overflow: 'scroll hidden',
  margin: 0,
  lineHeight: 0,
}

const trackStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  lineHeight: 0,
  display: 'flex',
}
