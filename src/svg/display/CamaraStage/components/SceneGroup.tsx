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
import SvgEx from "@html/basicEx/SvgEx"
import svgURL from "@utils/svg/svgURL"
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

  // initValue 来自编译结果的首帧
  const initTranslate = track.initTranslate
  const initScale = track.initScale
  const initOpacity = track.initOpacity

  // content: object 列表
  const content: ReactNode = (
    <>
      {scene.objects.map(obj => (
        <ObjectGroup key={obj.id} object={obj} width={viewportWidth} height={viewportHeight} />
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
          loopCount: 1,
          isFreeze: true,
          isAdditive: false,
        })}
        <g>
          {/* ── scale 层：camera 驱动的透视缩放 ── */}
          {transformScaleRaw({
            initValue: initScale,
            timeline: track.scale,
            begin: "0s",
            loopCount: 1,
            isFreeze: true,
            isAdditive: false,
          })}
          <g>
            {/* ── opacity 层：穿越时的导演式可见性控制 ── */}
            {animateOpacity({
              initValue: initOpacity,
              timeline: track.opacity,
              begin: "0s",
              loopCount: 1,
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
  /** viewport 宽度（像素），用于 foreignObject 尺寸 */
  width: number
  /** viewport 高度（像素），用于 foreignObject 尺寸 */
  height: number
}

/**
 * ObjectGroup — 渲染单个 object
 *
 * 坐标系以 viewport 中心为原点，通过 translate 平移回左上角，
 * 使 foreignObject 内的内容正确对齐。
 */
const ObjectGroup = (props: I_ObjectGroupProps) => {
  const { object, width, height } = props
  // 坐标系平移到左上角（viewport 中心为原点）
  const tx = -width / 2
  const ty = -height / 2

  if (object.url) {
    return (
      <g data-object={object.id} transform={`translate(${tx}, ${ty})`}>
        <foreignObject x={0} y={0} width={width + 1} height={height + 1}>
          <SvgEx
            viewBox={`0 0 ${width + 1} ${height + 1}`}
            style={{
              backgroundImage: svgURL(object.url),
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

  if (object.jsx) {
    return (
      <g data-object={object.id} transform={`translate(${tx}, ${ty})`}>
        <foreignObject x={0} y={0} width={width + 1} height={height + 1}>
          {object.jsx}
        </foreignObject>
      </g>
    )
  }

  return null
}

export default SceneGroup
export { ObjectGroup }
