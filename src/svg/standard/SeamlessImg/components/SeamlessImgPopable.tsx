import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

const SeamlessImgPopable = (props: { w: number, h: number, url: string, spacingResult: CSSProperties }) => {
    const isDev = ExPubGoConfig().mode === 'development'
    return (
        <SectionEx
            {...(isDev ? { 'expubgo-label': 'seamless-img-popable' } : {})}
            style={{ WebkitTouchCallout: 'none', userSelect: 'text', overflow: 'hidden', textAlign: 'center', lineHeight: 0, ...props.spacingResult }}
        >
            <SvgEx
                style={{
                    display: 'inline',
                    lineHeight: 0,
                    marginTop: 0,
                    pointerEvents: 'none',
                    transform: 'scale(1)'
                }}
                viewBox={`0 0 ${props.w} ${props.h}`}
            >
                <foreignObject width={props.w} height={props.h} x="0" y="0">
                    <img
                        src={props.url}
                        style={{
                            width: '100%',
                            height: 'auto',
                            visibility: 'visible',
                            pointerEvents: 'visiblePainted'
                        }}
                    />
                </foreignObject>
                <foreignObject width={props.w} height={props.h}>
                    <SvgEx
                        style={{
                            backgroundImage: svgURL(props.url),
                            backgroundPosition: '0% 0%',
                            backgroundSize: 'cover'
                        }}
                        viewBox={`0 0 ${props.w} ${props.h}`}
                    />
                </foreignObject>
            </SvgEx>
        </SectionEx>
    )
}

export default SeamlessImgPopable

