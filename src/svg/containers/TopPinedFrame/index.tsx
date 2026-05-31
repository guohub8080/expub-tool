import type { CSSProperties, ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 置顶浮层容器
 *
 * 通过 CSS 层叠上下文（isolation + transform）实现内容"浮"在页面其他元素之上。
 * 支持三种模式：普通模式、事件穿透模式、加强模式（3D变换）。
 *
 * @param children              - 框架内的内容
 * @param spacing               - 外边距配置
 * @param isEventPassThrough    - 是否开启事件穿透（pointer-events: none）
 * @param isEnhanced            - 是否开启加强模式（translateZ 3D变换）
 */
const TopPinedFrame = (props: {
  children?: ReactNode
  spacing?: T_SpacingProps
  isEventPassThrough?: boolean
  isEnhanced?: boolean
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isEventPassThrough = defaultTo(props.isEventPassThrough, false)
  const isEnhanced = defaultTo(props.isEnhanced, false)
  const isDev = ExPubGoConfig().mode === 'development'
  const devLabel = (label: string) => isDev ? { 'expubgo-label': label } : {}

  const rootStyle: CSSProperties = { ...spacingResult, ...rootBaseStyle }

  if (isEnhanced) {
    return (
      <SectionEx style={rootStyle} {...devLabel('top-pined-frame-enhanced')}>
        <SectionEx style={innerEnhancedStyle}>
          {props.children}
        </SectionEx>
      </SectionEx>
    )
  }

  if (isEventPassThrough) {
    return (
      <SectionEx style={rootStyle} {...devLabel('top-pined-frame-passthrough')}>
        <SectionEx style={innerPassThroughStyle}>
          {props.children}
        </SectionEx>
      </SectionEx>
    )
  }

  return (
    <SectionEx style={rootStyle} {...devLabel('top-pined-frame')}>
      <SectionEx style={innerSectionStyle}>
        {props.children}
      </SectionEx>
    </SectionEx>
  )
}

export default TopPinedFrame

const rootBaseStyle: CSSProperties = {
  WebkitTouchCallout: 'none',
  userSelect: 'text',
  overflow: 'hidden',
  textAlign: 'center',
  lineHeight: 0,
}

const innerSectionStyle: CSSProperties = {
  textAlign: 'center',
  lineHeight: 0,
  marginTop: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
  transform: 'scale(1)',
  isolation: 'isolate' as CSSProperties['isolation'],
}

const innerPassThroughStyle: CSSProperties = {
  ...innerSectionStyle,
  pointerEvents: 'none',
}

const innerEnhancedStyle: CSSProperties = {
  textAlign: 'center',
  lineHeight: 0,
  marginTop: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
  transform: 'translateZ(0.01px)',
  isolation: 'isolate' as CSSProperties['isolation'],
}
