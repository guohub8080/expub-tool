import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

import type { T_CanvasSize } from '@svg/types'

const CANVAS_SIZE_DEFAULT: Required<T_CanvasSize> = { w: 0, h: 0 }

const PlaceHolder = (props: {
  canvasSize?: T_CanvasSize
  color?: string
  spacing?: T_SpacingProps
}) => {
  const w = defaultTo(props.canvasSize?.w, CANVAS_SIZE_DEFAULT.w)
  const h = defaultTo(props.canvasSize?.h, CANVAS_SIZE_DEFAULT.h)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'placeholder' } : {})}
      style={{ ...rootStyle, ...spacingResult }}
    >
      <SvgEx style={svgStyle} viewBox={`0 0 ${w} ${h}`}>
        {props.color && (
          <rect width="100%" height="100%" fill={props.color} />
        )}
      </SvgEx>
    </SectionEx>
  )
}

export default PlaceHolder

const rootStyle: CSSProperties = {
  WebkitTouchCallout: 'none',
  userSelect: 'text',
  overflow: 'hidden',
  textAlign: 'center',
  lineHeight: 0,
}

const svgStyle: CSSProperties = {
  display: 'block',
  transform: 'scale(1)',
  pointerEvents: 'none',
}
