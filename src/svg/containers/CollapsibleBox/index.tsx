import type { CSSProperties, ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 坍塌盒子 — 点击后内容消失
 *
 * 展示层（children，height:0 + overflow:visible）叠在交互层（SVG）之上。
 * 点击透明热区触发 SVG width/height 坍塌为 0，展示层随之消失。
 *
 * @param children    - 展示内容
 * @param viewBoxW    - 控制层 SVG viewBox 宽度，默认 100
 * @param viewBoxH    - 控制层 SVG viewBox 高度，默认 300
 * @param hotAreaX    - 热区 X 坐标，默认 0
 * @param hotAreaY    - 热区 Y 坐标，默认 0
 * @param hotAreaW    - 热区宽度，默认 50
 * @param hotAreaH    - 热区高度，默认 50
 * @param spacing     - 外边距配置
 */
const CollapsibleBox = (props: {
  viewBoxW?: number
  viewBoxH?: number
  hotAreaX?: number
  hotAreaY?: number
  hotAreaW?: number
  hotAreaH?: number
  children?: ReactNode
  spacing?: T_SpacingProps
}) => {
  const viewBoxWidth = defaultTo(props.viewBoxW, 100)
  const viewBoxHeight = defaultTo(props.viewBoxH, 300)
  const hotAreaX = defaultTo(props.hotAreaX, 0)
  const hotAreaY = defaultTo(props.hotAreaY, 0)
  const hotAreaWidth = defaultTo(props.hotAreaW, 50)
  const hotAreaHeight = defaultTo(props.hotAreaH, 50)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

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
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            xmlSpace="preserve"
            style={mainSvgStyle}
          >
            <animate
              attributeName="width"
              fill="freeze"
              values="100%;0;0"
              keyTimes="0;0.00001;1"
              dur="100s"
              begin="click"
              calcMode="discrete"
            />
            <g>
              <rect
                x={hotAreaX} y={hotAreaY}
                width={hotAreaWidth} height={hotAreaHeight}
                style={rectStyle}
              >
                <animate
                  attributeName="height"
                  fill="freeze"
                  restart="never"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1.0;0.42 0 0.58 1.0"
                  keyTimes="0;0.0001;1"
                  values="100%;0%;0%"
                  dur="1000s"
                  begin="click"
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
