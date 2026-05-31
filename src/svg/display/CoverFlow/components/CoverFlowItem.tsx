import SvgEx from "@html/basicEx/SvgEx";
import svgURL from "@utils/svg/svgURL";
import { transformTranslate } from "@smil/index";
import { transformScale } from "@smil/index";
import type { I_NormalizedItemConfig, I_Layout } from "../types";
import { calculateDelayTime } from "../timeline/sequenceCalculator";
import { assembleTranslateTimeline, assembleScaleTimeline } from "../timeline/sequenceCalculator";
import { getRightX } from "../timeline/positionCalculator";

/**
 * CoverFlowItem — 单项轮播组件
 *
 * 每个实例渲染一项内容，同时驱动 translate + scale 两路动画：
 *
 *   <g>
 *     <foreignObject x y w h>
 *       <SvgEx backgroundImage=.../>   ← url 模式
 *       {item}                          ← item 模式
 *     </foreignObject>
 *     <animateTransform translate/>     ← 水平位移（右→中→左→右）
 *     <animateTransform translate/>     ← scale origin 补偿
 *     <animateTransform scale/>         ← 缩放（sideScale↔1.0）
 *     <animateTransform translate/>     ← scale origin 还原
 *   </g>
 */
const CoverFlowItem = (props: {
    item: I_NormalizedItemConfig
    index: number
    items: I_NormalizedItemConfig[]
    layout: I_Layout
    imageW: number
    imageH: number
    sideScale: number
    totalCycleDuration: number
}) => {
    const delay = calculateDelayTime(props.index, props.items)
    const beginStr = `${delay}s`
    const rightX = getRightX(props.layout)

    // translate 时间线
    const translateTimeline = assembleTranslateTimeline(
        props.index, props.items, props.layout, props.totalCycleDuration
    )
    // scale 时间线
    const scaleTimeline = assembleScaleTimeline(
        props.index, props.items, props.sideScale, props.totalCycleDuration
    )

    return (
        <g>
            <foreignObject
                x={rightX}
                y={props.layout.sideY}
                width={props.imageW}
                height={props.imageH}
            >
                {props.item.useItem
                    ? props.item.item
                    : <SvgEx
                        style={{
                            display: "block",
                            backgroundImage: svgURL(props.item.url!),
                            backgroundSize: "100% auto",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}
                        viewBox={`0 0 ${props.imageW} ${props.imageH}`}
                        width="100%"
                    />
                }
            </foreignObject>

            {/* translate 动画：右→中→左→右 */}
            {transformTranslate({
                initValue: { x: rightX, y: props.layout.sideY },
                timeline: translateTimeline,
                begin: beginStr,
                loopCount: 0,
                isFreeze: true,
                isAdditive: false,
                isRelativeMove: false,
            })}

            {/* scale 动画：sideScale↔1.0，origin = 图片中心 */}
            {transformScale({
                initValue: props.sideScale,
                timeline: scaleTimeline,
                origin: props.layout.origin,
                begin: beginStr,
                loopCount: 0,
                isFreeze: true,
                isAdditive: true,
            })}
        </g>
    )
}

export default CoverFlowItem
