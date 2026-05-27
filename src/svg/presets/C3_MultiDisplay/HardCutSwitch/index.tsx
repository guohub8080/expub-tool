import type { CSSProperties } from "react"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { defaultTo } from "lodash-es"
import { spacing, spacingZero } from "@css-fn/spacing";
import type { T_SpacingProps } from "@css-fn/spacing"
import useImgSize from "@common/hooks/useImgSize"
import HardCutSwitchImage from "./components/HardCutSwitchImage"
import type { PicConfig } from "./types"
import { normalizePics } from "./config/normalizer"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"

/**
 * HardCutSwitch - 硬切切换组件
 *
 * 效果：多张图片通过不透明度的离散跳变进行切换（无过渡缓动）
 *
 * 每张图片的完整循环：
 * 1. 完全显示（stayDuration）
 * 2. 瞬间隐藏，等待其他图片展示完毕
 *
 * @param props.spacing - margin/padding 配置
 * @param props.viewBoxW - ViewBox 宽度
 * @param props.viewBoxH - ViewBox 高度
 * @param props.pics - 图片配置数组
 */
const HardCutSwitch = (props: {
    spacing?: T_SpacingProps
    viewBoxW?: number
    viewBoxH?: number
    pics?: PicConfig[]
}) => {
    const spacingResult = spacing(defaultTo(props.spacing, spacingZero))
    const pics = normalizePics(props.pics)
    const { size: canvasSize } = useImgSize(pics[0].url, props.viewBoxW, props.viewBoxH)

    // 计算总动画时长
    const totalDuration = calculateTotalCycleDuration(pics)

    return (
        <SectionEx style={{ ...rootBaseStyle, ...spacingResult }} data-label="hard-cut-switch">
            <section style={innerStyle}>
                <SvgEx
                    viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
                    style={svgStyle}
                    width="100%"
                >
                    {pics.map((pic, index) => (
                        <HardCutSwitchImage
                            key={`hc-${index}`}
                            pic={pic}
                            index={index}
                            pics={pics}
                            viewBoxW={canvasSize.w}
                            viewBoxH={canvasSize.h}
                            totalDuration={totalDuration}
                        />
                    ))}
                </SvgEx>
            </section>
        </SectionEx>
    )
}

export default HardCutSwitch


/** ================================================== Styles ===================================================== */
const rootBaseStyle: CSSProperties = {
    WebkitTouchCallout: "none",
    userSelect: "text",
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 0,
}

const innerStyle: CSSProperties = {
    overflow: "hidden",
    lineHeight: 0,
    margin: 0,
}

const svgStyle: CSSProperties = {
    display: "block",
    margin: "0 auto",
}
