/** ease-in-out cubic-bezier，用于所有进入/退出动画 */
export const DEFAULT_EASE = "0.42 0 0.58 1"

export type ScalarSegment = { durationSeconds: number; to: number; keySplines?: string }

/**
 * 将 entry/stay/exit/hold 四个阶段的 segments 合并为完整时间线
 *
 * 自动计算 hold 段：保持 exit 最终值。
 * 当 exitSegs 为空时，使用 fallbackExitValue 作为 hold 值。
 */
export const combinePhaseSegments = (
  entrySegs: ScalarSegment[],
  staySegs: ScalarSegment[],
  exitSegs: ScalarSegment[],
  fallbackExitValue: number,
  holdDuration: number,
  defaultEase: string,
): ScalarSegment[] => {
  const lastExitValue = exitSegs.length > 0 ? exitSegs[exitSegs.length - 1].to : fallbackExitValue
  return [...entrySegs, ...staySegs, ...exitSegs, { durationSeconds: holdDuration, to: lastExitValue, keySplines: defaultEase }]
}
