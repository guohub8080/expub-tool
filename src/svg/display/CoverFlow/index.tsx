import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import type { T_CanvasSize } from "@svg/types"
import useImgSize from "@utils/hooks/useImgSize"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import CoverFlowItem from "./components/CoverFlowItem"
import type { I_CoverFlowItemConfig } from "./types"
import { DEFAULT_PEEK_PX, DEFAULT_GAP, DEFAULT_SIDE_SCALE } from "./types"
import { normalizeItems } from "./normalizer"
import { calculateLayout } from "./timeline/positionCalculator"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"

/**
 * CoverFlow — 居中轮播组件
 *
 * 中间图最大，左右露出边缘 peek，自动循环：
 * 右边放大滑到中间，中间缩小滑到左边。
 *
 * viewBoxW = imageW + 2 * gap + 2 * peekPx
 * viewBoxH = imageH（中心图撑满高度）
 *
 * @param props.canvasSize - 图片尺寸 { w, h }，url 模式可省略，item 模式必传
 * @param props.spacing - 外间距
 * @param props.pics - 配置数组
 * @param props.peekPx - 侧图露出宽度（px），默认 30
 * @param props.gap - 中心图与侧图间距（px），默认 10
 * @param props.sideScale - 侧图缩放，默认 0.8
 */
const CoverFlow = (props: {
  canvasSize?: T_CanvasSize
  spacing?: T_SpacingProps
  pics?: I_CoverFlowItemConfig[]
  peekPx?: number
  gap?: number
  sideScale?: number
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.pics?.[0]
  const firstUrl = firstPic?.url

  if (!firstUrl && !firstPic?.item) return null
  if (!firstUrl && (!props.canvasSize?.w || !props.canvasSize?.h)) {
    throw new Error("`canvasSize` is required when using `item` mode (no `url` provided).")
  }

  const { size: resolvedSize } = useImgSize(firstUrl!, props.canvasSize?.w, props.canvasSize?.h)
  const imageW = resolvedSize.w
  const imageH = resolvedSize.h

  const peekPx = defaultTo(props.peekPx, DEFAULT_PEEK_PX)
  const gap = defaultTo(props.gap, DEFAULT_GAP)
  const sideScale = defaultTo(props.sideScale, DEFAULT_SIDE_SCALE)

  const items = normalizeItems(props.pics)
  const totalCycleDuration = calculateTotalCycleDuration(items)
  const layout = calculateLayout(imageW, imageH, peekPx, gap, sideScale)
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'cover-flow' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${layout.viewBoxW} ${layout.viewBoxH}`}
          style={{ display: "block", margin: "0 auto" }}
          width="100%">
          {items.map((item, index) => (
            <CoverFlowItem key={index} item={item}
              index={index} items={items}
              layout={layout}
              imageW={imageW}
              imageH={imageH}
              sideScale={sideScale}
              totalCycleDuration={totalCycleDuration} />
          ))}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default CoverFlow
