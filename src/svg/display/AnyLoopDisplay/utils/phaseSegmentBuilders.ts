import sum from "lodash/sum"
import type { I_NormalizedChildItem } from "./normalizer"

/**
 * 构建 rotation 单阶段（entry 或 exit）的 timeline segments
 *
 * - 简单模式（无 timeline）：生成单段 initValue→simpleTargetValue
 * - 高级模式（有 timeline）：使用用户自定义 timeline，不足 phaseDuration 时自动补 hold 段
 */
export const buildRotationPhaseSegments = ({
  rotationConfig,
  phaseDuration,
  simpleTargetValue,
  defaultEase,
}: {
  rotationConfig?: I_NormalizedChildItem['entry']['rotation']
  phaseDuration: number
  /** 简单模式下的目标值（entry=0, exit=exitRotation.initValue） */
  simpleTargetValue: number
  defaultEase: string
}): { durationSeconds: number; to: number; keySplines?: string }[] => {
  if (!rotationConfig?.timeline) {
    // 简单模式：单段动画到目标值
    return [{ durationSeconds: phaseDuration, to: simpleTargetValue, keySplines: defaultEase }]
  }

  // 高级模式：使用用户 timeline
  const timelineTotal = sum(rotationConfig.timeline.map(segment => segment.durationSeconds))
  if (timelineTotal > phaseDuration) {
    throw new Error(`Rotation timeline total duration (${timelineTotal}s) must not exceed phase duration (${phaseDuration}s).`)
  }

  const lastValue = rotationConfig.timeline[rotationConfig.timeline.length - 1].to
  const padding = phaseDuration - timelineTotal

  return [
    ...rotationConfig.timeline,
    ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
  ]
}

/**
 * 构建 scale 单阶段（entry 或 exit）的 timeline segments
 *
 * - 简单模式（无 timeline）：生成单段 initValue→simpleTargetValue
 * - 高级模式（有 timeline）：使用用户自定义 timeline，不足 phaseDuration 时自动补 hold 段
 */
export const buildScalePhaseSegments = ({
  scaleConfig,
  phaseDuration,
  simpleTargetValue,
  defaultEase,
}: {
  scaleConfig?: I_NormalizedChildItem['entry']['scale']
  phaseDuration: number
  /** 简单模式下的目标值（entry=1, exit=exitScale.initValue） */
  simpleTargetValue: number
  defaultEase: string
}): { durationSeconds: number; to: number; keySplines?: string }[] => {
  if (!scaleConfig?.timeline) {
    // 简单模式：单段动画到目标值
    return [{ durationSeconds: phaseDuration, to: simpleTargetValue, keySplines: defaultEase }]
  }

  // 高级模式：使用用户 timeline
  const timelineTotal = sum(scaleConfig.timeline.map(segment => segment.durationSeconds))
  if (timelineTotal > phaseDuration) {
    throw new Error(`Scale timeline total duration (${timelineTotal}s) must not exceed phase duration (${phaseDuration}s).`)
  }

  const lastValue = scaleConfig.timeline[scaleConfig.timeline.length - 1].to
  const padding = phaseDuration - timelineTotal

  return [
    ...scaleConfig.timeline,
    ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
  ]
}
