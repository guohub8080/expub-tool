/**
 * projector — 空间投影器
 *
 * 将 world space 坐标投影到 screen space，
 * 处理透视缩放、穿越 opacity、near-window 限幅。
 *
 * 公式：
 *   rz = ez - cz          （relative depth）
 *   scale = f / rz         （透视缩放，rz > 0 时有效）
 *   screenX = centerX + rx * scale
 *   screenY = centerY - ry * scale
 *
 * 空间链路：objectLocal → sceneWorld → cameraRelative → screen2D
 */

import type { I_Vec3, I_ProjectionFrame, T_CrossDirection } from "../types"
import type { I_NormalizedViewport, I_NormalizedScene, I_NormalizedObject } from "../utils/normalizer"

// ─── Crossing window 配置 ───

/**
 * 穿越 window 半径（相对深度单位）。
 * 当 |rz| < crossingWindow 时，进入导演式特殊处理区间，
 * 避免直接使用 f/rz 导致的奇点。
 */
const CROSSING_WINDOW = 50

/** near-window 限幅的最大 scale 值 */
const MAX_NEAR_SCALE = 5

// ─── 投影函数 ───

export interface I_ProjectOptions {
  /** 投影 / 视口配置 */
  viewport: I_NormalizedViewport
  /** camera 在时刻 t 的位置 */
  cameraPosition: I_Vec3
  /** 要投影的 world space 坐标 */
  worldPos: I_Vec3
  /** scene 类型，影响穿越行为 */
  kind: "world" | "passThrough"
}

/**
 * 将 world space 坐标投影为 screen space 结果
 *
 * 处理逻辑：
 *   1. 计算 relative space：rx, ry, rz
 *   2. rz > 0（前方）：正常透视投影
 *   3. rz ≈ 0（穿越窗口）：scale 限幅 + opacity 平滑过渡
 *   4. rz < 0（后方）：passThrough 类型在接近穿越时半透明，远离时不可见
 */
export const projectToScreen = (options: I_ProjectOptions): I_ProjectionFrame => {
  const { viewport, cameraPosition, worldPos, kind } = options
  const { centerX, centerY, f } = viewport

  // ── 1. relative space ──
  const rx = worldPos.x - cameraPosition.x
  const ry = worldPos.y - cameraPosition.y
  const rz = worldPos.z - cameraPosition.z

  // ── 2. 前方 (rz > 0) ──
  if (rz > CROSSING_WINDOW) {
    return {
      screenX: centerX + rx * (f / rz),
      screenY: centerY - ry * (f / rz),
      scale: f / rz,
      opacity: 1,
    }
  }

  // ── 3. 穿越窗口内 (|rz| ≤ crossingWindow) ──
  if (rz >= 0) {
    // rz 在 [0, crossingWindow] 之间
    // 从 crossingWindow 处的 scale=1 平滑过渡到 rz=0 处的 scale=MAX_NEAR_SCALE
    const t = rz / CROSSING_WINDOW // 1 → 0
    const safeScale = 1 + (MAX_NEAR_SCALE - 1) * (1 - t)
    return {
      screenX: centerX + rx * safeScale,
      screenY: centerY - ry * safeScale,
      scale: safeScale,
      opacity: kind === "passThrough" ? t : 1, // passThrough 在穿越窗口中逐步显现
    }
  }

  // ── 4. 后方 (rz < 0) ──
  if (kind === "world") {
    // world 类型：后方直接不可见
    return {
      screenX: centerX,
      screenY: centerY,
      scale: 0,
      opacity: 0,
    }
  }

  // passThrough 在后方接近穿越时逐步显现
  const absRz = Math.abs(rz)
  if (absRz < CROSSING_WINDOW) {
    // rz 在 [-crossingWindow, 0) 之间，接近穿越
    const t = absRz / CROSSING_WINDOW // 0 → 1
    const safeScale = 1 + (MAX_NEAR_SCALE - 1) * t
    return {
      screenX: centerX + rx * safeScale,
      screenY: centerY - ry * safeScale,
      scale: safeScale,
      opacity: 1 - t, // 逐步显现
    }
  }

  // 远离穿越窗口，完全不可见
  return {
    screenX: centerX,
    screenY: centerY,
    scale: 0,
    opacity: 0,
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
 *
 * - "forward":  rz 从负变正（camera 从 scene 后方穿到前方）
 * - "backward": rz 从正变负（camera 从 scene 前方穿到 scene 后方）
 */
export const getCrossDirection = (rzBefore: number, rzAfter: number): T_CrossDirection | null => {
  if (rzBefore < 0 && rzAfter >= 0) return "forward"
  if (rzBefore >= 0 && rzAfter < 0) return "backward"
  return null
}
