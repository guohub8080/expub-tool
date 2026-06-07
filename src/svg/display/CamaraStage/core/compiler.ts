/**
 * compiler — 采样 + 编译
 *
 * 流程：
 *   1. 解析 camera timeline → 分段 + 总时长
 *   2. 按 sampleRate 均匀采样 camera 位置
 *   3. 对每个 layer 的每帧做投影 → tx / ty / scale / opacity
 *   4. 首帧为 initValue，后续帧为 timeline keyframes
 */

import type { I_CompiledLayer } from "../types"
import type { I_NormalizedConfig } from "../utils/normalizer"
import { resolveCameraTimeline, sampleCameraAt } from "./cameraSampler"
import { projectLayer } from "./projector"

export const compileAllLayers = (config: I_NormalizedConfig): {
  compiled: I_CompiledLayer[]
  totalDuration: number
} => {
  const { viewport, camera, layers, sampleRate } = config
  const { segments, totalDuration } = resolveCameraTimeline(camera)

  // 均匀采样 camera 位置
  const sampleCount = Math.ceil(totalDuration * sampleRate) + 1
  const samples = Array.from({ length: sampleCount }, (_, i) => {
    const t = (i / (sampleCount - 1)) * totalDuration
    return sampleCameraAt(segments, t)
  })

  const compiled = layers.map(layer => compileLayer({ viewport, layer, samples }))

  return { compiled, totalDuration }
}

const compileLayer = ({
  viewport,
  layer,
  samples,
}: {
  viewport: I_NormalizedConfig["viewport"]
  layer: I_NormalizedConfig["layers"][number]
  samples: { position: { x: number; y: number; z: number }; time: number }[]
}): I_CompiledLayer => {
  // 对每帧投影
  const frames = samples.map(sample =>
    projectLayer({ viewport, cameraPosition: sample.position, layer })
  )

  // 首帧为 initValue
  const init = {
    tx: frames[0].tx,
    ty: frames[0].ty,
    scale: frames[0].scale,
    opacity: frames[0].opacity,
  }

  // 后续帧 → timeline keyframes
  const translateTimeline = frames.slice(1).map((frame, i) => ({
    durationSeconds: samples[i + 1].time - samples[i].time,
    toAbs: { x: frame.tx, y: frame.ty },
  }))

  const scaleTimeline = frames.slice(1).map((frame, i) => ({
    durationSeconds: samples[i + 1].time - samples[i].time,
    toAbs: frame.scale,
  }))

  const opacityTimeline = frames.slice(1).map((frame, i) => ({
    durationSeconds: samples[i + 1].time - samples[i].time,
    toAbs: frame.opacity,
  }))

  return {
    layerId: layer.id,
    init,
    translateTimeline,
    scaleTimeline,
    opacityTimeline,
  }
}
