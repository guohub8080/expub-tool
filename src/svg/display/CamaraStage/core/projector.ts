/**
 * projector — 统一运动公式 + 入场修饰器
 *
 * 核心公理：
 *   每个 layer 从一开始就属于统一的 camera/world 系统。
 *   入场不是一个独立于世界的动画系统，而是附着在 world projection
 *   之上的 temporary entrance modifier。该 modifier 只在入场窗口内生效，
 *   并随进度衰减到 0；当 modifier 消失后，layer 自然完全服从统一世界控制。
 *
 * 公式：
 *   rz = layerZ - cameraZ
 *   k = depthScale(rz)
 *
 *   worldTx = rx * k
 *   worldTy = -ry * k
 *   worldScale = k
 *
 *   u = entranceProgress(rz, role)      // 0=未入场, 1=完全并入世界
 *
 *   enterTx = (1-u) * entranceOffsetX   // 侧向偏移，衰减到 0
 *   enterScale = lerp(1.15, 1, u)       // 轻微放大，衰减到 1
 *   enterOpacity = u                     // 0→1 淡入
 *
 *   finalTx = worldTx + enterTx
 *   finalTy = worldTy + enterTy
 *   finalScale = worldScale * enterScale
 *   finalOpacity = enterOpacity
 */

import type { I_Vec3, T_LayerRole } from "../types"
import type { I_NormalizedViewport, I_NormalizedLayer } from "../utils/normalizer"

// ─── 配置 ───

/** rz≈0 时的 scale 上限 */
const MAX_SCALE = 5

/** 入场淡入距离（相对深度）。entering layer 在 rz ∈ (0, fadeDistance] 区间淡入 */
const FADE_DISTANCE_FACTOR = 1 // 乘以 f

/** 入场时的 scale 夸张系数（rz≈0 时最大，衰减到 1） */
const ENTER_SCALE_FROM = 1.15

/** 入场侧向偏移距离（像素，附加在 worldTx 上） */
const ENTER_OFFSET_PX = 120

// ─── depthScale ───

/**
 * 统一深度缩放：f / rz，rz≈0 时 clamp 到 MAX_SCALE
 *
 * - rz >> 0: 远处，scale < 1
 * - rz = f:  scale = 1（刚好满屏）
 * - rz ≈ 0:  scale = MAX_SCALE（近距限幅）
 * - rz ≤ 0:  scale = MAX_SCALE（后方，不可见由 opacity 控制）
 */
export const depthScale = (f: number, rz: number): number => {
  if (rz <= 0.1) return MAX_SCALE
  return Math.min(f / rz, MAX_SCALE)
}

// ─── entranceProgress ───

/**
 * 入场进度 u ∈ [0, 1]
 *
 * - base/foreground/background: rz > 0 即可见 (u=1), 否则 u=0
 * - entering: rz ∈ (0, f] 区间线性淡入, rz > f 完全可见
 *
 * u 的语义：0=不在主视野, 1=完全并入世界
 */
export const entranceProgress = (f: number, rz: number, role: T_LayerRole | undefined): number => {
  if (rz <= 0) return 0

  const r = role ?? "base"
  if (r !== "entering") return 1

  const fadeDistance = f * FADE_DISTANCE_FACTOR
  if (rz >= fadeDistance) return 1
  return rz / fadeDistance
}

// ─── 入场方向 ───

/**
 * 入场侧向偏移方向
 *
 * 基于 rx 的符号：rx > 0 从右侧入场, rx < 0 从左侧入场, rx ≈ 0 无偏移
 */
const entranceDirectionX = (rx: number): number => {
  if (Math.abs(rx) < 10) return 0 // 居中时不做侧向偏移
  return rx > 0 ? 1 : -1
}

// ─── 投影 ───

export interface I_LayerProjection {
  // world 主状态（统一 camera/world 公式）
  worldTx: number
  worldTy: number
  worldScale: number

  // 入场修饰器
  enterTx: number
  enterTy: number
  enterScale: number // 乘法因子，1 = 无修饰
  enterOpacity: number

  // 最终合成
  finalTx: number
  finalTy: number
  finalScale: number
  finalOpacity: number
}

export interface I_ProjectOptions {
  viewport: I_NormalizedViewport
  cameraPosition: I_Vec3
  layer: I_NormalizedLayer
}

/**
 * 投影：world state + entrance modifier → final state
 */
export const projectLayer = (options: I_ProjectOptions): I_LayerProjection => {
  const { viewport, cameraPosition, layer } = options
  const { f } = viewport

  // ── relative space ──
  const rx = layer.worldX - cameraPosition.x
  const ry = layer.worldY - cameraPosition.y
  const rz = layer.worldZ - cameraPosition.z

  // ── world state ──
  const k = depthScale(f, rz)
  const worldTx = rx * k
  const worldTy = -ry * k
  const worldScale = k

  // ── entrance modifier ──
  const u = entranceProgress(f, rz, layer.role)
  const dirX = entranceDirectionX(rx)
  const enterTx = dirX * (1 - u) * ENTER_OFFSET_PX
  const enterTy = 0
  const enterScale = layer.role === "entering" ? ENTER_SCALE_FROM + (1 - ENTER_SCALE_FROM) * u : 1
  const enterOpacity = u

  // ── final ──
  return {
    worldTx, worldTy, worldScale,
    enterTx, enterTy, enterScale, enterOpacity,
    finalTx: worldTx + enterTx,
    finalTy: worldTy + enterTy,
    finalScale: worldScale * enterScale,
    finalOpacity: enterOpacity,
  }
}
