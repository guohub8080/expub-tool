import SvgEx from "@html/basicEx/SvgEx";
import svgURL from "@utils/svg/svgURL";
import { transformTranslate } from "@smil/index";
import { transformScaleRaw } from "@smil/index";
import { animateOpacity } from "@smil/index";
import type { I_NormalizedItemConfig, I_Layout } from "../types";
import type { I_TimelineKeyframe } from "@smil/timeline/types";
import type { I_TranslateValue } from "@smil/animateTransform/translate";
import { calculateBeginOffset } from "../timeline/sequenceCalculator";

/**
 * CoverFlowItem — 单项轮播组件
 *
 * 参考代码机制：base transform + additive scale/translate + discrete opacity
 *
 * 结构：
 *   <g transform="translate(rightX, sideY) scale(sideScale)">
 *     <animateTransform type="scale" additive="sum" />
 *     <animateTransform type="translate" additive="sum" />
 *     <animate opacity discrete />
 *     <g transform="translate(-rightX/sideScale, -sideY/sideScale)">
 *       <foreignObject> content </foreignObject>
 *     </g>
 *   </g>
 *
 * 动画 6 段：等待→滑入中心→停留→滑出左peek→滑出屏外→重置
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
    const { layout, sideScale, totalCycleDuration, index, items, imageW, imageH } = props
    const current = items[index]
    const next = items[(index + 1) % items.length]

    const beginOffset = calculateBeginOffset(index, items)

    // holdTime = 其他所有 item 的 switch+stay 之和（即本 item 不活跃的时段）
    const holdTime = totalCycleDuration - current.switchDuration - current.stayDuration - next.switchDuration
    const exitDuration = Math.min(holdTime * 0.3, 0.3)
    const waitDuration = holdTime - exitDuration

    // 相对位移量（相对于 base 位置 rightX,sideY）
    const toCenterDx = layout.centerX - layout.rightX
    const toCenterDy = -layout.sideY
    const toLeftDx = layout.leftX - layout.rightX
    const offScreenLeftDx = -imageW * sideScale - layout.rightX

    // scale 放大比：base 是 sideScale，中心需要 1.0，所以比值 = 1/sideScale
    const fullScaleRatio = 1 / sideScale

    // translate 6 段（additive sum，相对于 base 位置）
    const translateTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = [
        { to: { x: 0, y: 0 }, durationSeconds: waitDuration },
        { to: { x: toCenterDx, y: toCenterDy }, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        { to: { x: toCenterDx, y: toCenterDy }, durationSeconds: current.stayDuration },
        { to: { x: toLeftDx, y: 0 }, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        { to: { x: offScreenLeftDx, y: 0 }, durationSeconds: exitDuration, keySplines: current.keySplines },
        { to: { x: 0, y: 0 }, durationSeconds: 0.001 },
    ]

    // scale 6 段（additive sum，叠加在 base sideScale 上）
    const scaleTimeline: I_TimelineKeyframe<number>[] = [
        { to: 1, durationSeconds: waitDuration },
        { to: fullScaleRatio, durationSeconds: current.switchDuration, keySplines: current.keySplines },
        { to: fullScaleRatio, durationSeconds: current.stayDuration },
        { to: 1, durationSeconds: next.switchDuration, keySplines: next.keySplines },
        { to: 1, durationSeconds: exitDuration, keySplines: current.keySplines },
        { to: 1, durationSeconds: 0.001 },
    ]

    // opacity discrete：只在活跃段可见
    const opacityTimeline: I_TimelineKeyframe<number>[] = [
        { to: 0, durationSeconds: waitDuration },
        { to: 1, durationSeconds: current.switchDuration },
        { to: 1, durationSeconds: current.stayDuration },
        { to: 1, durationSeconds: next.switchDuration },
        { to: 1, durationSeconds: exitDuration },
        { to: 0, durationSeconds: 0.001 },
    ]

    const beginStr = beginOffset === 0 ? '0s' : `${beginOffset}s`

    // 补偿坐标：base 做了 translate(rightX,sideY)scale(sideScale)，
    // 内容需要 translate(-rightX/sideScale, -sideY/sideScale) 回到原点
    const compensateX = -layout.rightX / sideScale
    const compensateY = -layout.sideY / sideScale

    return (
        <g transform={`translate(${layout.rightX},${layout.sideY})scale(${sideScale})`}>
            {transformScaleRaw({
                initValue: 1,
                timeline: scaleTimeline,
                begin: beginStr,
                loopCount: 0,
                isFreeze: true,
                isAdditive: true,
            })}
            {transformTranslate({
                initValue: { x: 0, y: 0 },
                timeline: translateTimeline,
                begin: beginStr,
                loopCount: 0,
                isFreeze: true,
                isAdditive: true,
                isRelativeMove: false,
            })}
            {animateOpacity({
                initValue: 0,
                timeline: opacityTimeline,
                begin: beginStr,
                loopCount: 0,
                isFreeze: true,
                calcMode: 'discrete',
            })}
            <g transform={`translate(${compensateX},${compensateY})`}>
                <foreignObject x={0} y={0} width={imageW} height={imageH}>
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
                            viewBox={`0 0 ${imageW} ${imageH}`}
                            width="100%"
                        />
                    }
                </foreignObject>
            </g>
        </g>
    )
}

export default CoverFlowItem
