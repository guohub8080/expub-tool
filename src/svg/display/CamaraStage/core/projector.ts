/**
 * projector — 空间投影器
 *
 * 将 world space 坐标投影为相对 viewport 中心的偏移量 + scale + opacity。
 *
 * 核心公式：
 *   rz = ez - cz                      （relative depth）
 *   scale = min(f / rz, MAX_SCALE)     （透视缩放 + 近距离限幅）
 *   offsetX = rx * scale               （相对 viewport 中心的水平偏移）
 *   offsetY = -ry * scale              （相对 viewport 中心的垂直偏移）
 *
 * 返回值语义：
 *   - offsetX / offsetY：直接用作 <g> 上 translate 动画的值
 *   - scale：直接用作 scale 动画的值
 *   - opacity：穿越时的导演式可见性控制
 *
 * 空间链路：objectLocal → sceneWorld → cameraRelative → screen2D
 */

import type { I_Vec3, I_ProjectionFrame, T_CrossDirection } from "../types"
import type { I_NormalizedViewport, I_NormalizedScene, I_NormalizedObject } from "../utils/normalizer"

// ─── 配置常量 ───

/** scale 最大值：防止 rz≈0 时 scale 爆炸 */
const MAX_SCALE = 5

/**
 * 穿越过渡区半径（相对深度单位）。
 * passThrough 元素在 |rz| < CROSSING_WINDOW 时逐步显现/消失。
 */
const CROSSING_WINDOW = 200

// ─── 投影函数 ───

export interface I_ProjectOptions {
  viewport: I_NormalizedViewport
  cameraPosition: I_Vec3
  worldPos: I_Vec3
  kind: "world" | "passThrough"
}

/**
 * 计算 clamp 后的安全 scale
 *
 * f/rz 在 rz→0 时趋于无穷，用 min 限幅。
 * 当 rz <= 0 时返回 MAX_SCALE（不会真的除以零）。
 */
const safeScale = (f: number, rz: number): number => {
  if (rz <= 0.1) return MAX_SCALE
  return Math.min(f / rz, MAX_SCALE)
}

/**
 * 将 world space 坐标投影为相对 viewport 中心的偏移 + scale + opacity
 *
 * ── world 类型（普通前景层）：
 *   rz > 0:  正常透视投影，opacity=1
 *   rz ≤ 0:  不可见（scale=0, opacity=0）
 *
 * ── passThrough 类型（穿越层）：
 *   rz > 0（前方）:  正常透视投影，opacity=1
 *   rz ≈ 0（穿越点）:  scale 限幅，opacity=1
 *   rz < 0 且 |rz| < CROSSING_WINDOW:  逐步显现（opacity 和 scale 随 |rz| 递减）
 *   rz < 0 且 |rz| ≥ CROSSING_WINDOW:  完全不可见
 */
export const projectToScreen = (options: I_ProjectOptions): I_ProjectionFrame => {
  const { viewport, cameraPosition, worldPos, kind } = options
  const { f } = viewport

  const rx = worldPos.x - cameraPosition.x
  const ry = worldPos.y - cameraPosition.y
  const rz = worldPos.z - cameraPosition.z

  // ── world 类型：简单前景/后景 ──
  if (kind === "world") {
    if (rz <= 0) {
      return { screenX: 0, screenY: 0, scale: 0, opacity: 0 }
    }
    const scale = safeScale(f, rz)
    return {
      screenX: rx * scale,
      screenY: -ry * scale,
      scale,
      opacity: 1,
    }
  }

  // ── passThrough 类型：支持穿越 ──

  // 前方（rz > 0）：正常透视，完全可见
  if (rz > 0) {
    const scale = safeScale(f, rz)
    return {
      screenX: rx * scale,
      screenY: -ry * scale,
      scale,
      opacity: 1,
    }
  }

  // 后方（rz ≤ 0）
  const absRz = Math.abs(rz)

  // 接近穿越点：逐步显现
  if (absRz < CROSSING_WINDOW) {
    const scale = safeScale(f, absRz)
    const t = absRz / CROSSING_WINDOW  // 0（穿越点）→ 1（过渡区边缘）
    return {
      screenX: rx * scale,
      screenY: -ry * scale,
      scale,
      opacity: 1 - t,  // 1（穿越点）→ 0（过渡区边缘）
    }
  }

  // 远离穿越点：完全不可见
  return { screenX: 0, screenY: 0, scale: 0, opacity: 0 }
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
