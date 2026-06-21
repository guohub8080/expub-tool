import type { CSSProperties, ReactNode } from "react"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import SectionEx from "@html/basicEx/SectionEx"

// 正文首行半高的典型值（15px / line-height 1.7 → 25.5 / 2 ≈ 12.5）。
// 用于把正文首行中心压到圆心；正文行高由你的 body 决定，这里只给常见值，偏差可用 defaultBodyMarginTop 微调。
const CONTENT_LINE_HALF = 12.5

// ============================================ 类型 ============================================

/** 虚线配置（实心段 + 缺口） */
export interface TimelineDash {
    /** 实心段长 px。默认 4 */
    solidLength?: number
    /** 缺口长 px。默认 4 */
    gapLength?: number
}

/** 单项圆点配置（不传则走 defaultDot） */
export interface TimelineDot {
    /** 自定义圆点：传入后替换默认圆点（整段 JSX，如带动画的 SVG）。有 jsx 就优先，忽略 color */
    jsx?: ReactNode
    /** 圆点有效高度 px：默认圆点 = 渲染直径；jsx 时 = 对齐用高度。覆盖 defaultDot.size */
    size?: number
    /** 圆点颜色（仅默认圆点生效）。覆盖 defaultDot.color */
    color?: string
}

/** 单项下方连线配置（不传则走 defaultLine） */
export interface TimelineLine {
    /** 自定义连线：传入后替换内置实线/虚线（整段 JSX，优先级最高）。需自带 flex:1 填满竖向缝隙 */
    jsx?: ReactNode
    /** 连线宽度 px。覆盖 defaultLine.width。jsx 存在时忽略 */
    width?: number
    /** 连线颜色。覆盖 defaultLine.color。jsx 存在时忽略 */
    color?: string
    /** 虚线配置；有 dash 就走虚线（覆盖实线）。jsx 存在时忽略 */
    dash?: TimelineDash
}

export interface TimelineItem {
    /** 该项的正文（圆点右边的内容），完全由你自己实现（任意 JSX）。时间轴不干涉其内部布局。 */
    body: ReactNode
    /** 圆点配置（可选）；不传走 defaultDot */
    dot?: TimelineDot
    /** 该项下方连线配置（可选）；不传走 defaultLine */
    line?: TimelineLine
}

export interface TimelineProps {
    /** 时间轴项 */
    childItems: TimelineItem[]

    /** 默认圆点配置（部分覆盖）：{ size?, color? }。size 默认 9，color 默认 #1A237E；单项 dot 覆盖 */
    defaultDot?: { size?: number; color?: string }
    /** 默认连线配置（部分覆盖）：{ jsx?, width?, color?, dash? }。width 默认 2，color 默认 #e5e5e5；单项 line 覆盖 */
    defaultLine?: { jsx?: ReactNode; width?: number; color?: string; dash?: TimelineDash }

    /** 连线两端的纵向缝：上端（本圆点底部→连线）和下端（连线→下一个圆点顶部）各留 dotGap。默认 0 */
    dotGap?: number
    /** 项与项的间距（视觉等同 margin-bottom；内部走 paddingBottom，好让连线桥接跨过去）。默认 20 */
    defaultItemGap?: number
    /** 正文(body)的纵向微调，叠加在自动基线（首行中心压到圆心）之上：正值下移、负值上提。默认 0 */
    defaultBodyMarginTop?: number
    /** 圆点列宽度（圆点居中的竖栏；也决定圆点到正文的横向间距 (dotColumnWidth−dotSize)/2）。默认 16 */
    dotColumnWidth?: number
}

// ============================================ Timeline ============================================

/**
 * 竖向时间轴 —— 纯脚手架：圆点 + 连线 + 一个你自己塞 JSX 的槽（body）。
 *
 * 连线三种渲染（优先级：line.jsx > dash > 实线）：
 * 1. line.jsx → 自定义连线 JSX（逃生舱，自带 flex:1 + 外观，内置不干涉）。
 * 2. 有 dash → CSS 静态虚线（repeating-linear-gradient，可调实心段/缺口）。
 * 3. 无 dash → HTML 实线（<section> + background-color，最精确锐利）。
 *
 * 对齐：正文首行中心自动压到圆心，圆点纵向对齐，无需手调；偏差用 defaultBodyMarginTop 微调。
 * 微信兼容：圆点 / 连线走 SectionEx + !important 锁尺寸防吞。
 */
const Timeline = (props: TimelineProps) => {
    const {
        childItems = [],
        defaultDot,
        defaultLine,
        dotGap = 0,
        defaultItemGap = 20,
        defaultBodyMarginTop = 0,
        dotColumnWidth = 16,
    } = props

    // 全局默认（部分覆盖内置默认）
    const defaultDotSize = defaultTo(defaultDot?.size, 9)
    const defaultDotColor = defaultTo(defaultDot?.color, "#1A237E")
    const defaultLineWidth = defaultTo(defaultLine?.width, 2)
    const defaultLineColor = defaultTo(defaultLine?.color, "#e5e5e5")

    return (
        <section style={listStyle}>
            {childItems.map((item, index) => {
                const isLast = index === childItems.length - 1
                const hasCustomDot = !isNil(item.dot?.jsx)

                const resolvedDotSize = defaultTo(item.dot?.size, defaultDotSize)
                const resolvedDotColor = defaultTo(item.dot?.color, defaultDotColor)
                const resolvedLineWidth = defaultTo(item.line?.width, defaultLineWidth)
                const resolvedLineColor = defaultTo(item.line?.color, defaultLineColor)

                // 虚线解析：单项 line.dash 覆盖全局 defaultLine.dash
                const effectiveDash = item.line?.dash ?? defaultLine?.dash
                const hasDash = !isNil(effectiveDash)
                const solidLength = defaultTo(effectiveDash?.solidLength, 4)
                const gapLength = defaultTo(effectiveDash?.gapLength, 4)

                // 自定义连线：单项 line.jsx 覆盖全局 defaultLine.jsx（优先级最高，传了就用你的 JSX）
                const effectiveLineJsx = item.line?.jsx ?? defaultLine?.jsx
                const hasCustomLine = !isNil(effectiveLineJsx)

                // 正文首行中心压到圆心：marginTop = 圆心(resolvedDotSize/2) − 首行半高(CONTENT_LINE_HALF)
                const contentMarginTop = resolvedDotSize / 2 - CONTENT_LINE_HALF + defaultBodyMarginTop

                const dotStyle: CSSProperties = {
                    display: "block",
                    width: resolvedDotSize,
                    height: resolvedDotSize,
                    borderRadius: "50%",
                    backgroundColor: resolvedDotColor,
                    marginTop: 0, // 圆点贴行顶
                    flexShrink: 0,
                }
                const itemStyle: CSSProperties = {
                    display: "flex",
                    alignItems: "stretch",
                }

                // 连线：自定义 jsx > 实线 / 静态虚线（仅非末项渲染）
                let lineElement: ReactNode = null
                if (!isLast) {
                    if (hasCustomLine) {
                        // ③ 自定义连线 JSX（逃生舱：你自带 flex:1 + 外观，内置不干涉）
                        lineElement = effectiveLineJsx
                    } else {
                        const lineBaseStyle: CSSProperties = {
                            display: "block",
                            flex: 1,
                            width: resolvedLineWidth,
                            minWidth: resolvedLineWidth,
                            marginTop: dotGap, // 上端：本圆点底部 → 连线
                            marginBottom: dotGap, // 下端：连线 → 下一个圆点顶部
                        }
                        if (!hasDash) {
                            // ① HTML 实线
                            lineElement = (
                                <SectionEx
                                    style={{ ...lineBaseStyle, backgroundColor: resolvedLineColor }}
                                    important={[
                                        ["width", `${resolvedLineWidth}px`],
                                        ["min-width", `${resolvedLineWidth}px`],
                                        ["flex", "1"],
                                        ["background-color", resolvedLineColor],
                                    ]}
                                />
                            )
                        } else {
                            // ② CSS 静态虚线（repeating-linear-gradient：实心段 solidLength + 缺口 gapLength）
                            const period = solidLength + gapLength
                            lineElement = (
                                <SectionEx
                                    style={{
                                        ...lineBaseStyle,
                                        backgroundImage: `repeating-linear-gradient(to bottom, ${resolvedLineColor} 0, ${resolvedLineColor} ${solidLength}px, transparent ${solidLength}px, transparent ${period}px)`,
                                    }}
                                    important={[
                                        ["width", `${resolvedLineWidth}px`],
                                        ["min-width", `${resolvedLineWidth}px`],
                                        ["flex", "1"],
                                    ]}
                                />
                            )
                        }
                    }
                }

                return (
                    <section style={itemStyle} key={index}>
                        {/* 导轨：圆点（或自定义 dot.jsx）+ 连线，flex column，被 stretch 拉到与正文等高 */}
                        <section style={{ ...dotColumnStyle, width: dotColumnWidth }}>
                            {hasCustomDot ? (
                                <section style={customDotSlotStyle}>{item.dot?.jsx}</section>
                            ) : (
                                <SectionEx
                                    style={dotStyle}
                                    important={[
                                        ["width", `${resolvedDotSize}px`],
                                        ["height", `${resolvedDotSize}px`],
                                        ["background-color", resolvedDotColor],
                                    ]}
                                />
                            )}
                            {lineElement}
                        </section>

                        {/* 正文槽：你的 body 原样渲染。marginTop 自动把首行压到圆心；
                            defaultItemGap 走 paddingBottom（视觉等同 margin-bottom，但这样连线才能桥接跨过去） */}
                        <section
                            style={{
                                flex: 1,
                                marginTop: contentMarginTop,
                                paddingBottom: isLast ? 0 : defaultItemGap,
                            }}
                        >
                            {item.body}
                        </section>
                    </section>
                )
            })}
        </section>
    )
}

export default Timeline

// ============================================ Styles ============================================

const listStyle: CSSProperties = {
    margin: "12px 0 24px 0",
}

const dotColumnStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
}

const customDotSlotStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
}
