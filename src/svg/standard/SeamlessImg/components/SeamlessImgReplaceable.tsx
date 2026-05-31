import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'

const SeamlessImgReplaceable = (props: { w: number, h: number, url: string, spacingResult: CSSProperties }) => {
    const isDev = ExPubGoConfig().mode === 'development'
    return (
        <SectionEx
            {...(isDev ? { 'expubgo-label': 'seamless-img-replaceable' } : {})}
            style={{ ...rootStyle, ...props.spacingResult }}
        >
            <SvgEx
                style={{
                    display: 'block',
                    lineHeight: 0,
                    marginTop: 0,
                    transform: 'scale(1)'
                }}
                viewBox={`0 0 ${props.w} ${props.h}`}
            >
                <foreignObject width={props.w} height={props.h} x="0" y="0">
                    <img
                        data-src={props.url}
                        src={props.url}
                        style={{
                            width: '100%',
                            pointerEvents: 'painted'
                        }}
                    />
                </foreignObject>
            </SvgEx>
        </SectionEx>
    )
}

export default SeamlessImgReplaceable

const rootStyle: CSSProperties = {
    WebkitTouchCallout: 'none',
    userSelect: 'text',
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 0,
}
