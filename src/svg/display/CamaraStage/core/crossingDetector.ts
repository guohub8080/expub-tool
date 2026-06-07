/**
 * crossingDetector — 穿越事件检测器
 *
 * 在 camera timeline 的采样过程中，检测每个 scene 的 rz 符号变化，
 * 输出穿越事件列表（含时间点和方向）。
 *
 * 设计要点：
 *   - 同一个 scene 可以发生多次穿越（折返 / 反复接近）
 *   - forward cross: rz 从负变正（camera 从后方穿到前方）
 *   - backward cross: rz 从正变负（camera 从前方穿到后方）
 */

import type { I_CrossingEvent, I_Vec3 } from "../types"
import type { I_NormalizedScene } from "../utils/normalizer"
import type { I_CameraSegmentResolved } from "./cameraSampler"
import { getCrossDirection } from "./projector"

export interface I_CrossingDetectorInput {
  /** scene 列表 */
  scenes: I_NormalizedScene[]
  /** camera 采样点（按时间排序） */
  cameraSamples: { time: number; position: I_Vec3 }[]
}

/**
 * 检测所有 scene 在给定 camera 采样序列中的穿越事件
 *
 * @returns Map<sceneId, I_CrossingEvent[]>
 */
export const detectCrossings = (
  input: I_CrossingDetectorInput,
): Map<string, I_CrossingEvent[]> => {
  const { scenes, cameraSamples } = input
  const crossingMap = new Map<string, I_CrossingEvent[]>()

  // 初始化每个 scene 的穿越列表
  for (const scene of scenes) {
    crossingMap.set(scene.id, [])
  }

  if (cameraSamples.length < 2) return crossingMap

  for (const scene of scenes) {
    const crossings: I_CrossingEvent[] = []
    let prevRz = scene.world.z - cameraSamples[0].position.z

    for (let i = 1; i < cameraSamples.length; i++) {
      const sample = cameraSamples[i]
      const currentRz = scene.world.z - sample.position.z
      const direction = getCrossDirection(prevRz, currentRz)

      if (direction) {
        crossings.push({
          // 精确穿越时间：线性插值估计 rz=0 的时间点
          time: estimateCrossingTime(
            cameraSamples[i - 1].time, prevRz,
            sample.time, currentRz,
          ),
          direction,
        })
      }

      prevRz = currentRz
    }

    crossingMap.set(scene.id, crossings)
  }

  return crossingMap
}

/**
 * 线性插值估计 rz=0 的精确时间
 *
 * 给定两个采样点的 (time, rz)，计算 rz=0 对应的时间。
 */
const estimateCrossingTime = (
  t1: number, rz1: number,
  t2: number, rz2: number,
): number => {
  if (rz1 === rz2) return t1
  // t_cross = t1 + (0 - rz1) / (rz2 - rz1) * (t2 - t1)
  return t1 + (-rz1 / (rz2 - rz1)) * (t2 - t1)
}
