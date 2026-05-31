import type { CSSProperties, ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import type { T_HotArea, T_ViewBox } from '@svg/types'

const HOT_AREA_DEFAULT: Required<T_HotArea> = { x: 0, y: 0, w: 100, h: 100 }
const VIEW_BOX_DEFAULT: Required<T_ViewBox> = { w: 100, h: 300 }

/**
 * 坍塌盒子 — 点击后内容消失，可选延迟坍塌 + 替换内容淡入
 *
 * 展示层（children，height:0 + overflow:visible）叠在交互层（SVG）之上。
 * 点击透明热区触发 SVG width/height 坍塌为 0，展示层随之消失。
 *
 * - 不传 afterContent → 纯坍塌消失
 * - 传 afterContent → 坍塌后显示替换内容（foreignObject + translate 移入）
 * - 传 collapseDelay → 延迟 width 坍塌 + 替换内容 opacity 淡入
 *
 * @param children        - 初始展示内容
 * @param viewBox         - 控制层 SVG viewBox {w, h}，默认 {w:100, h:300}
 * @param hotArea         - 点击热区 {x, y, w, h}，默认 {x:0, y:0, w:100, h:100}
 * @param afterContent    - 坍塌后显示的替换内容
 * @param collapseDelay   - 延迟坍塌时长（秒），同时启用 opacity 淡入
 * @param spacing         - 外边距配置
 */
const CollapsibleBox = (props: {
  viewBox?: T_ViewBox
  hotArea?: T_HotArea
  children?: ReactNode
  afterContent?: ReactNode
  collapseDelay?: number
  spacing?: T_SpacingProps
}) => {
  const viewBoxW = defaultTo(props.viewBox?.w, VIEW_BOX_DEFAULT.w)
  const viewBoxH = defaultTo(props.viewBox?.h, VIEW_BOX_DEFAULT.h)
  const hotArea: Required<T_HotArea> = {
    x: defaultTo(props.hotArea?.x, HOT_AREA_DEFAULT.x),
    y: defaultTo(props.hotArea?.y, HOT_AREA_DEFAULT.y),
    w: defaultTo(props.hotArea?.w, HOT_AREA_DEFAULT.w),
    h: defaultTo(props.hotArea?.h, HOT_AREA_DEFAULT.h),
  }
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const hasAfter = !isNil(props.afterContent)
  const hasDelay = !isNil(props.collapseDelay)
  const translateOffset = -viewBoxW * 5
  const isDev = ExPubGoConfig().mode === 'development'

  const widthBegin = hasDelay ? `click+${props.collapseDelay}s` : 'click'
  const heightCalcMode = hasAfter ? 'discrete' : 'spline'
  const heightKeySplines = hasAfter ? undefined : '0.42 0 0.58 1.0;0.42 0 0.58 1.0'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'collapsible-box' } : {})}
      style={{ ...rootStyle, ...spacingResult }}
    >
      <section style={outerStyle}>
        <section style={topContainerStyle}>
          {props.children}
        </section>
        <section style={mainContainerStyle}>
          <SvgEx
            x="0px" y="0px"
            viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
            xmlSpace="preserve"
            style={mainSvgStyle}
          >
            <animate
              attributeName="width"
              fill="freeze"
              values="100%;0;0"
              keyTimes="0;0.00001;1"
              dur="100s"
              begin={widthBegin}
              calcMode="discrete"
            />
            <g {...(hasDelay ? { opacity: 0 } : {})}>
              {hasDelay && (
                <animate
                  attributeName="opacity"
                  values="0;1"
                  begin="click"
                  dur={`${props.collapseDelay}s`}
                  fill="freeze"
                  restart="never"
                />
              )}
              {hasAfter && (
                <>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`0 0;${translateOffset} 0;${translateOffset} 0`}
                    dur="100s"
                    keyTimes="0;0.0000001;1"
                    begin="click"
                    fill="freeze"
                    calcMode="discrete"
                    restart="never"
                  />
                  <foreignObject x={-translateOffset} y="0" width="100%" height="100%">
                    {props.afterContent}
                  </foreignObject>
                </>
              )}
              <rect
                x={hotArea.x} y={hotArea.y}
                width={hotArea.w} height={hotArea.h}
                style={rectStyle}
              >
                <animate
                  attributeName="height"
                  fill="freeze"
                  restart="never"
                  calcMode={heightCalcMode}
                  keyTimes="0;0.0001;1"
                  values="100%;0%;0%"
                  dur="1000s"
                  begin="click"
                  {...(heightKeySplines ? { keySplines: heightKeySplines } : {})}
                />
              </rect>
            </g>
          </SvgEx>
        </section>
      </section>
    </SectionEx>
  )
}

export default CollapsibleBox

const rootStyle: CSSProperties = {
  WebkitTouchCallout: 'none',
  userSelect: 'text',
  overflow: 'hidden',
  textAlign: 'center',
  lineHeight: 0,
}

const outerStyle: CSSProperties = {
  display: 'block',
  overflow: 'hidden',
}

const topContainerStyle: CSSProperties = {
  textAlign: 'center',
  height: 0,
  lineHeight: 0,
  overflow: 'visible',
}

const mainContainerStyle: CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  transform: 'scale(1)',
  pointerEvents: 'none',
}

const mainSvgStyle: CSSProperties = {
  pointerEvents: 'none',
  display: 'block',
  lineHeight: 0,
}

const rectStyle: CSSProperties = {
  pointerEvents: 'visiblePainted',
  opacity: 0,
}
