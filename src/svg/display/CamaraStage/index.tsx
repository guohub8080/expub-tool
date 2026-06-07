import React from 'react'
import defaultTo from 'lodash/defaultTo'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import { setVisibility } from '@smil/index'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { bake } from './core/bake'
import { emitObjectGroup } from './smil/emitTrack'
import type { I_CamaraStageProps } from './types'

export type {
  I_CamaraStageProps,
  Vec3, Camera, CameraSegment,
  Scene, ObjectNode, I_EntranceConfig,
  Viewport, T_SceneKind,
  BakedFrame, CanonicalTrack,
} from './types'

/**
 * CamaraStage — 导演式镜头动画编译系统
 *
 * 在开发阶段建立虚拟 3D 空间，定义 camera / scene / object 的位置和时间关系，
 * 编译时烘焙为 2D screen-space 轨道，输出纯静态 SVG + SMIL。
 *
 * 渲染结构：
 *   SectionEx（根容器 + dev label）
 *   └─ section（overflow 裁剪）
 *      └─ SvgEx（SVG 画布，viewBox 由 viewport 决定）
 *         └─ <g visibility="hidden">（初始隐藏，0.01s 后变 visible）
 *            └─ <g transform="translate(centerX, centerY)">（视口中心偏移）
 *               └─ <g data-world>
 *                  └─ <g data-scene={id}>（场景分组）
 *                     └─ per-object <g>（translate + scale + opacity）
 */
const CamaraStage = (props: I_CamaraStageProps) => {
  const { viewport, camera, scenes, canvasBg } = props
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  // 烘焙：Props → CanonicalTrack[]
  const { tracks, totalDuration } = bake(props)

  // 按 scene 分组
  const sceneTracks = new Map<string, typeof tracks>()
  for (const track of tracks) {
    if (!sceneTracks.has(track.sceneId)) sceneTracks.set(track.sceneId, [])
    sceneTracks.get(track.sceneId)!.push(track)
  }

  const centerX = viewport.width / 2
  const centerY = viewport.height / 2

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'camara-stage' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "none", overflow: "hidden",
        width: "100%", maxWidth: "100%",
        textAlign: "center", lineHeight: 0, ...spacingResult,
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx
          viewBox={`0 0 ${viewport.width} ${viewport.height}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(canvasBg) }}
          width="100%"
        >
          {/* 初始 visibility="hidden"，0.01s 后变 visible，避免 SMIL 初始闪烁 */}
          <g visibility="hidden">
            {setVisibility({ to: "visible", begin: "0.01s", isFreeze: true })}
            {/* 坐标系平移到视口中心，所有 translate 动画以中心为原点 */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <g data-world>
                {scenes.map(scene => (
                  <g key={scene.id} data-scene={scene.id}>
                    {(sceneTracks.get(scene.id) ?? []).map(track =>
                      emitObjectGroup(track, totalDuration),
                    )}
                  </g>
                ))}
              </g>
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default CamaraStage
