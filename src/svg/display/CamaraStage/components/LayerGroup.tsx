/**
 * LayerGroup — 单个 layer 的 SVG 渲染（Approach B）
 *
 * DOM 骨架：
 *   <g data-layer="id">                  ← parallax translate（per-layer delta）
 *     <animateTransform type="translate" />
 *     <g>                                  ← world scale
 *       <animateTransform type="scale" />
 *       <g data-enter>                     ← entrance translate (offset)
 *         <animateTransform type="translate" />
 *         <g>                              ← entrance scale
 *           <animateTransform type="scale" />
 *           <g>                            ← entrance opacity
 *             <animate attributeName="opacity" />
 *             content
 *           </g>
 *         </g>
 *       </g>
 *     </g>
 *   </g>
 *
 * camera base translate 在父级 <g data-camera> 上，此组件只管 per-layer 部分。
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
  const { init } = compiled

  const content: ReactNode = renderContent(layer, viewportWidth, viewportHeight)

  return (
    <g data-layer={layer.id}>
      {/* ── parallax translate（per-layer delta） ── */}
      <g>
        {transformTranslate({
          initValue: { x: init.parallaxTx, y: init.parallaxTy },
          timeline: compiled.parallaxTranslateTimeline,
          begin: "0s",
          loopCount: 1,
          isFreeze: true,
          isAdditive: false,
        })}
        {/* ── world scale ── */}
        <g>
          {transformScaleRaw({
            initValue: init.worldScale,
            timeline: compiled.worldScaleTimeline,
            begin: "0s",
            loopCount: 1,
            isFreeze: true,
            isAdditive: false,
          })}
          {/* ── entrance translate modifier ── */}
          <g>
            {transformTranslate({
              initValue: { x: init.enterTx, y: init.enterTy },
              timeline: compiled.enterTranslateTimeline,
              begin: "0s",
              loopCount: 1,
              isFreeze: true,
              isAdditive: false,
            })}
            {/* ── entrance scale modifier ── */}
            <g>
              {transformScaleRaw({
                initValue: init.enterScale,
                timeline: compiled.enterScaleTimeline,
                begin: "0s",
                loopCount: 1,
                isFreeze: true,
                isAdditive: false,
              })}
              {/* ── entrance opacity modifier ── */}
              <g>
                {animateOpacity({
                  initValue: init.enterOpacity,
                  timeline: compiled.enterOpacityTimeline,
                  begin: "0s",
                  loopCount: 1,
                  isFreeze: true,
                })}
                {content}
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  )
}

/** 渲染 layer 内容，坐标系平移到左上角对齐 viewport 中心 */
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
