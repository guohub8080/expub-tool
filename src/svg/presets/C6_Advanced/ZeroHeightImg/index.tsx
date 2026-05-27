import type { CSSProperties } from 'react';
import SectionEx from "@html/basicEx/SectionEx";
import SvgEx from "@html/basicEx/SvgEx";
import { defaultTo } from "lodash-es";
import { spacing, spacingZero } from "@css-fn/spacing";
import type { T_SpacingProps } from "@css-fn/spacing";
import svgURL from "@svg/utils/svgURL";


const ZeroHeightImg = (props: {
    url: string,
    spacing?: T_SpacingProps
    isForcePriority?: boolean
}) => {
    const isForcePriority = defaultTo(props.isForcePriority, false)
    const spacingResult = spacing(defaultTo(props.spacing, spacingZero))

    const svgStyle: CSSProperties = {
        backgroundImage: svgURL(props.url),
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
        display: 'block',
    }

    // 开启了强制优先
    if (isForcePriority) {
        const innerForcedStyle: CSSProperties = {
            ...innerStyle,
            transform: 'scale(1)'
        }
        return (
            <SectionEx data-label="zero-height-img" style={{ ...spacingResult, ...outerStyle }}>
                <section
                    style={innerForcedStyle}
                >
                    <SvgEx style={svgStyle} viewBox="0 0 0 0" />
                </section>
            </SectionEx>
        )
    }

    //未开启强制优先
    return (
        <SectionEx data-label="zero-height-img" style={{ ...spacingResult, ...outerStyle }}>
            <section
                style={innerStyle}
            >
                <SvgEx style={svgStyle} viewBox="0 0 0 0" />
            </section>
        </SectionEx>
    )
}

export default ZeroHeightImg




/**  ================================================== Style ===================================================== */
const outerStyle: CSSProperties = {
    WebkitTouchCallout: 'none',
    userSelect: 'text',
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 0,
}

const innerStyle: CSSProperties = {
    textAlign: 'center',
    height: 0,
    lineHeight: 0,
    width: '100%',
    margin: '0 auto',
    marginTop: 0,
}
