/**
 * SceneGroup — 单个 scene 的 SVG 渲染组件
 *
 * 结构：
 *   <g data-scene="sceneId">        ← scene 容器
 *     <g>                           ← translate（camera 驱动的主位移）
 *       <animateTransform translate/>
 *       <g>
 *         <animateTransform scale/>  ← scale（camera 驱动的透视缩放）
 *         <g>
 *           <animate opacity/>       ← opacity（穿越时由导演规则控制）
 *           <g>
 *             ObjectGroup × N        ← scene 内的 object 列表
 *           </g>
 *         </g>
 *       </g>
 *     </g>
 *   </g>
 */

import type { ReactNode } from "react"
import { transformTranslate, transformScaleRaw, animateOpacity } from "@smil/index"
import type { I_CompiledSceneTrack } from "../types"
import type { I_NormalizedScene, I_NormalizedObject } from "../utils/normalizer"

interface I_SceneGroupProps {
  scene: I_NormalizedScene
  track: I_CompiledSceneTrack
  viewportWidth: number
  viewportHeight: number
  totalDuration: number
}

const SceneGroup = (props: I_SceneGroupProps) => {
  const { scene, track, viewportWidth, viewportHeight, totalDuration } = props

  // 首帧作为 initValue
  const initTranslate = track.translate[0]?.toAbs ?? { x: 0, y: 0 }
  const initScale = track.scale[0]?.toAbs ?? 1
  const initOpacity = track.opacity[0]?.toAbs ?? 1

  // content: object 列表
  const content: ReactNode = (
    <>
      {scene.objects.map(obj => (
        <ObjectGroup key={obj.id} object={obj} />
      ))}
    </>
  )

  return (
    <g data-scene={scene.id}>
      {/* ── translate 层：camera 驱动的屏幕位移 ── */}
      <g>
        {transformTranslate({
          initValue: initTranslate,
          timeline: track.translate,
          begin: "0s",
          loopCount: 0,
          isFreeze: true,
          isAdditive: false,
        })}
        <g>
          {/* ── scale 层：camera 驱动的透视缩放 ── */}
          {transformScaleRaw({
            initValue: initScale,
            timeline: track.scale,
            begin: "0s",
            loopCount: 0,
            isFreeze: true,
            isAdditive: false,
          })}
          <g>
            {/* ── opacity 层：穿越时的导演式可见性控制 ── */}
            {animateOpacity({
              initValue: initOpacity,
              timeline: track.opacity,
              begin: "0s",
              loopCount: 0,
              isFreeze: true,
            })}
            <g>
              {content}
            </g>
          </g>
        </g>
      </g>
    </g>
  )
}

// ─── ObjectGroup ───

interface I_ObjectGroupProps {
  object: I_NormalizedObject
}

const ObjectGroup = (props: I_ObjectGroupProps) => {
  const { object } = props

  // 第一版：直接渲染图片
  if (object.url) {
    return (
      <g data-object={object.id}>
        <foreignObject x={0} y={0} width="100%" height="100%">
          <div style={{ width: '100%', height: '100%', backgroundSize: 'cover' }}>
            <img src={object.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </foreignObject>
      </g>
    )
  }

  if (object.jsx) {
    return (
      <g data-object={object.id}>
        {object.jsx}
      </g>
    )
  }

  return null
}

export default SceneGroup
export { ObjectGroup }
