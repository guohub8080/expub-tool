/**
 * compiler — 采样 + 编译
 *
 * 对每个 layer 的每帧投影出 worldState + entranceModifier，
 * 分别编译为独立的 SMIL timeline。
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

  const sampleCount = Math.ceil(totalDuration * sampleRate) + 1
  const samples = Array.from({ length: sampleCount }, (_, i) => {
    const t = (i / (sampleCount - 1)) * totalDuration
    return sampleCameraAt(segments, t)
  })

  const compiled = layers.map(layer => compileLayer({ viewport, layer, samples }))
  return { compiled, totalDuration }
}

const compileLayer = ({
  viewport, layer, samples,
}: {
  viewport: I_NormalizedConfig["viewport"]
  layer: I_NormalizedConfig["layers"][number]
  samples: { position: { x: number; y: number; z: number }; time: number }[]
}): I_CompiledLayer => {
  const frames = samples.map(sample =>
    projectLayer({ viewport, cameraPosition: sample.position, layer })
  )

  const init = {
    // world state
    worldTx: frames[0].worldTx,
    worldTy: frames[0].worldTy,
    worldScale: frames[0].worldScale,
    // entrance modifier
    enterTx: frames[0].enterTx,
    enterTy: frames[0].enterTy,
    enterScale: frames[0].enterScale,
    enterOpacity: frames[0].enterOpacity,
    // final
    finalTx: frames[0].finalTx,
    finalTy: frames[0].finalTy,
    finalScale: frames[0].finalScale,
    finalOpacity: frames[0].finalOpacity,
  }

  const dur = (i: number) => samples[i + 1].time - samples[i].time

  return {
    layerId: layer.id,
    init,
    // world translate
    worldTranslateTimeline: frames.slice(1).map((f, i) => ({
      durationSeconds: dur(i),
      toAbs: { x: f.worldTx, y: f.worldTy },
    })),
    // world scale
    worldScaleTimeline: frames.slice(1).map((f, i) => ({
      durationSeconds: dur(i),
      toAbs: f.worldScale,
    })),
    // entrance translate (offset)
    enterTranslateTimeline: frames.slice(1).map((f, i) => ({
      durationSeconds: dur(i),
      toAbs: { x: f.enterTx, y: f.enterTy },
    })),
    // entrance scale (factor, multiplicative on worldScale)
    enterScaleTimeline: frames.slice(1).map((f, i) => ({
      durationSeconds: dur(i),
      toAbs: f.enterScale,
    })),
    // entrance opacity
    enterOpacityTimeline: frames.slice(1).map((f, i) => ({
      durationSeconds: dur(i),
      toAbs: f.enterOpacity,
    })),
  }
}
