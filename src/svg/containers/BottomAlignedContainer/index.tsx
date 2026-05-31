import type { CSSProperties, ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 底部对齐容器
 *
 * 通过双层 180° 旋转实现内容底部对齐到容器位置。
 * 容器高度为 0，内容向上溢出显示。
 *
 * @param children  - 要底部对齐的内容
 * @param spacing   - 外边距配置
 */
const BottomAlignedContainer = (props: {
  children?: ReactNode
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'bottom-aligned-container' } : {})}
      style={{ ...rootBaseStyle, ...spacingResult }}
    >
      <section style={outerRotateStyle}>
        <section style={innerRotateStyle}>
          {props.children}
        </section>
      </section>
    </SectionEx>
  )
}

export default BottomAlignedContainer

const rootBaseStyle: CSSProperties = {
  WebkitTouchCallout: 'none',
  userSelect: 'text',
  overflow: 'hidden',
  textAlign: 'center',
  lineHeight: 0,
}

const outerRotateStyle: CSSProperties = {
  textAlign: 'center',
  height: 0,
  lineHeight: 0,
  width: '100%',
  margin: '0 auto',
  transform: 'rotate(180deg)',
  pointerEvents: 'none',
}

const innerRotateStyle: CSSProperties = {
  transform: 'rotate(180deg)',
  pointerEvents: 'none',
}
