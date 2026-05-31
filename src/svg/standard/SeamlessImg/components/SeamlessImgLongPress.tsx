import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

const SeamlessImgLongPress = (props: { w: number, h: number, url: string, spacingResult: CSSProperties }) => {
    const isDev = ExPubGoConfig().mode === 'development'
    return (
        <SectionEx
            {...(isDev ? { 'expubgo-label': 'seamless-img-long-press-only' } : {})}
            style={{ WebkitTouchCallout: 'none', userSelect: 'text', overflow: 'hidden', textAlign: 'center', lineHeight: 0, ...props.spacingResult }}
        >
            <section style={{ lineHeight: 0, fontSize: 0, height: 0, position: 'relative' }}>
                <img
                    style={{
                        width: '100%',
                        pointerEvents: 'painted',
                        verticalAlign: 'top',
                        opacity: 0
                    }}
                    src={props.url}
                />
            </section>
            <SvgEx
                style={{
                    backgroundImage: svgURL(props.url),
                    backgroundSize: '100%',
                    backgroundRepeat: 'no-repeat',
                    display: 'block',
                    lineHeight: 0,
                    transform: 'scale(1)',
                    marginTop: 0,
                    pointerEvents: 'none'
                }}
                viewBox={`0 0 ${props.w} ${props.h}`}
            />
        </SectionEx>
    )
}

export default SeamlessImgLongPress

