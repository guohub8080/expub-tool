/* eslint-disable no-mixed-spaces-and-tabs */
import type { CSSProperties } from "react";
import defaultTo from "lodash/defaultTo";;
import SectionEx from "@html/basicEx/SectionEx";
import SvgEx from "@html/basicEx/SvgEx";
import { spacing, spacingZero } from "@css-fn/spacing";
import type { T_SpacingProps } from "@css-fn/spacing";
import svgURL from "@svg/utils/svgURL";
// import getWechat300x500 from "@api/placeHolderPic/getWechat300x500";
import useImgSize from "@common/hooks/useImgSize";

/**
 * 置顶图片组件
 * 用于显示置顶的图片内容
 */
const TopPinedImg = (props: {
    url?: string
    viewBoxW?: number
    viewBoxH?: number
    spacing?: T_SpacingProps
}) => {
    const url = props.url // defaultTo(props.url, getWechat300x500(random(1, 9)))
    if (!url) return null
    const { size: imgSize } = useImgSize(url, props.viewBoxW, props.viewBoxH)
    const spacingResult = spacing(defaultTo(props.spacing, spacingZero))

    const rootStyle: CSSProperties = {
        ...rootBaseStyle,
        ...spacingResult
    };

    const svgStyle: CSSProperties = {
        ...svgBaseStyle,
        backgroundImage: svgURL(url)
    };

    return (
        <SectionEx data-label="top-pined-img" style={rootStyle}>
            <SvgEx
                style={svgStyle}
                viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
            />
        </SectionEx>
    );
};

export default TopPinedImg;


/** ================================================== Styles ===================================================== */
const rootBaseStyle: CSSProperties = {
    WebkitTouchCallout: "none",
    userSelect: "text",
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 0,
};

const svgBaseStyle: CSSProperties = {
    transform: "scale(1)",
    isolation: "isolate",
    backgroundSize: "100%",
    backgroundRepeat: "no-repeat",
    display: "inline",
    lineHeight: 0,
    margin: 0, // 已修改为 margin: 0
};

