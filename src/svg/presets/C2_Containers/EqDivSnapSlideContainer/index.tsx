import type { ReactNode } from "react";
import SectionEx from "@html/basicEx/SectionEx";
import { defaultTo } from "lodash";
import { mpBlank, mpGet,  } from "@css-fn/spacing";
import type { mpProps } from "@css-fn/spacing";

const EquallyDividedSnapSlideContainer = (props: {
    comps?: ReactNode[]
    isReverse?: boolean
    mp?: mpProps
    snapAlign?: "start" | "center" | "end"
}) => {
    const isReverse = defaultTo(props.isReverse, false)
    const snapAlign = defaultTo(props.snapAlign, "center")
    const mpResult = mpGet(defaultTo(props.mp, mpBlank))
    const comps = defaultTo(props.comps, [])
    if (comps.length === 0) return null

    const groupCount = comps.length
    const totalWidthPercent = groupCount * 100
    const childWidthPercent = 100 / groupCount

    return (
        <SectionEx
            data-label="equally-divided-snap-slide-container"
            style={{
                WebkitTouchCallout: "none",
                userSelect: "text",
                overflow: "hidden",
                textAlign: "center",
                lineHeight: 0,
                ...mpResult
            }}
        >
            <section
                style={{
                    overflow: "scroll hidden",
                    scrollSnapType: "x mandatory",
                    scrollBehavior: "smooth",
                    margin: 0,
                    lineHeight: 0,
                    pointerEvents: "auto",
                    direction: isReverse ? "rtl" : "ltr",
                }}
            >
                <SectionEx
                    important={[["width", `${totalWidthPercent}%`], ["max-width", `${totalWidthPercent}%`]]}
                    style={{
                        whiteSpace: "nowrap",
                        lineHeight: 0,
                        display: "flex",
                    }}
                >
                    {comps.map((comp, idx) => (
                        <section
                            key={idx}
                            style={{
                                width: `${childWidthPercent}%`,
                                flex: `0 0 ${childWidthPercent}%`,
                                verticalAlign: "top",
                                lineHeight: 0,
                                overflow: "hidden",
                                scrollSnapAlign: snapAlign,
                            }}
                        >
                            {comp}
                        </section>
                    ))}
                </SectionEx>
            </section>
        </SectionEx>
    )
}


export default EquallyDividedSnapSlideContainer
