/**
 * 角度驱动的 entry/exit 偏移计算
 *
 * angle 决定 item 的移动方向：
 * - 0°   → 从左进入，往右退出
 * - 90°  → 从上进入，往下退出
 * - 45°  → 从左上进入，往右下退出
 * - 180° → 从右进入，往左退出
 */

/**
 * 计算 entry 偏移（屏外起始位置）
 *
 * entry 偏移是相对于中心的偏移量，表示 item 从屏外哪个位置开始。
 * entry = -(itemW+gap) × cos(angle), -(itemH+gap) × sin(angle)
 *
 * 角度=0 时：entry = (-step, 0) → 从左侧屏外进入
 * 角度=90 时：entry = (0, -step) → 从上方屏外进入
 */
export const calcEntryOffset = (
  angle: number,
  itemW: number,
  itemH: number,
  gap: number,
  distanceMultiplier: number,
): { x: number; y: number } => {
  const rad = angle * Math.PI / 180
  return {
    x: -((itemW + gap) * Math.cos(rad)) * distanceMultiplier,
    y: -((itemH + gap) * Math.sin(rad)) * distanceMultiplier,
  }
}

/**
 * 计算 exit 偏移（屏外退出位置）
 *
 * exit 偏移是 item 退出时到达的屏外位置。
 * exit = +(itemW+gap) × cos(angle), +(itemH+gap) × sin(angle)
 *
 * 角度=0 时：exit = (+step, 0) → 往右侧屏外退出
 * 角度=90 时：exit = (0, +step) → 往下方屏外退出
 */
export const calcExitOffset = (
  angle: number,
  itemW: number,
  itemH: number,
  gap: number,
  distanceMultiplier: number,
): { x: number; y: number } => {
  const rad = angle * Math.PI / 180
  return {
    x: (itemW + gap) * Math.cos(rad) * distanceMultiplier,
    y: (itemH + gap) * Math.sin(rad) * distanceMultiplier,
  }
}

/** 将 I_NormalizedCarouselItem[] 转为 buildCyclicTimelines 所需的 T_SwitchPhase[] */
export const toSwitchPhases = (items: { switchDuration: number; stayDuration: number }[]) => {
  return items.map(item => ({
    switchDuration: item.switchDuration,
    stayDuration: item.stayDuration,
  }))
}
