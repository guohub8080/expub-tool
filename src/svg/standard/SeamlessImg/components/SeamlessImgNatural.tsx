import type { CSSProperties } from 'react'
import svgURL from '@utils/svg/svgURL'
import SvgEx from '@html/basicEx/SvgEx'

const SeamlessImgNatural = (props: { w: number, h: number, url: string, spacingResult: CSSProperties, label?: string }) => {
    return <section
        {...props.label ? { "expubgo-label": props.label } : {}}
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
                backgroundImage: svgURL(props.url),
                backgroundSize: '100%',
                backgroundRepeat: 'no-repeat',
                display: 'block',
                lineHeight: 0,
                marginTop: 0
            }}
            viewBox={`0 0 ${props.w} ${props.h}`}
        />
    </section>
}

export default SeamlessImgNatural
