/**
 * normalizer — 标准化用户 props
 */

import defaultTo from "lodash/defaultTo"
import type { I_CameraConfig, I_LayerConfig, I_ViewportConfig, I_CamaraStageProps } from "../types"

export const DEFAULT_SAMPLE_RATE = 30
export const DEFAULT_FOCAL_LENGTH = 300

export interface I_NormalizedViewport {
  width: number
  height: number
  f: number
  centerX: number
  centerY: number
}

export interface I_NormalizedLayer {
  id: string
  url?: string
  jsx?: React.ReactNode
  worldX: number
  worldY: number
  worldZ: number
  role: I_LayerConfig["role"]
  timeline?: I_LayerConfig["timeline"]
}

export interface I_NormalizedConfig {
  viewport: I_NormalizedViewport
  camera: I_CameraConfig
  layers: I_NormalizedLayer[]
  sampleRate: number
  canvasBg?: string
  spacing?: I_CamaraStageProps["spacing"]
}

export const normalizeViewport = (v: I_ViewportConfig): I_NormalizedViewport => {
  if (!v.width || !v.height) throw new Error("`viewport.width` and `viewport.height` are required.")
  return {
    width: v.width,
    height: v.height,
    f: defaultTo(v.f, DEFAULT_FOCAL_LENGTH),
    centerX: v.width / 2,
    centerY: v.height / 2,
  }
}

export const normalizeCamera = (camera: I_CameraConfig): I_CameraConfig => {
  if (!camera.initial) throw new Error("`camera.initial` is required.")
  if (!camera.timeline?.length) throw new Error("`camera.timeline` must not be empty.")
  return {
    initial: { ...camera.initial },
    timeline: camera.timeline.map(s => ({
      durationSeconds: s.durationSeconds,
      toAbs: s.toAbs,
      toRel: s.toRel,
      keySplines: s.keySplines,
    })),
  }
}

export const normalizeLayer = (layer: I_LayerConfig): I_NormalizedLayer => {
  if (!layer.id) throw new Error("Each layer must have an `id`.")
  if (!layer.url && !layer.jsx) throw new Error(`Layer "${layer.id}" must have \`url\` or \`jsx\`.`)
  return {
    id: layer.id,
    url: layer.url,
    jsx: layer.jsx,
    worldX: layer.worldX,
    worldY: layer.worldY,
    worldZ: layer.worldZ,
    role: layer.role,
    timeline: layer.timeline,
  }
}

export const normalizeProps = (props: I_CamaraStageProps): I_NormalizedConfig => {
  if (!props.layers?.length) throw new Error("`layers` must not be empty.")
  return {
    viewport: normalizeViewport(props.viewport),
    camera: normalizeCamera(props.camera),
    layers: props.layers.map(normalizeLayer),
    sampleRate: defaultTo(props.sampleRate, DEFAULT_SAMPLE_RATE),
    canvasBg: props.canvasBg,
    spacing: props.spacing,
  }
}
