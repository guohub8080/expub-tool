import defaultTo from 'lodash/defaultTo'
import type { Vec3, Scene, ObjectNode, I_EntranceConfig } from '../types'

/** 深度缩放因子上限 */
const MAX_SCALE = 5

/**
 * depthScale — 深度缩放因子
 *
 * k = f / rz（简化 pinhole 模型）
 * rz <= 0.1 时钳制到 MAX_SCALE（避免除零 / 负值）
 */
export function depthScale(f: number, rz: number): number {
  if (rz <= 0.1) return MAX_SCALE
  return Math.min(f / rz, MAX_SCALE)
}

// ──────────────────────────── helpers ────────────────────────────

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

// ──────────────────────────── resolve ────────────────────────────

export interface I_ResolveObjectParams {
  object: ObjectNode
  scene: Scene
  cameraPos: Vec3
  focalLength: number
}

export interface I_ResolvedFrame {
  tx: number
  ty: number
  scale: number
  opacity: number
}

/**
 * resolveObject — 计算对象在某一时刻的屏幕空间状态
 *
 * 空间链路：objectLocal → sceneWorld → cameraRelative → screen2D
 *
 * 求值耦合（translate + scale 共享深度因子 k），输出分离。
 */
export function resolveObject(params: I_ResolveObjectParams): I_ResolvedFrame {
  const { object, scene, cameraPos, focalLength: f } = params

  // ① objectLocal → sceneWorld
  const worldX = scene.world.x + object.local.x
  const worldY = scene.world.y + object.local.y
  const worldZ = scene.world.z + object.local.z

  // ② sceneWorld → cameraRelative
  const rx = worldX - cameraPos.x
  const ry = worldY - cameraPos.y
  const rz = worldZ - cameraPos.z

  // ③ 深度缩放因子
  const k = depthScale(f, rz)

  // ④ cameraRelative → screen2D（相对视口中心）
  const worldTx = rx * k
  const worldTy = -ry * k
  const worldScale = k

  // ⑤ 入场修饰器（仅 passThrough 类型）
  if (scene.kind === 'passThrough') {
    const entrance = object.entrance ?? scene.entrance
    if (entrance) {
      return applyEntranceModifier(entrance, rz, worldTx, worldTy, worldScale)
    }
    // 无配置时默认行为：rz <= 0 时不可见，线性渐显
    return applyDefaultPassThrough(rz, worldTx, worldTy, worldScale)
  }

  // world 类型：始终可见
  return { tx: worldTx, ty: worldTy, scale: worldScale, opacity: 1 }
}

/**
 * 入场修饰器：
 * u = clamp(rz / triggerDistance, 0, 1)
 * u=0 时对象刚进入 → modifier 全开（opacity=from, offset=from）
 * u=1 时入场完成 → modifier 归零（opacity=to, offset=to）
 */
function applyEntranceModifier(
  entrance: I_EntranceConfig,
  rz: number,
  worldTx: number,
  worldTy: number,
  worldScale: number,
): I_ResolvedFrame {
  const triggerDist = defaultTo(entrance.triggerDistance, 200)
  const u = clamp(rz / triggerDist, 0, 1)

  const opacityFrom = defaultTo(entrance.opacity?.from, 0)
  const opacityTo = defaultTo(entrance.opacity?.to, 1)
  const scaleFrom = defaultTo(entrance.scale?.from, 1)
  const scaleTo = defaultTo(entrance.scale?.to, 1)
  const offsetXFrom = defaultTo(entrance.offsetX?.from, 0)
  const offsetXTo = defaultTo(entrance.offsetX?.to, 0)
  const offsetYFrom = defaultTo(entrance.offsetY?.from, 0)
  const offsetYTo = defaultTo(entrance.offsetY?.to, 0)

  return {
    tx: worldTx + lerp(offsetXFrom, offsetXTo, u),
    ty: worldTy + lerp(offsetYFrom, offsetYTo, u),
    scale: worldScale * lerp(scaleFrom, scaleTo, u),
    opacity: lerp(opacityFrom, opacityTo, u),
  }
}

/** 默认 passThrough 行为：rz < 0 不可见，线性渐显到 rz = 200 */
function applyDefaultPassThrough(
  rz: number,
  worldTx: number,
  worldTy: number,
  worldScale: number,
): I_ResolvedFrame {
  const u = clamp(rz / 200, 0, 1)
  return {
    tx: worldTx,
    ty: worldTy,
    scale: worldScale,
    opacity: u,
  }
}
