/**
 * projector — Approach B：camera base + per-layer parallax delta
 *
 * 分解策略：
 *   camera base（共享）：(-camera.x, +camera.y) 放在 <g data-camera> 上
 *   parallax delta（per-layer）：每个 layer 的深度响应差值
 *
 * 数学推导：
 *   原始 worldTx = (layer.worldX - camera.x) * k
 *
 *   cameraBase = -camera.x
 *   parallaxDelta = worldTx - cameraBase
 *                 = (layer.worldX - camera.x) * k + camera.x
 *                 = layer.worldX * k + camera.x * (1 - k)
 *
 *   验证：cameraBase + parallaxDelta = -camera.x + layer.worldX*k + camera.x*(1-k)
 *                                   = layer.worldX*k - camera.x*k = (layer.worldX - camera.x)*k = worldTx ✓
 *
 * entrance modifier 不变，仍然附着在 per-layer 上。
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
  // per-layer parallax delta（已减去 camera base）
  parallaxTx: number
  parallaxTy: number
  worldScale: number

  // 入场修饰器
  enterTx: number
  enterTy: number
  enterScale: number // 乘法因子，1 = 无修饰
  enterOpacity: number
}

export interface I_ProjectOptions {
  viewport: I_NormalizedViewport
  cameraPosition: I_Vec3
  layer: I_NormalizedLayer
}

// ─── camera base ───

/**
 * Camera base translate：共享的镜头运动偏移
 *
 * cameraBase = (-camera.x, +camera.y)
 * 所有 layer 共用，放在 <g data-camera> 上
 */
export const cameraBaseTranslate = (cameraPosition: I_Vec3): { tx: number; ty: number } => ({
  tx: -cameraPosition.x,
  ty: cameraPosition.y,
})

// ─── 投影 ───

/**
 * 投影：camera base + parallax delta + entrance modifier
 *
 * parallaxDelta = layer 的深度响应差值（减去 camera base 后的部分）
 */
export const projectLayer = (options: I_ProjectOptions): I_LayerProjection => {
  const { viewport, cameraPosition, layer } = options
  const { f } = viewport

  // ── relative space ──
  const rx = layer.worldX - cameraPosition.x
  const ry = layer.worldY - cameraPosition.y
  const rz = layer.worldZ - cameraPosition.z

  // ── depth scale ──
  const k = depthScale(f, rz)

  // ── parallax delta (approach B) ──
  // worldTx = (layer.worldX - camera.x) * k
  // parallaxDelta = worldTx - cameraBaseTx = worldTx - (-camera.x)
  //               = layer.worldX * k + camera.x * (1 - k)
  const parallaxTx = layer.worldX * k + cameraPosition.x * (1 - k)
  // worldTy = -(layer.worldY - camera.y) * k
  // parallaxDelta = worldTy - cameraBaseTy = worldTy - camera.y
  //               = -layer.worldY * k + camera.y * (k - 1)
  const parallaxTy = -layer.worldY * k + cameraPosition.y * (k - 1)
  const worldScale = k

  // ── entrance modifier ──
  const u = entranceProgress(f, rz, layer.role)
  const dirX = entranceDirectionX(rx)
  const enterTx = dirX * (1 - u) * ENTER_OFFSET_PX
  const enterTy = 0
  const enterScale = layer.role === "entering" ? ENTER_SCALE_FROM + (1 - ENTER_SCALE_FROM) * u : 1
  const enterOpacity = u

  return {
    parallaxTx, parallaxTy, worldScale,
    enterTx, enterTy, enterScale, enterOpacity,
  }
}
