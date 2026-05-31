import type { ReactNode } from 'react'
import ZeroHeightContainer from '../ZeroHeightContainer'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

/**
 * 叠加层容器
 *
 * 底层 backgroundNode + 上层 overlayNode，背景用零高容器不占位，
 * overlayNode 自然叠在上方。常用于遮罩、提示、浮动按钮等。
 */
const OverlayContainer = (props: {
  backgroundNode: ReactNode
  overlayNode: ReactNode
}) => {
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <section
      {...(isDev ? { 'expubgo-label': 'overlay-container' } : {})}
      style={{ lineHeight: 0 }}
    >
      <ZeroHeightContainer>
        {props.backgroundNode}
      </ZeroHeightContainer>
      {props.overlayNode}
    </section>
  )
}

export default OverlayContainer
