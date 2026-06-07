/**
 * compiler — 采样 + 编译流程
 *
 * 将虚拟空间中的 camera + scenes 编译为 SMIL 关键帧。
 *
 * 流程：
 *   1. 解析 camera timeline → 分段信息 + 总时长
 *   2. 按 sampleRate 对全局 timeline 均匀采样
 *   3. 对每个 scene 的每个采样点做投影计算（screenX / screenY / scale / opacity）
 *   4. 检测 crossing events
 *   5. 把采样帧序列转为 SMIL timeline keyframes
 */

import type { I_CompiledSceneTrack, I_CrossingEvent } from "../types"
import type { I_NormalizedCamaraStage, I_NormalizedScene, I_NormalizedObject } from "../utils/normalizer"
import { resolveCameraTimeline, sampleCameraAt, type I_CameraSegmentResolved } from "./cameraSampler"
import { projectToScreen, objectWorldPos } from "./projector"
import { detectCrossings } from "./crossingDetector"

// ─── 编译入口 ───

/**
 * 编译所有 scene 的 SMIL 关键帧
 *
 * @returns 每个 scene 的编译结果
 */
export const compileAllScenes = (config: I_NormalizedCamaraStage): I_CompiledSceneTrack[] => {
  const { viewport, camera, scenes, sampleRate } = config

  // 1. 解析 camera timeline
  const { segments, totalDuration } = resolveCameraTimeline(camera)

  // 2. 均匀采样
  const sampleCount = Math.ceil(totalDuration * sampleRate) + 1
  const samples = Array.from({ length: sampleCount }, (_, i) => {
    const t = (i / (sampleCount - 1)) * totalDuration
    return sampleCameraAt(segments, t)
  })

  // 3. 检测穿越事件
  const crossingMap = detectCrossings({ scenes, cameraSamples: samples })

  // 4. 对每个 scene 编译关键帧
  return scenes.map(scene =>
    compileScene({ scene, viewport, samples, crossings: crossingMap.get(scene.id) ?? [] })
  )
}

// ─── 单 scene 编译 ───

interface I_CompileSceneInput {
  scene: I_NormalizedScene
  viewport: I_NormalizedCamaraStage["viewport"]
  samples: { time: number; position: { x: number; y: number; z: number } }[]
  crossings: I_CrossingEvent[]
}

const compileScene = (input: I_CompileSceneInput): I_CompiledSceneTrack => {
  const { scene, viewport, samples, crossings } = input

  // 用 scene 的第一个 object 的 world 坐标作为 scene 的投影锚点
  // （后续可扩展为 scene 自身的中心点）
  const anchorObject = scene.objects[0]
  const anchorWorld = objectWorldPos(scene, anchorObject)

  // 对每个采样帧做投影
  const frames = samples.map(sample => {
    const proj = projectToScreen({
      viewport,
      cameraPosition: sample.position,
      worldPos: anchorWorld,
      kind: scene.kind,
    })
    return {
      time: sample.time,
      screenX: proj.screenX,
      screenY: proj.screenY,
      scale: proj.scale,
      opacity: proj.opacity,
    }
  })

  // 将采样帧转为 SMIL keyframes
  // 注意：首帧为 initValue，后续帧为 timeline 段
  const totalDuration = frames[frames.length - 1].time

  // translate keyframes
  const translate = frames.slice(1).map((frame, i) => ({
    durationSeconds: frame.time - frames[i].time,
    toAbs: { x: frame.screenX, y: frame.screenY } as Partial<{ x: number; y: number }>,
  }))

  // scale keyframes
  const scale = frames.slice(1).map((frame, i) => ({
    durationSeconds: frame.time - frames[i].time,
    toAbs: frame.scale,
  }))

  // opacity keyframes
  const opacity = frames.slice(1).map((frame, i) => ({
    durationSeconds: frame.time - frames[i].time,
    toAbs: frame.opacity,
  }))

  return {
    sceneId: scene.id,
    translate,
    scale,
    opacity,
    crossings,
  }
}
