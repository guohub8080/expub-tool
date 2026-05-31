import type { CSSProperties } from 'react'
import SvgEx from '@html/basicEx/SvgEx'

const SeamlessImgReplaceable = (props: { w: number, h: number, url: string, spacingResult: CSSProperties }) => {
    return <section
        data-label="seamless-img-replaceable-after-publish"
        style={{
            WebkitTouchCallout: 'none',
            userSelect: 'text',
            overflow: 'hidden',
            textAlign: 'center',
            lineHeight: 0,
            ...props.spacingResult
        }}
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
    </section>
}

export default SeamlessImgReplaceable
