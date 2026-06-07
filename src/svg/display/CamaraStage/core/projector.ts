/**
 * projector — 空间投影器
 *
 * 将 world space 坐标投影为相对 viewport 中心的偏移量 + scale + opacity。
 *
 * 公式：
 *   rz = ez - cz              （relative depth）
 *   scale = f / rz             （透视缩放，rz > 0 时有效）
 *   offsetX = rx * scale       （相对 viewport 中心的水平偏移）
 *   offsetY = -ry * scale      （相对 viewport 中心的垂直偏移，y 轴翻转）
 *
 * 空间链路：objectLocal → sceneWorld → cameraRelative → screen2D
 *
 * 重要：返回的 offsetX/offsetY 是**相对 viewport 中心的偏移**，
 * 不是绝对 SVG 坐标。因为外层 <g> 已经 translate 到 viewport 中心，
 * 这里的 translate 值直接用 offset 即可。
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
 * 将 world space 坐标投影为相对 viewport 中心的偏移 + scale + opacity
 *
 * 返回值语义：
 *   - offsetX / offsetY：相对 viewport 中心的像素偏移
 *     直接用作 <g> 上 translate 动画的值（外层已 translate 到中心）
 *   - scale：透视缩放比，直接用作 scale 动画的值
 *   - opacity：导演式透明度，用于穿越时控制可见性
 *
 * 处理逻辑：
 *   1. 计算 relative space：rx, ry, rz
 *   2. rz > crossingWindow（前方）：正常透视投影
 *   3. 0 ≤ rz ≤ crossingWindow（穿越窗口）：scale 限幅 + opacity 平滑过渡
 *   4. rz < 0（后方）：passThrough 在接近穿越时半透明，远离时不可见
 */
export const projectToScreen = (options: I_ProjectOptions): I_ProjectionFrame => {
  const { viewport, cameraPosition, worldPos, kind } = options
  const { f } = viewport

  // ── 1. relative space ──
  const rx = worldPos.x - cameraPosition.x
  const ry = worldPos.y - cameraPosition.y
  const rz = worldPos.z - cameraPosition.z

  // ── 2. 前方 (rz > crossingWindow) ──
  if (rz > CROSSING_WINDOW) {
    const scale = f / rz
    return {
      screenX: rx * scale,
      screenY: -ry * scale,
      scale,
      opacity: 1,
    }
  }

  // ── 3. 穿越窗口内 (0 ≤ rz ≤ crossingWindow) ──
  if (rz >= 0) {
    // rz 从 crossingWindow → 0，scale 从 f/crossingWindow → MAX_NEAR_SCALE
    const t = rz / CROSSING_WINDOW // 1 → 0
    const safeScale = 1 + (MAX_NEAR_SCALE - 1) * (1 - t)
    return {
      screenX: rx * safeScale,
      screenY: -ry * safeScale,
      scale: safeScale,
      opacity: kind === "passThrough" ? t : 1,
    }
  }

  // ── 4. 后方 (rz < 0) ──
  if (kind === "world") {
    return {
      screenX: 0,
      screenY: 0,
      scale: 0,
      opacity: 0,
    }
  }

  // passThrough 在后方接近穿越时逐步显现
  const absRz = Math.abs(rz)
  if (absRz < CROSSING_WINDOW) {
    const t = absRz / CROSSING_WINDOW // 0 → 1
    const safeScale = 1 + (MAX_NEAR_SCALE - 1) * t
    return {
      screenX: rx * safeScale,
      screenY: -ry * safeScale,
      scale: safeScale,
      opacity: 1 - t,
    }
  }

  // 远离穿越窗口，完全不可见
  return {
    screenX: 0,
    screenY: 0,
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
