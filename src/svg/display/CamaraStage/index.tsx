/**
 * CamaraStage — 导演式 Layer World 动画系统
 *
 * 渲染结构（固定骨架）：
 *   SectionEx
 *   └─ section（overflow 裁剪）
 *      └─ SvgEx
 *         └─ <g visibility="hidden">（防 SMIL 闪烁）
 *            └─ <g data-camera>（viewport 中心）
 *               └─ <g data-stage>（可选：scene 级偏移）
 *                  └─ LayerGroup × N（每个 layer 独立渲染 + 统一 camera 驱动动画）
 */

import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { setVisibility } from "@smil/index"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import { normalizeProps } from "./utils/normalizer"
import { compileAllLayers } from "./core/compiler"
import LayerGroup from "./components/LayerGroup"
import type { I_CamaraStageProps } from "./types"

export default function CamaraStage(props: I_CamaraStageProps) {
  const config = normalizeProps(props)
  const { viewport, layers, canvasBg } = config
  const isDev = ExPubGoConfig().mode === "development"
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))

  const { compiled, totalDuration } = compileAllLayers(config)

  return (
    <SectionEx
      {...(isDev ? { "expubgo-label": "camara-stage" } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "none", overflow: "hidden", width: "100%", maxWidth: "100%",
        textAlign: "center", lineHeight: 0, ...spacingResult,
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx
          viewBox={`0 0 ${viewport.width} ${viewport.height}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(canvasBg) }}
          width="100%"
        >
          <g visibility="hidden">
            {setVisibility({ to: "visible", begin: "0.01s", isFreeze: true })}
            {/* data-camera：viewport 中心，所有 layer 的 translate 以此为原点 */}
            <g data-camera transform={`translate(${viewport.centerX}, ${viewport.centerY})`}>
              <g data-stage>
                {layers.map((layer, i) => (
                  <LayerGroup
                    key={layer.id}
                    layer={layer}
                    compiled={compiled[i]}
                    viewportWidth={viewport.width}
                    viewportHeight={viewport.height}
                  />
                ))}
              </g>
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export type { I_CamaraStageProps, I_LayerConfig, I_CameraConfig, I_ViewportConfig } from "./types"
