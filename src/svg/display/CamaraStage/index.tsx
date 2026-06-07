/**
 * CamaraStage — 导演式镜头动画系统
 *
 * 在虚拟 z 空间中定义 camera / scene / object 的位置和时间关系，
 * 编译阶段采样 camera 轨迹 → 投影为 2D translate + scale + opacity，
 * 输出纯静态 SVG + SMIL。
 *
 * 渲染结构：
 *   SectionEx（根容器 + dev label）
 *   └─ section（overflow 裁剪）
 *      └─ SvgEx（SVG 画布）
 *         └─ <g visibility="hidden">（初始隐藏，避免 SMIL 闪烁）
 *            └─ <g>（坐标系平移到 viewport 中心）
 *               └─ SceneGroup × N（每个 scene 独立渲染 + 动画）
 */

import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { setVisibility } from "@smil/index"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import { normalizeCamaraStageProps } from "./utils/normalizer"
import { compileAllScenes } from "./core/compiler"
import { resolveCameraTimeline } from "./core/cameraSampler"
import SceneGroup from "./components/SceneGroup"
import type { I_CamaraStageProps } from "./types"

export type { I_CamaraStageProps } from "./types"
export type {
  I_Vec3,
  I_CameraConfig,
  I_CameraSegment,
  I_SceneConfig,
  I_ObjectNodeConfig,
  I_ViewportConfig,
  T_SceneKind,
  T_CrossDirection,
  I_CrossingEvent,
  I_ProjectionFrame,
  I_CompiledSceneTrack,
} from "./types"

const CamaraStage = (props: I_CamaraStageProps) => {
  const config = normalizeCamaraStageProps(props)
  const { viewport, camera, scenes, canvasBg } = config

  const isDev = ExPubGoConfig().mode === 'development'
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))

  // 解析 camera timeline（获取总时长）
  const { totalDuration } = resolveCameraTimeline(camera)

  // 编译所有 scene 的 SMIL 关键帧
  const compiledTracks = compileAllScenes(config)

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'camara-stage' } : {})}
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
          {/* 初始 hidden，0.01s 后 visible，避免 SMIL 初始闪烁 */}
          <g visibility="hidden">
            {setVisibility({ to: "visible", begin: "0.01s", isFreeze: true })}
            {/* 坐标系平移到 viewport 中心 */}
            <g transform={`translate(${viewport.centerX}, ${viewport.centerY})`}>
              {scenes.map((scene, i) => (
                <SceneGroup
                  key={scene.id}
                  scene={scene}
                  track={compiledTracks[i]}
                  viewportWidth={viewport.width}
                  viewportHeight={viewport.height}
                  totalDuration={totalDuration}
                />
              ))}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default CamaraStage
