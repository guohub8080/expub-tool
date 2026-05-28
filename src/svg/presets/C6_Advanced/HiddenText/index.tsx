/* eslint-disable no-mixed-spaces-and-tabs */
import type { CSSProperties } from "react";
import SectionEx from "@html/basicEx/SectionEx";
import defaultTo from "lodash/defaultTo";;
import { spacing, spacingZero } from "@css-fn/spacing";
import type { T_SpacingProps } from "@css-fn/spacing";

/**
 * 隐藏文本组件
 * 用于显示对用户不可见、但对搜索引擎和屏幕阅读器可见的文本
 * 常用于 SEO 优化和无障碍支持
 */
const HiddenText = (props: {
    text?: string
    width?: number
    spacing?: T_SpacingProps
}) => {
    const text = defaultTo(props.text, "如图文未加载，请刷新重试")
    const width = defaultTo(props.width, 0)
    const spacingResult = spacing(defaultTo(props.spacing, spacingZero))

    const rootStyle: CSSProperties = {
        ...rootBaseStyle,
        ...spacingResult
    };

    const innerStyle: CSSProperties = {
        ...innerBaseStyle,
        width: `${width}px`
    };

    return (
        <SectionEx data-label="hidden-text"
            important={[["height", "0"], ["margin", "0"], ["padding", "0"], ["max-width", "0"], ["max-height", "0"], ["overflow", "hidden"], ["width", "0"]]}
            style={rootStyle}>
            <SectionEx

                style={innerStyle}
            >
                <p style={textStyle}>{text}</p>
            </SectionEx>
        </SectionEx>
    );
};

export default HiddenText;


/** ================================================== Styles ===================================================== */
const rootBaseStyle: CSSProperties = {
    WebkitTouchCallout: "none",
    userSelect: "text",
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 0,
};

const innerBaseStyle: CSSProperties = {
    height: 0,
    margin: 0,
    overflow: "hidden",
};

const textStyle: CSSProperties = {
    textAlign: "center",
};

