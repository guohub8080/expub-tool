import type { CSSProperties, ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import svgURL from '@utils/svg/svgURL'

/**
 * 坍塌盒子淡入版 — 点击后旧内容淡出，新图片淡入
 *
 * 在 CollapsibleBox 基础上增加：
 * - opacity 动画实现淡入淡出
 * - foreignObject + translate 实现替换图片从屏幕外移入
 *
 * @param children            - 初始展示内容
 * @param viewBoxW            - 控制层 SVG viewBox 宽度，默认 100
 * @param viewBoxH            - 控制层 SVG viewBox 高度，默认 300
 * @param hotAreaX            - 热区 X 坐标，默认 0
 * @param hotAreaY            - 热区 Y 坐标，默认 0
 * @param hotAreaW            - 热区宽度，默认 100
 * @param hotAreaH            - 热区高度，默认 100
 * @param afterSwitchImgUrl   - 淡入显示的替换图片 URL
 * @param duration            - 淡入动画时长（秒），默认 0.5
 * @param spacing             - 外边距配置
 */
const CollapsibleBoxFade = (props: {
  viewBoxW?: number
  viewBoxH?: number
  hotAreaX?: number
  hotAreaY?: number
  hotAreaW?: number
  hotAreaH?: number
  children?: ReactNode
  afterSwitchImgUrl?: string
  duration?: number
  spacing?: T_SpacingProps
}) => {
  const viewBoxWidth = defaultTo(props.viewBoxW, 100)
  const viewBoxHeight = defaultTo(props.viewBoxH, 300)
  const hotAreaX = defaultTo(props.hotAreaX, 0)
  const hotAreaY = defaultTo(props.hotAreaY, 0)
  const hotAreaWidth = defaultTo(props.hotAreaW, 100)
  const hotAreaHeight = defaultTo(props.hotAreaH, 100)
  const duration = defaultTo(props.duration, 0.5)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const imgBgUrl = defaultTo(props.afterSwitchImgUrl, '')
  const translateOffset = -viewBoxWidth * 5
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'collapsible-box-fade' } : {})}
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
              begin={`click+${duration}s`}
              calcMode="discrete"
            />
            <g opacity="0">
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
              <animate
                attributeName="opacity"
                values="0;1"
                begin="click"
                dur={`${duration}s`}
                fill="freeze"
                restart="never"
              />
              <foreignObject x={-translateOffset} y="0" width="100%" height="100%">
                <SvgEx
                  style={{
                    backgroundImage: svgURL(imgBgUrl),
                    backgroundPosition: '0% 0%',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100%',
                  }}
                  viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                  x="0px" y="0px"
                />
              </foreignObject>
              <rect
                x={hotAreaX} y={hotAreaY}
                width={hotAreaWidth} height={hotAreaHeight}
                style={rectStyle}
              >
                <animate
                  attributeName="height"
                  fill="freeze"
                  restart="never"
                  calcMode="discrete"
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

export default CollapsibleBoxFade

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
