import type { ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { rootBaseStyle, rotateStyle } from './styles'

const Container180 = (props: {
  children?: ReactNode
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'container-180' } : {})}
      style={{ ...spacingResult, ...rootBaseStyle }}
    >
      <section style={rotateStyle}>
        {props.children}
      </section>
    </SectionEx>
  )
}

export default Container180
