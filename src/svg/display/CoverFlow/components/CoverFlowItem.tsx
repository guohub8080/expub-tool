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
 * 两路 animateTransform 在同一个 <g> 上：
 *   translate (additive=replace) — 控制绝对位置
 *   scale (additive=sum, 三元素)  — 控制缩放 + origin 补偿
 *
 * 动画方向：右→中→左→（回到右等待下一轮）
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

    const translateTimeline = assembleTranslateTimeline(
        props.index, props.items, props.layout, props.totalCycleDuration
    )
    const scaleTimeline = assembleScaleTimeline(
        props.index, props.items, props.sideScale, props.totalCycleDuration
    )

    return (
        <g>
            <foreignObject
                x={0}
                y={0}
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

            {/* translate：右→中→左→右，absolute positioning */}
            {transformTranslate({
                initValue: { x: props.layout.rightX, y: props.layout.sideY },
                timeline: translateTimeline,
                begin: beginStr,
                loopCount: 0,
                isFreeze: true,
                isAdditive: false,
                isRelativeMove: false,
            })}

            {/* scale：sideScale↔1.0，origin = 图片中心 */}
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
