import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

const SeamlessImgPassthrough = (props: { w: number, h: number, url: string, spacingResult: CSSProperties }) => {
  const isDev = ExPubGoConfig().mode === 'development'
  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'seamless-img-event-pass-through' } : {})}
      style={{ WebkitTouchCallout: 'none', userSelect: 'text', overflow: 'hidden', textAlign: 'center', lineHeight: 0, ...props.spacingResult }}
    >
      <SvgEx
        style={{
          backgroundImage: svgURL(props.url),
          backgroundSize: '100%',
          backgroundRepeat: 'no-repeat',
          display: 'block',
          lineHeight: 0,
          marginTop: 0,
          transform: 'scale(1)',
          pointerEvents: 'none'
        }}
        viewBox={`0 0 ${props.w} ${props.h}`}
      />
    </SectionEx>
  )
}

export default SeamlessImgPassthrough

