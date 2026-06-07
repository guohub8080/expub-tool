/**
 * normalizer — 将用户传入的 CamaraStage props 标准化为内部数据结构
 *
 * 职责：
 *   - 填充默认值（sampleRate、object.local 缺失字段等）
 *   - 校验必填字段（camera.timeline 非空、scene 必须有 objects 等）
 *   - 不做任何投影计算，只做数据清洗
 */

import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import type {
  I_CameraConfig,
  I_SceneConfig,
  I_ObjectNodeConfig,
  I_ViewportConfig,
  I_CamaraStageProps,
  I_Vec3,
} from "../types"

// ─── 默认值 ───

/** 默认采样率：30 fps */
export const DEFAULT_SAMPLE_RATE = 30

/** 默认投影焦距 */
export const DEFAULT_FOCAL_LENGTH = 300

// ─── 标准化后的内部类型 ───

export interface I_NormalizedViewport {
  width: number
  height: number
  f: number
  /** viewport 中心 */
  centerX: number
  centerY: number
}

export interface I_NormalizedObject {
  id: string
  /** object 在 scene 内的坐标（所有字段已填充） */
  local: I_Vec3
  url?: string
  jsx?: React.ReactNode
  timeline?: I_ObjectNodeConfig["timeline"]
}

export interface I_NormalizedScene {
  id: string
  world: I_Vec3
  kind: I_SceneConfig["kind"]
  timeline?: I_SceneConfig["timeline"]
  objects: I_NormalizedObject[]
}

// ─── 标准化函数 ───

/** 标准化视口配置 */
export const normalizeViewport = (viewport: I_ViewportConfig): I_NormalizedViewport => {
  if (!viewport.width || !viewport.height) {
    throw new Error("`viewport.width` and `viewport.height` are required.")
  }
  return {
    width: viewport.width,
    height: viewport.height,
    f: defaultTo(viewport.f, DEFAULT_FOCAL_LENGTH),
    centerX: viewport.width / 2,
    centerY: viewport.height / 2,
  }
}

/** 标准化 camera 配置 */
export const normalizeCamera = (camera: I_CameraConfig): I_CameraConfig => {
  if (!camera.initial) {
    throw new Error("`camera.initial` is required.")
  }
  if (!camera.timeline?.length) {
    throw new Error("`camera.timeline` must not be empty.")
  }
  return {
    initial: { ...camera.initial },
    timeline: camera.timeline.map(seg => ({
      durationSeconds: seg.durationSeconds,
      toAbs: seg.toAbs,
      toRel: seg.toRel,
      keySplines: seg.keySplines,
    })),
  }
}

/** 标准化单个 object */
const normalizeObject = (obj: I_ObjectNodeConfig): I_NormalizedObject => {
  if (!obj.id) {
    throw new Error("Each object must have an `id`.")
  }
  if (!obj.url && !obj.jsx) {
    throw new Error(`Object "${obj.id}" must have either \`url\` or \`jsx\`.`)
  }

  return {
    id: obj.id,
    local: {
      x: defaultTo(obj.local?.x, 0),
      y: defaultTo(obj.local?.y, 0),
      z: defaultTo(obj.local?.z, 0),
    },
    url: obj.url,
    jsx: obj.jsx,
    timeline: obj.timeline,
  }
}

/** 标准化单个 scene */
export const normalizeScene = (scene: I_SceneConfig): I_NormalizedScene => {
  if (!scene.id) {
    throw new Error("Each scene must have an `id`.")
  }
  if (!scene.world) {
    throw new Error(`Scene "${scene.id}" must have a \`world\` position.`)
  }
  if (!scene.objects?.length) {
    throw new Error(`Scene "${scene.id}" must have at least one object.`)
  }

  return {
    id: scene.id,
    world: { ...scene.world },
    kind: scene.kind,
    timeline: scene.timeline,
    objects: scene.objects.map(normalizeObject),
  }
}

/** 标准化完整 CamaraStage props */
export interface I_NormalizedCamaraStage {
  viewport: I_NormalizedViewport
  camera: I_CameraConfig
  scenes: I_NormalizedScene[]
  sampleRate: number
  canvasBg?: string
  spacing?: I_CamaraStageProps["spacing"]
}

export const normalizeCamaraStageProps = (props: I_CamaraStageProps): I_NormalizedCamaraStage => {
  if (!props.scenes?.length) {
    throw new Error("`scenes` must not be empty.")
  }

  return {
    viewport: normalizeViewport(props.viewport),
    camera: normalizeCamera(props.camera),
    scenes: props.scenes.map(normalizeScene),
    sampleRate: defaultTo(props.sampleRate, DEFAULT_SAMPLE_RATE),
    canvasBg: props.canvasBg,
    spacing: props.spacing,
  }
}
