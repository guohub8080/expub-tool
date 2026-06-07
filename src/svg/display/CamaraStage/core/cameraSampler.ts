/**
 * cameraSampler — 解析 camera timeline，按采样率输出每帧位置
 *
 * 纯函数，无副作用。支持 toAbs / toRel 两种段模式。
 */

import type { I_CameraConfig, I_Vec3 } from "../types"

export interface I_CameraSegmentResolved {
  startTime: number
  endTime: number
  from: I_Vec3
  to: I_Vec3
  keySplines?: string
}

export interface I_CameraSample {
  position: I_Vec3
  time: number
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function defaultTo<T>(v: T | undefined, d: T): T {
  return v === undefined || v === null ? d : v
}

/** 将 camera timeline 解析为分段列表 + 总时长 */
export const resolveCameraTimeline = (camera: I_CameraConfig) => {
  const segments: I_CameraSegmentResolved[] = []
  let currentTime = 0
  let currentPos: I_Vec3 = { ...camera.initial }

  for (const seg of camera.timeline) {
    const from = { ...currentPos }
    const to: I_Vec3 = seg.toAbs
      ? { x: defaultTo(seg.toAbs.x, from.x), y: defaultTo(seg.toAbs.y, from.y), z: defaultTo(seg.toAbs.z, from.z) }
      : { x: from.x + (seg.toRel?.x ?? 0), y: from.y + (seg.toRel?.y ?? 0), z: from.z + (seg.toRel?.z ?? 0) }

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

/** 采样 camera 在时刻 t 的绝对位置 */
export const sampleCameraAt = (segments: I_CameraSegmentResolved[], t: number): I_CameraSample => {
  const clamped = Math.max(0, Math.min(t, segments[segments.length - 1].endTime))

  // 二分查找所在段
  let lo = 0, hi = segments.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (segments[mid].startTime <= clamped) lo = mid
    else hi = mid - 1
  }

  const seg = segments[lo]
  const duration = seg.endTime - seg.startTime
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
