import defaultTo from 'lodash/defaultTo'
import type { Vec3, Camera, CameraSegment } from '../types'

/**
 * sampleCamera — 在时间 t（秒）采样相机位置
 *
 * 线性插值穿越 timeline 各段。
 * t < 0 返回 initial；t > totalDuration 返回最后一帧。
 */
export function sampleCamera(camera: Camera, t: number): Vec3 {
  let pos = { ...camera.initial }
  let elapsed = 0

  for (const seg of camera.timeline) {
    const segEnd = elapsed + seg.durationSeconds

    if (t <= elapsed) return pos

    if (t <= segEnd) {
      const localT = (t - elapsed) / seg.durationSeconds
      const target = resolveSegmentTarget(pos, seg)
      return {
        x: pos.x + (target.x - pos.x) * localT,
        y: pos.y + (target.y - pos.y) * localT,
        z: pos.z + (target.z - pos.z) * localT,
      }
    }

    pos = resolveSegmentTarget(pos, seg)
    elapsed = segEnd
  }

  return pos
}

function resolveSegmentTarget(current: Vec3, seg: CameraSegment): Vec3 {
  if (seg.toAbs) {
    return {
      x: defaultTo(seg.toAbs.x, current.x),
      y: defaultTo(seg.toAbs.y, current.y),
      z: defaultTo(seg.toAbs.z, current.z),
    }
  }
  if (seg.toRel) {
    return {
      x: current.x + defaultTo(seg.toRel.x, 0),
      y: current.y + defaultTo(seg.toRel.y, 0),
      z: current.z + defaultTo(seg.toRel.z, 0),
    }
  }
  return { ...current }
}
