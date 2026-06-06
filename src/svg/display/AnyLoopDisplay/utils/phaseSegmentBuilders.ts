import sum from "lodash/sum"
import type { I_NormalizedChildItem, I_NormalizedTranslateConfig, I_NormalizedStayTranslateConfig } from "./normalizer"

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

/**
 * 构建 opacity 单阶段（entry 或 exit）的 timeline segments
 *
 * - 简单模式（无 timeline）：生成单段 initValue→simpleTargetValue
 * - 高级模式（有 timeline）：使用用户自定义 timeline，不足 phaseDuration 时自动补 hold 段
 */
export const buildOpacityPhaseSegments = ({
  opacityConfig,
  phaseDuration,
  simpleTargetValue,
  defaultEase,
}: {
  opacityConfig?: I_NormalizedChildItem['entry']['opacity']
  phaseDuration: number
  /** 简单模式下的目标值（entry=1, exit=exitOpacity.initValue） */
  simpleTargetValue: number
  defaultEase: string
}): { durationSeconds: number; to: number; keySplines?: string }[] => {
  if (!opacityConfig?.timeline) {
    // 简单模式：单段动画到目标值
    return [{ durationSeconds: phaseDuration, to: simpleTargetValue, keySplines: defaultEase }]
  }

  // 高级模式：使用用户 timeline
  const timelineTotal = sum(opacityConfig.timeline.map(segment => segment.durationSeconds))
  if (timelineTotal > phaseDuration) {
    throw new Error(`Opacity timeline total duration (${timelineTotal}s) must not exceed phase duration (${phaseDuration}s).`)
  }

  const lastValue = opacityConfig.timeline[opacityConfig.timeline.length - 1].to
  const padding = phaseDuration - timelineTotal

  return [
    ...opacityConfig.timeline,
    ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
  ]
}

/**
 * 构建 skew 单阶段（entry 或 exit）的 timeline segments
 *
 * - 简单模式（无 timeline）：生成单段 initValue→simpleTargetValue
 * - 高级模式（有 timeline）：使用用户自定义 timeline，不足 phaseDuration 时自动补 hold 段
 */
export const buildSkewPhaseSegments = ({
  skewConfig,
  phaseDuration,
  simpleTargetValue,
  defaultEase,
}: {
  skewConfig?: I_NormalizedChildItem['entry']['skewX']
  phaseDuration: number
  /** 简单模式下的目标值（entry=0, exit=exitSkew.initValue） */
  simpleTargetValue: number
  defaultEase: string
}): { durationSeconds: number; to: number; keySplines?: string }[] => {
  if (!skewConfig?.timeline) {
    // 简单模式：单段动画到目标值
    return [{ durationSeconds: phaseDuration, to: simpleTargetValue, keySplines: defaultEase }]
  }

  // 高级模式：使用用户 timeline
  const timelineTotal = sum(skewConfig.timeline.map(segment => segment.durationSeconds))
  if (timelineTotal > phaseDuration) {
    throw new Error(`Skew timeline total duration (${timelineTotal}s) must not exceed phase duration (${phaseDuration}s).`)
  }

  const lastValue = skewConfig.timeline[skewConfig.timeline.length - 1].to
  const padding = phaseDuration - timelineTotal

  return [
    ...skewConfig.timeline,
    ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
  ]
}

/**
 * 构建 stay 阶段的 segments
 *
 * 三种情况：
 * - 无 stay 配置：hold 在 entry 最终值（与之前行为一致）
 * - 固定值模式：动画到固定值
 * - timeline 模式：使用用户自定义 timeline，不足 stayDuration 时自动补 hold 段
 */
export const buildStaySegments = ({
  stayConfig,
  stayDuration,
  entryEndValue,
  defaultEase,
}: {
  stayConfig?: I_NormalizedChildItem['stay']['rotation']
  stayDuration: number
  /** entry 阶段的最终值 */
  entryEndValue: number
  defaultEase: string
}): { durationSeconds: number; to: number; keySplines?: string }[] => {
  if (stayDuration <= 0) return []

  // 无配置：hold 在 entry 最终值
  if (!stayConfig) {
    return [{ durationSeconds: stayDuration, to: entryEndValue, keySplines: defaultEase }]
  }

  // 固定值模式
  if (stayConfig.fixedValue !== undefined) {
    return [{ durationSeconds: stayDuration, to: stayConfig.fixedValue, keySplines: defaultEase }]
  }

  // timeline 模式
  if (stayConfig.timeline) {
    const timelineTotal = sum(stayConfig.timeline.map(segment => segment.durationSeconds))
    if (timelineTotal > stayDuration) {
      throw new Error(`Stay timeline total duration (${timelineTotal}s) must not exceed stay duration (${stayDuration}s).`)
    }

    const lastValue = stayConfig.timeline[stayConfig.timeline.length - 1].to
    const padding = stayDuration - timelineTotal

    return [
      ...stayConfig.timeline,
      ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
    ]
  }

  // fallback: hold 在 entry 最终值
  return [{ durationSeconds: stayDuration, to: entryEndValue, keySplines: defaultEase }]
}

/**
 * 构建 translate 单阶段（entry 或 exit）的 timeline segments
 *
 * - 简单模式（无 timeline）：生成单段 initValue→simpleTargetValue
 * - 高级模式（有 timeline）：使用用户自定义 timeline，不足 phaseDuration 时自动补 hold 段
 */
export const buildTranslatePhaseSegments = ({
  translateConfig,
  phaseDuration,
  simpleTargetValue,
  defaultEase,
}: {
  translateConfig: I_NormalizedTranslateConfig
  phaseDuration: number
  /** 简单模式下的目标值（entry={x:0,y:0}, exit=offscreen） */
  simpleTargetValue: { x: number; y: number }
  defaultEase: string
}): { durationSeconds: number; to: { x: number; y: number }; keySplines?: string }[] => {
  if (!translateConfig.timeline) {
    // 简单模式：单段动画到目标值
    return [{ durationSeconds: phaseDuration, to: simpleTargetValue, keySplines: translateConfig.keySplines ?? defaultEase }]
  }

  // 高级模式：使用用户 timeline
  const timelineTotal = sum(translateConfig.timeline.map(segment => segment.durationSeconds))
  if (timelineTotal > phaseDuration) {
    throw new Error(`Translate timeline total duration (${timelineTotal}s) must not exceed phase duration (${phaseDuration}s).`)
  }

  const lastValue = translateConfig.timeline[translateConfig.timeline.length - 1].to
  const padding = phaseDuration - timelineTotal

  return [
    ...translateConfig.timeline,
    ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
  ]
}

/**
 * 构建 stay 阶段 translate 的 segments
 *
 * - 无 stay 配置：hold 在 entry 最终值
 * - 固定值模式：动画到固定位置
 * - timeline 模式：使用用户自定义 timeline，不足 stayDuration 时自动补 hold 段
 */
export const buildStayTranslateSegments = ({
  stayConfig,
  stayDuration,
  entryEndValue,
  defaultEase,
}: {
  stayConfig?: I_NormalizedStayTranslateConfig
  stayDuration: number
  entryEndValue: { x: number; y: number }
  defaultEase: string
}): { durationSeconds: number; to: { x: number; y: number }; keySplines?: string }[] => {
  if (stayDuration <= 0) return []

  // 无配置：hold 在 entry 最终值
  if (!stayConfig) {
    return [{ durationSeconds: stayDuration, to: entryEndValue, keySplines: defaultEase }]
  }

  // 固定位置模式
  if (stayConfig.fixedValue !== undefined) {
    return [{ durationSeconds: stayDuration, to: stayConfig.fixedValue, keySplines: defaultEase }]
  }

  // timeline 模式
  if (stayConfig.timeline) {
    const timelineTotal = sum(stayConfig.timeline.map(segment => segment.durationSeconds))
    if (timelineTotal > stayDuration) {
      throw new Error(`Stay translate timeline total (${timelineTotal}s) must not exceed stay duration (${stayDuration}s).`)
    }

    const lastValue = stayConfig.timeline[stayConfig.timeline.length - 1].to
    const padding = stayDuration - timelineTotal

    return [
      ...stayConfig.timeline,
      ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
    ]
  }

  // fallback: hold 在 entry 最终值
  return [{ durationSeconds: stayDuration, to: entryEndValue, keySplines: defaultEase }]
}
