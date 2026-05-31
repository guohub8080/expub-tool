import SvgEx from "@html/basicEx/SvgEx";
import svgURL from "@utils/svg/svgURL";
import { transformTranslate } from "@smil/index";
import type { I_NormalizedPicConfig } from "../types";
import { calculateDelayTime } from "../timeline/sequenceCalculator";
import { getEntryOffset } from "../timeline/offsetCalculator";
import { assembleTimeline } from "../timeline/segmentAssembler";

/**
 * PushingImage — 单张推入内容组件
 *
 * 每个实例渲染一项内容及其推入动画，结构为：
 *
 *   <g>                              ← SVG 分组容器
 *     <foreignObject x y w h>        ← 初始位置在屏幕外（由 direction 决定哪一边）
 *       <SvgEx backgroundImage=.../>  ← url 模式：SVG 背景图
 *       {pic.item}                    ← item 模式：用户自定义 SVG 内容
 *     </foreignObject>
 *     <animateTransform translate/>   ← SMIL 平移动画，驱动 foreignObject 滑入/停留/滑出/等待
 *   </g>
 *
 * 动画参数：
 * - initValue: {x:0, y:0} — foreignObject 自身坐标已通过 x/y 属性设置了初始偏移
 * - isRelativeMove: true  — 每段的 to 值是相对位移，不是绝对坐标
 * - isAdditive: true      — translate 叠加到 foreignObject 自身坐标上
 * - loopCount: 0          — 无限循环
 * - isFreeze: true        — 循环间隙保持最后一帧
 * - begin: `${delay}s`    — 错开各图片的启动时间
 */
const PushingImage = (props: {
    /** 当前内容的标准化配置 */
    pic: I_NormalizedPicConfig
    /** 当前内容在数组中的索引 */
    index: number
    /** 所有内容的标准化配置（用于计算时间线） */
    pics: I_NormalizedPicConfig[]
    /** viewBox 宽度 */
    viewBoxW: number
    /** viewBox 高度 */
    viewBoxH: number
    /** 总周期时长（秒） */
    totalCycleDuration: number
}) => {
    const timeline = assembleTimeline(props.index, props.pics, props.viewBoxW, props.viewBoxH, props.totalCycleDuration)
    const delay = calculateDelayTime(props.index, props.pics)
    const initPos = getEntryOffset(props.pic.direction, props.viewBoxW, props.viewBoxH)

    return (
        <g>
            {/* 内容容器：初始位于屏幕外，由 animateTransform 驱动滑入 */}
            <foreignObject x={initPos.x} y={initPos.y} width={props.viewBoxW} height={props.viewBoxH}>
                {props.pic.useItem
                    ? props.pic.item
                    : <SvgEx
                        style={{
                            display: "block",
                            backgroundImage: svgURL(props.pic.url!),
                            backgroundSize: "100% auto",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}
                        viewBox={`0 0 ${props.viewBoxW} ${props.viewBoxH}`}
                        width="100%"
                    />
                }
            </foreignObject>
            {/* SMIL 平移动画：4 段时间线 + 延迟启动 = 无限循环推入效果 */}
            {transformTranslate({
                initValue: { x: 0, y: 0 },
                timeline,
                begin: `${delay}s`,
                loopCount: 0,
                isFreeze: true,
                isAdditive: true,
                isRelativeMove: true
            })}
        </g>
    )
}

export default PushingImage
