/**
 * compiler — 采样 + 编译（Approach B）
 *
 * 输出：
 *   - cameraBase：共享镜头运动（所有 layer 共用一个 animateTransform）
 *   - compiled layers：per-layer parallax delta + entrance modifier
 */

import type { I_CameraBaseCompiled, I_CompiledLayer } from "../types"
import type { I_NormalizedConfig } from "../utils/normalizer"
import { resolveCameraTimeline, sampleCameraAt } from "./cameraSampler"
import { projectLayer, cameraBaseTranslate } from "./projector"

export const compileAllLayers = (config: I_NormalizedConfig): {
  cameraBase: I_CameraBaseCompiled
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

  // ── camera base timeline（共享） ──
  const cameraBase = compileCameraBase(samples, viewport)

  // ── per-layer parallax + entrance ──
  const compiled = layers.map(layer => compileLayer({ viewport, layer, samples }))

  return { cameraBase, compiled, totalDuration }
}

/** 编译共享 camera base：translate(centerX - camera.x, centerY + camera.y) */
const compileCameraBase = (
  samples: { position: { x: number; y: number }; time: number }[],
  viewport: I_NormalizedConfig["viewport"],
): I_CameraBaseCompiled => {
  // cameraBase = (centerX - camera.x, centerY + camera.y)
  const toBase = (camX: number, camY: number) => ({
    x: viewport.centerX - camX,
    y: viewport.centerY + camY,
  })

  const firstBase = toBase(samples[0].position.x, samples[0].position.y)
  const dur = (i: number) => samples[i + 1].time - samples[i].time

  return {
    initTx: firstBase.x,
    initTy: firstBase.y,
    translateTimeline: samples.slice(1).map((s, i) => ({
      durationSeconds: dur(i),
      toAbs: toBase(s.position.x, s.position.y),
    })),
  }
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
    parallaxTx: frames[0].parallaxTx,
    parallaxTy: frames[0].parallaxTy,
    worldScale: frames[0].worldScale,
    enterTx: frames[0].enterTx,
    enterTy: frames[0].enterTy,
    enterScale: frames[0].enterScale,
    enterOpacity: frames[0].enterOpacity,
  }

  const dur = (i: number) => samples[i + 1].time - samples[i].time

  return {
    layerId: layer.id,
    init,
    // parallax translate (per-layer delta)
    parallaxTranslateTimeline: frames.slice(1).map((f, i) => ({
      durationSeconds: dur(i),
      toAbs: { x: f.parallaxTx, y: f.parallaxTy },
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
