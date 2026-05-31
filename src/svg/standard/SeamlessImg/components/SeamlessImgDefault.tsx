import type { CSSProperties } from 'react'
import svgURL from '@utils/svg/svgURL'
import SvgEx from '@html/basicEx/SvgEx'

const SeamlessImgDefault = (props: { w: number, h: number, url: string, spacingResult: CSSProperties }) => {
    return <section
        data-label="seamless-img-dark-mode-maintain"
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
                transform: 'scale(1)',
                marginTop: 0
            }}
            viewBox={`0 0 ${props.w} ${props.h}`}
        />
    </section>
}

export default SeamlessImgDefault
