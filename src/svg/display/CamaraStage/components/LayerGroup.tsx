/**
 * LayerGroup — 单个 layer 的 SVG 渲染
 *
 * 结构（固定骨架，三层 <g>）：
 *   <g data-layer="id">
 *     <animateTransform type="translate" />    ← camera 驱动的位移
 *     <animateTransform type="scale" />        ← camera 驱动的透视缩放
 *     <animate attributeName="opacity" />      ← 入场 / 穿越可见性
 *     {content}                                ← 图片 / jsx 内容
 *   </g>
 *
 * translate 和 scale 在同一个 <g> 上不行（animateTransform 会互相覆盖），
 * 所以需要嵌套。但保持最小嵌套：
 *   <g data-layer>       ← translate
 *     <g>                 ← scale
 *       <g>               ← opacity
 *         content
 *       </g>
 *     </g>
 *   </g>
 */

import type { ReactNode } from "react"
import { transformTranslate, transformScaleRaw, animateOpacity } from "@smil/index"
import SvgEx from "@html/basicEx/SvgEx"
import svgURL from "@utils/svg/svgURL"
import type { I_CompiledLayer } from "../types"
import type { I_NormalizedLayer } from "../utils/normalizer"

interface I_LayerGroupProps {
  layer: I_NormalizedLayer
  compiled: I_CompiledLayer
  viewportWidth: number
  viewportHeight: number
}

const LayerGroup = (props: I_LayerGroupProps) => {
  const { layer, compiled, viewportWidth, viewportHeight } = props
  const { init, translateTimeline, scaleTimeline, opacityTimeline } = compiled

  const content: ReactNode = renderContent(layer, viewportWidth, viewportHeight)

  return (
    <g data-layer={layer.id}>
      {/* translate 层 */}
      <g>
        {transformTranslate({
          initValue: { x: init.tx, y: init.ty },
          timeline: translateTimeline,
          begin: "0s",
          loopCount: 1,
          isFreeze: true,
          isAdditive: false,
        })}
        {/* scale 层 */}
        <g>
          {transformScaleRaw({
            initValue: init.scale,
            timeline: scaleTimeline,
            begin: "0s",
            loopCount: 1,
            isFreeze: true,
            isAdditive: false,
          })}
          {/* opacity 层 */}
          <g>
            {animateOpacity({
              initValue: init.opacity,
              timeline: opacityTimeline,
              begin: "0s",
              loopCount: 1,
              isFreeze: true,
            })}
            {content}
          </g>
        </g>
      </g>
    </g>
  )
}

/** 渲染 layer 内容（图片或 jsx），坐标系平移到左上角对齐 viewport 中心 */
const renderContent = (layer: I_NormalizedLayer, w: number, h: number): ReactNode => {
  const tx = -w / 2
  const ty = -h / 2

  if (layer.url) {
    return (
      <g transform={`translate(${tx}, ${ty})`}>
        <foreignObject x={0} y={0} width={w + 1} height={h + 1}>
          <SvgEx
            viewBox={`0 0 ${w + 1} ${h + 1}`}
            style={{
              backgroundImage: svgURL(layer.url),
              backgroundSize: "cover",
              backgroundPosition: "50% 50%",
              backgroundRepeat: "no-repeat",
              width: "100%",
              display: "block",
              boxSizing: "border-box",
            }}
          />
        </foreignObject>
      </g>
    )
  }

  if (layer.jsx) {
    return (
      <g transform={`translate(${tx}, ${ty})`}>
        <foreignObject x={0} y={0} width={w + 1} height={h + 1}>
          {layer.jsx}
        </foreignObject>
      </g>
    )
  }

  return null
}

export default LayerGroup
