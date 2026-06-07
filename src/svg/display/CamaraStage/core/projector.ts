/**
 * projector — 统一运动公式
 *
 * 核心：所有 layer 共享同一套 depthScale + translate 公式。
 * translate 和 scale 耦合于同一个 rz。
 *
 *   rz = layerZ - cameraZ
 *   scale = depthScale(rz)
 *   tx = rx * scale
 *   ty = -ry * scale
 *   opacity = visibility(rz, role)
 *
 * depthScale 规则：
 *   rz > nearClip:   scale = f / rz           （正常连续透视）
 *   0 < rz ≤ nearClip: scale 线性插值，从 f/nearClip 到 maxScale  （近距限幅）
 *   rz ≤ 0:           scale 由 kind 决定       （后方处理）
 *
 * visibility 规则：
 *   base / foreground / background: rz > 0 可见，否则不可见
 *   entering: rz > fadeStart 时完全可见
 *             0 < rz < fadeStart 时逐步淡入
 *             rz ≤ 0 时不可见
 *             fadeStart = f（即 rz 刚过 f 时开始可见，此时 scale=1）
 */

import type { I_Vec3 } from "../types"
import type { I_NormalizedViewport, I_NormalizedLayer } from "../utils/normalizer"
import type { T_LayerRole } from "../types"

// ─── 配置 ───

/** rz≈0 时的 scale 上限，防止无穷大 */
const MAX_SCALE = 5

/**
 * 后方 layer 的淡入距离。
 * entering layer 从 rz=0 到 rz=fadeDistance 的区间内 opacity 从 0→1。
 * 设为 f，意味着当 rz=f 时 opacity=1（此时 scale=1，刚好满屏）。
 */
const FADE_DISTANCE_FACTOR = 1 // 乘以 f

// ─── depthScale ───

/**
 * 导演式近似 depthScale
 *
 * 正常区：scale = f / rz（连续透视）
 * 近距区（rz < f/MAX_SCALE）：线性插值到 MAX_SCALE，避免跳变
 * 后方（rz ≤ 0）：返回 MAX_SCALE（不可见由 opacity 控制）
 */
export const depthScale = (f: number, rz: number): number => {
  if (rz <= 0) return MAX_SCALE

  const normalScale = f / rz
  if (normalScale <= MAX_SCALE) return normalScale

  // rz 很小，f/rz 超过 MAX_SCALE。
  // 在 rz∈(0, f/MAX_SCALE] 区间内线性插值：MAX_SCALE → MAX_SCALE
  // 实际就是在 rz < f/MAX_SCALE 时 clamp 到 MAX_SCALE
  return MAX_SCALE
}

// ─── visibility ───

/**
 * 导演式可见性规则
 *
 * - base / foreground / background: rz > 0 → 1，否则 → 0
 * - entering: 在 rz ∈ (0, fadeDistance] 内线性淡入 0→1
 *             rz > fadeDistance → 1
 *             rz ≤ 0 → 0
 */
export const visibility = (f: number, rz: number, role: T_LayerRole | undefined): number => {
  if (rz <= 0) return 0

  const r = role ?? "base"

  // 非 entering 角色：前方就可见
  if (r !== "entering") return 1

  // entering 角色：在 fadeDistance 区间内淡入
  const fadeDistance = f * FADE_DISTANCE_FACTOR
  if (rz >= fadeDistance) return 1

  return rz / fadeDistance
}

// ─── 投影 ───

export interface I_ProjectOptions {
  viewport: I_NormalizedViewport
  cameraPosition: I_Vec3
  layer: I_NormalizedLayer
}

/**
 * 将 layer 投影为相对 viewport 中心的偏移 + scale + opacity
 *
 * 返回的 tx/ty 是相对 viewport 中心的像素偏移，
 * 直接用作 <g> 上 translate 动画的值（外层已 translate 到中心）。
 */
export const projectLayer = (options: I_ProjectOptions) => {
  const { viewport, cameraPosition, layer } = options
  const { f } = viewport

  const rx = layer.worldX - cameraPosition.x
  const ry = layer.worldY - cameraPosition.y
  const rz = layer.worldZ - cameraPosition.z

  const scale = depthScale(f, rz)
  const opacity = visibility(f, rz, layer.role)

  return {
    tx: rx * scale,
    ty: -ry * scale,
    scale,
    opacity,
  }
}
