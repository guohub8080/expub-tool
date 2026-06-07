/**
 * cameraSampler — camera 时间线采样器
 *
 * 输入 camera.timeline（有序的 CameraSegment 数组），
 * 输出任一时刻 t 的 camera 绝对位置。
 *
 * 设计要点：
 *   - 纯函数，无副作用
 *   - 支持 toAbs（绝对目标）和 toRel（相对偏移）两种模式
 *   - t 超出 timeline 总时长时，clamp 到最后一帧
 *   - 返回精确的 { x, y, z }
 */

import type { I_CameraConfig, I_CameraSegment, I_Vec3 } from "../types"

/** 采样结果：camera 在时刻 t 的绝对世界坐标 */
export interface I_CameraSample {
  /** camera 世界坐标 */
  position: I_Vec3
  /** 采样时刻（秒） */
  time: number
}

/**
 * 预计算 camera timeline 的分段信息
 *
 * 将 timeline 解析为有序的分段列表，每段记录起止时间和起止位置。
 * 后续采样只需二分查找所在段，再做线性插值。
 */
export interface I_CameraSegmentResolved {
  /** 段起始时间（秒） */
  startTime: number
  /** 段结束时间（秒） */
  endTime: number
  /** 段起始时 camera 的绝对位置 */
  from: I_Vec3
  /** 段结束时 camera 的绝对位置 */
  to: I_Vec3
  /** 缓动曲线 */
  keySplines?: string
}

/** 解析 camera timeline 为分段列表 */
export const resolveCameraTimeline = (camera: I_CameraConfig): {
  segments: I_CameraSegmentResolved[]
  totalDuration: number
} => {
  const segments: I_CameraSegmentResolved[] = []
  let currentTime = 0
  let currentPos: I_Vec3 = { ...camera.initial }

  for (const seg of camera.timeline) {
    const from = { ...currentPos }
    const to: I_Vec3 = seg.toAbs
      ? { x: defaultTo(seg.toAbs.x, from.x), y: defaultTo(seg.toAbs.y, from.y), z: defaultTo(seg.toAbs.z, from.z) }
      : {
          x: from.x + (seg.toRel?.x ?? 0),
          y: from.y + (seg.toRel?.y ?? 0),
          z: from.z + (seg.toRel?.z ?? 0),
        }

    segments.push({
      startTime: currentTime,
      endTime: currentTime + seg.durationSeconds,
      from,
      to,
      keySplines: seg.keySplines,
    })

    currentTime += seg.durationSeconds
    currentPos = to
  }

  return { segments, totalDuration: currentTime }
}

/** 简单线性插值（后续可替换为 easing 函数） */
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/**
 * 采样 camera 在时刻 t 的绝对位置
 *
 * @param segments - 由 resolveCameraTimeline 生成的分段列表
 * @param t - 采样时刻（秒）
 * @returns camera 在时刻 t 的绝对世界坐标
 */
export const sampleCameraAt = (segments: I_CameraSegmentResolved[], t: number): I_CameraSample => {
  // clamp t 到 [0, totalDuration]
  const clamped = Math.max(0, Math.min(t, segments[segments.length - 1].endTime))

  // 二分查找所在段
  let lo = 0
  let hi = segments.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (segments[mid].startTime <= clamped) lo = mid
    else hi = mid - 1
  }

  const seg = segments[lo]
  const duration = seg.endTime - seg.startTime
  // 计算段内进度 [0, 1]
  const progress = duration > 0 ? (clamped - seg.startTime) / duration : 1

  return {
    position: {
      x: lerp(seg.from.x, seg.to.x, progress),
      y: lerp(seg.from.y, seg.to.y, progress),
      z: lerp(seg.from.z, seg.to.z, progress),
    },
    time: clamped,
  }
}

// ─── 内部工具 ───

/** lodash/defaultTo 的 inline 替代，避免循环依赖 */
function defaultTo<T>(value: T | undefined, defaultValue: T): T {
  return value === undefined || value === null ? defaultValue : value
}
