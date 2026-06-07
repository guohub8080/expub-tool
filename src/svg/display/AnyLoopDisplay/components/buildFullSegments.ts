/** ease-in-out cubic-bezier，用于所有进入/退出动画 */
export const DEFAULT_EASE = "0.42 0 0.58 1"

export type Segment<T> = { durationSeconds: number; to: T; keySplines?: string }
/** 标量 segment（rotation/scale/opacity/skew 使用） */
export type ScalarSegment = Segment<number>

/**
 * 将 entry/stay/exit/hold 四个阶段的 segments 合并为完整时间线
 *
 * - holdSegs 存在时：使用自定义 hold 段（由调用方构建）
 * - holdSegs 不存在时：自动生成 hold 段，保持 exit 最终值
 * - 当 exitSegs 为空时，使用 fallbackExitValue 作为 hold 值
 */
export const combinePhaseSegments = <T>(
  entrySegs: Segment<T>[],
  staySegs: Segment<T>[],
  exitSegs: Segment<T>[],
  fallbackExitValue: T,
  holdDuration: number,
  defaultEase: string,
  holdSegs?: Segment<T>[],
): Segment<T>[] => {
  if (holdSegs && holdSegs.length > 0) {
    return [...entrySegs, ...staySegs, ...exitSegs, ...holdSegs]
  }
  const lastExitValue = exitSegs.length > 0 ? exitSegs[exitSegs.length - 1].to : fallbackExitValue
  return [...entrySegs, ...staySegs, ...exitSegs, { durationSeconds: holdDuration, to: lastExitValue, keySplines: defaultEase }]
}
