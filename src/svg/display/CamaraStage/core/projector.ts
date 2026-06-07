/**
 * projector — 空间投影器
 *
 * 设计原则：
 *   - 正常显示时 scale = 1，不做连续透视缩放
 *   - scale 变化只出现在 passThrough 的穿越档口（rz≈0），制造穿越冲击感
 *   - 可见性完全由 opacity 控制：远 behind 不可见 → 接近穿越时淡入 → 穿越后可见
 *
 * 空间链路：objectLocal → sceneWorld → cameraRelative → screen2D
 */

import type { I_Vec3, I_ProjectionFrame, T_CrossDirection } from "../types"
import type { I_NormalizedViewport, I_NormalizedScene, I_NormalizedObject } from "../utils/normalizer"

// ─── 配置常量 ───

/**
 * 穿越缩放区半径（相对深度单位）。
 * |rz| < CROSSING_ZONE 时 scale 会从 1 增大到 CROSS_SCALE 再回落。
 */
const CROSSING_ZONE = 100

/** 穿越时的 scale 峰值（rz=0 时） */
const CROSS_SCALE = 1.5

/**
 * 淡入距离（相对深度单位，仅 behind 方向）。
 * passThrough 元素从不可见到穿越点的过渡距离。
 */
const FADE_DISTANCE = 300

// ─── 投影函数 ───

export interface I_ProjectOptions {
  viewport: I_NormalizedViewport
  cameraPosition: I_Vec3
  worldPos: I_Vec3
  kind: "world" | "passThrough"
}

/**
 * 计算穿越档口的 scale 放大系数
 *
 * 在 |rz| < CROSSING_ZONE 时，scale 从 1 增大到 CROSS_SCALE：
 *   rz = 0                → crossT = 1 → scale = CROSS_SCALE
 *   rz = ±CROSSING_ZONE   → crossT = 0 → scale = 1
 */
const crossingScale = (rz: number): number => {
  const absRz = Math.abs(rz)
  if (absRz >= CROSSING_ZONE) return 1
  const crossT = 1 - absRz / CROSSING_ZONE
  return 1 + (CROSS_SCALE - 1) * crossT
}

/**
 * 将 world space 坐标投影为相对 viewport 中心的偏移 + scale + opacity
 *
 * ── world 类型（普通前景层）：
 *   rz > 0:  可见，scale=1
 *   rz ≤ 0:  不可见
 *
 * ── passThrough 类型（穿越层）：
 *   rz > 0:  可见，scale=1（穿越区内有 scale burst）
 *   rz ≈ 0:  穿越点，scale 峰值，opacity=1
 *   -FADE_DISTANCE < rz < 0:  淡入中，opacity = 1 - |rz|/FADE_DISTANCE
 *   rz ≤ -FADE_DISTANCE:  不可见
 */
export const projectToScreen = (options: I_ProjectOptions): I_ProjectionFrame => {
  const { cameraPosition, worldPos, kind } = options

  const rx = worldPos.x - cameraPosition.x
  const ry = worldPos.y - cameraPosition.y
  const rz = worldPos.z - cameraPosition.z

  // ── world 类型：简单前景/后景 ──
  if (kind === "world") {
    if (rz <= 0) {
      return { screenX: 0, screenY: 0, scale: 0, opacity: 0 }
    }
    const scale = crossingScale(rz)
    return {
      screenX: rx * scale,
      screenY: -ry * scale,
      scale,
      opacity: 1,
    }
  }

  // ── passThrough 类型：穿越层 ──

  // 前方（rz ≥ 0）：可见，穿越区内有 scale burst
  if (rz >= 0) {
    const scale = crossingScale(rz)
    return {
      screenX: rx * scale,
      screenY: -ry * scale,
      scale,
      opacity: 1,
    }
  }

  // 后方（rz < 0）：根据距离淡入
  const absRz = Math.abs(rz)

  if (absRz > FADE_DISTANCE) {
    // 远离穿越点：完全不可见
    return { screenX: 0, screenY: 0, scale: 0, opacity: 0 }
  }

  // 接近穿越点：淡入
  const opacity = 1 - absRz / FADE_DISTANCE  // 0（远处）→ 1（穿越点）
  const scale = crossingScale(rz)             // 穿越区内有 burst
  return {
    screenX: rx * scale,
    screenY: -ry * scale,
    scale,
    opacity,
  }
}

/**
 * 计算 object 的 world 坐标
 *
 * objectLocal → sceneWorld：
 *   objectWorld = scene.world + object.local
 */
export const objectWorldPos = (scene: I_NormalizedScene, object: I_NormalizedObject): I_Vec3 => ({
  x: scene.world.x + object.local.x,
  y: scene.world.y + object.local.y,
  z: scene.world.z + object.local.z,
})

/**
 * 判断 rz 的符号变化，确定穿越方向
 */
export const getCrossDirection = (rzBefore: number, rzAfter: number): T_CrossDirection | null => {
  if (rzBefore < 0 && rzAfter >= 0) return "forward"
  if (rzBefore >= 0 && rzAfter < 0) return "backward"
  return null
}
