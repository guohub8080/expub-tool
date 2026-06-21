import type { CSSProperties, ReactNode } from "react"
import SectionEx from "@html/basicEx/SectionEx"

// ============================================ 类型 ============================================

interface HiddenTextProps {
    /** 要隐藏但保留在 DOM 里的内容（文字/JSX）。供微信"朗读"读出来、AI 语料/SEO 抓取、或隐藏说明用 */
    children: ReactNode
}

// ============================================ HiddenText ============================================

/**
 * 视觉隐藏、但保留在 DOM 里的文本载体。
 *
 * 原理（参考 e2.cool 的"AI 语料学习文本"套路）：一个 height:0 + overflow:hidden + visibility:visible 的 section，
 * 高度钉死为 0、内容被裁剪 → 视觉上完全看不见；但文字原样留在 DOM 里（visibility 不是 hidden），
 * 所以微信"朗读"、屏幕阅读器、AI/SEO 爬虫都能读到。
 *
 * 用途：藏说明文字 / 给朗读读出来 / AI 语料 / SEO 关键词。
 *
 * 微信兼容：height/overflow/visibility 走 SectionEx + !important 锁死，防编辑器吞掉或覆盖。
 */
const HiddenText = ({ children }: HiddenTextProps) => {
    return (
        <SectionEx
            style={hiddenStyle}
            important={[
                ["height", "0px"],
                ["overflow", "hidden"],
                ["visibility", "visible"],
            ]}
        >
            {children}
        </SectionEx>
    )
}

export default HiddenText

// ============================================ Styles ============================================

const hiddenStyle: CSSProperties = {
    overflow: "hidden",
    width: "100%",
    height: 0,
    marginTop: 0,
    lineHeight: 0,
    visibility: "visible",
}
