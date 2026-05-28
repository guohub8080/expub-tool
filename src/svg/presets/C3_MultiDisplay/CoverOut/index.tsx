import type { CSSProperties } from "react"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo";
import { spacing, spacingZero } from "@css-fn/spacing";
import type { T_SpacingProps } from "@css-fn/spacing"
import useImgSize from "@common/hooks/useImgSize"
import CoverOutImage from "./components/CoverOutImage"
import GhostLayer from "./components/GhostLayer"
import type { PicConfig } from "./types"
import { normalizePics } from "./config/normalizer"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"

/**
 * CoverOut - 层层退出组件
 *
 * 效果：多张图片叠加显示，依次滑出退场，露出下层图片
 *
 * - 所有图片叠加在一起（图1在最上，图n在最下）
 * - 依次滑出退场，露出下层图片
 * - 所有图在循环结束时同时重置，实现无缝循环
 * - 每张图可独立设置滑出方向、时长和停留时长
 *
 * @param props.spacing - margin/padding 配置
 * @param props.viewBoxW - ViewBox 宽度
 * @param props.viewBoxH - ViewBox 高度
 * @param props.pics - 图片配置数组
 */
const CoverOut = (props: {
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

    // 渲染顺序：图片倒序（图n在最下，图1在最上）
    const renderOrder = [...Array(pics.length).keys()].reverse()

    return (
        <SectionEx style={{ ...rootBaseStyle, ...spacingResult }} data-label="cover-out">
            <section style={innerStyle}>
                <SvgEx
                    viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`}
                    style={svgStyle}
                    width="100%"
                >
                    {/* 假动作层：第一张图的Ghost版本，放在最下面 */}
                    <GhostLayer
                        url={pics[0].url}
                        pics={pics}
                        viewBoxW={canvasSize.w}
                        viewBoxH={canvasSize.h}
                        totalDuration={totalDuration}
                    />

                    {/* 主循环层：所有图片正常循环（倒序渲染） */}
                    {renderOrder.map((index) => {
                        const pic = pics[index]
                        return (
                            <CoverOutImage
                                key={`loop-${index}`}
                                pic={pic}
                                index={index}
                                pics={pics}
                                viewBoxW={canvasSize.w}
                                viewBoxH={canvasSize.h}
                                totalDuration={totalDuration}
                            />
                        )
                    })}
                </SvgEx>
            </section>
        </SectionEx>
    )
}

export default CoverOut


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
