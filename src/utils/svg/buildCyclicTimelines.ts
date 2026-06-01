/**
 * 循环推送时间轴构建器
 *
 * 给定一组 { switchDuration, stayDuration }，计算出每一项在循环周期内的
 * entry / stay / exit / hold 四段时间分配及 SMIL begin 偏移。
 *
 * 纯函数，不依赖 React / SVG，可用于任何循环推送场景。
 *
 * ── 时间轴模型 ──
 *
 * N 张图在同一个周期 T 内轮流展示，每张图经历四个阶段：
 *
 *   entry  →  stay  →  exit  →  hold
 *   (进入)    (停留)   (退出)   (等待其他图走完)
 *
 * 各阶段时长的推导规则：
 *   - entryDuration = 本项的 switchDuration（进入动画时长）
 *   - stayDuration  = 本项的 stayDuration（停留时长，可以为 0）
 *   - exitDuration  = 下一项的 switchDuration（下一张推入 = 当前图退出）
 *   - holdDuration  = T - entry - stay - exit（等待其余图走完一轮）
 *
 * 总周期 T = Σ(switchDuration + stayDuration)
 *
 * 示例（3 张图）：
 *   输入: [{ sw:2, stay:1 }, { sw:2, stay:0 }, { sw:3, stay:1 }]
 *   T = (2+1) + (2+0) + (3+1) = 9
 *
 *   图1: entry(2s) → stay(1s) → exit(图2的sw=2s) → hold(9-2-1-2=4s)
 *   图2: entry(2s) → stay(0s) → exit(图3的sw=3s) → hold(9-2-0-3=4s)
 *   图3: entry(3s) → stay(1s) → exit(图1的sw=2s) → hold(9-3-1-2=3s)
 *
 * ── 时间轴在周期内的排列 ──
 *
 * 关键：图1 的 entry 和图N 的 exit 是重叠的。
 * "图N 退出"和"图1 进入"同时发生——图N 从中心推出去的同时图1 从屏幕外推进来。
 * 所以图1 的 entry 不占用额外的独立时间段，它发生在周期的最末尾。
 *
 * 周期内的时间线（以上面的 3 张图为例，T=9s）：
 *
 *   0s       3s       5s       8s      9s
 *   |        |        |        |       |
 *   | 图1stay| 图2entry+图1exit | 图3entry+图2exit | 图1entry+图3exit |
 *   | (1s)   | 图2stay(0s)| (3s)    | (2s)           |
 *   |        | 图2entry |          |                |
 *            | (2s)     |          |                |
 *
 *   更准确地，从每张图的视角看（begin 为负偏移后的虚拟时间轴）：
 *
 *   图1: begin=-2 → [-2,0) entry → [0,1) stay → [1,3) exit → [3,7) hold → 循环
 *   图2: begin=-8 → [-8,-6) entry → [-6,-6) stay(跳过) → [-6,-3) exit → [-3,1) hold → 循环
 *   图3: begin=-6 → [-6,-3) entry → [-3,-2) stay → [-2,0) exit → [0,3) hold → 循环
 *
 * ── begin 负偏移技巧 ──
 *
 * SMIL 的 begin 属性控制动画从何时开始播放。配合 repeatCount="indefinite"（无限循环），
 * 动画会以 dur=T 为周期不断重复。
 *
 * 我们使用负的 begin 值，使得动画在页面加载（t=0）之前就已经开始播放。
 * 这样 t=0 时每一项都处于正确的视觉位置：
 *   - 图1：刚好完成 entry，处于 stay 起始（完整可见）
 *   - 其他图：处于 hold 状态（在屏幕外等待）
 *
 * begin 的计算规则：
 *   - 图1: begin = -entryDuration（= -switchDuration）
 *     → t=0 时图1走了 |begin| = switchDuration 的时间，entry 刚好播完
 *   - 图 i (i > 0): begin = beginPrefix[i] - totalDuration
 *     → beginPrefix[i] 是图 i 在周期内的"自然开始时刻"
 *     → 减去 totalDuration 映射到负时间轴
 *
 * beginPrefix 的累加（跳过图1 的 switchDuration，因为图1 的 entry 在周期末尾）：
 *   beginPrefix[0] = 0
 *   beginPrefix[1] = items[0].stayDuration
 *   beginPrefix[i] = beginPrefix[i-1] + items[i-1].switchDuration + items[i-1].stayDuration
 *
 * ── 用途 ──
 *
 * 此函数的输出可以直接喂给 compileTimeline：
 *   1. 构建 segments 数组 = [entry段, stay段(可选), exit段, hold段]
 *   2. 用 compileTimeline 编译出 values / keyTimes / keySplines
 *   3. 设置 SMIL 属性：dur = `${totalDuration}s`, begin = `${timeline.begin}s`
 */

/** 每一项的切换配置 */
export type T_SwitchPhase = {
  /** 切换时长（秒），即 entry 段时长。必须 > 0 */
  switchDuration: number
  /** 停留时长（秒），即 stay 段时长。>= 0，= 0 时跳过 stay 段 */
  stayDuration: number
}

/** 单项时间轴结果 */
export interface I_ItemTimeline {
  /**
   * SMIL begin 偏移（秒）。
   *
   * 通常为负数，表示动画在页面加载前就已开始播放。
   * t=0 时：
   *   - 图1 刚好完成 entry，处于 stay 起始（完整可见）
   *   - 其他图处于 hold（屏幕外等待）
   */
  begin: number
  /** entry 段时长（秒）= 本项的 switchDuration */
  entryDuration: number
  /** stay 段时长（秒）= 本项的 stayDuration。可能 = 0，此时应跳过 stay 段 */
  stayDuration: number
  /** exit 段时长（秒）= 下一项的 switchDuration */
  exitDuration: number
  /**
   * hold 段时长（秒）= totalDuration - entry - stay - exit。
   *
   * hold 是当前图退出后在屏幕外等待其他图走完一轮的时间。
   * 此段时间内 transform 值保持在 exit 终态（屏幕外坐标）。
   */
  holdDuration: number
}

/** 循环时间轴构建结果 */
export interface I_CyclicTimelines {
  /** 总周期时长（秒），所有项共享，= Σ(switchDuration + stayDuration) */
  totalDuration: number
  /** 每一项的时间轴信息，与输入数组一一对应 */
  itemTimelines: I_ItemTimeline[]
}

/**
 * 构建循环推送时间轴
 *
 * @param items — 每一项的 { switchDuration, stayDuration }，至少 1 项
 * @returns 总周期 + 每项的四段时间分配及 begin 偏移
 * @throws items 为空、switchDuration <= 0、stayDuration < 0 时抛错
 *
 * @example
 * const result = buildCyclicTimelines([
 *   { switchDuration: 2, stayDuration: 1 },
 *   { switchDuration: 2, stayDuration: 0 },
 *   { switchDuration: 3, stayDuration: 1 },
 * ])
 * // result.totalDuration === 9
 * // result.itemTimelines[0] === { begin: -2, entryDuration: 2, stayDuration: 1, exitDuration: 2, holdDuration: 4 }
 * // result.itemTimelines[1] === { begin: -8, entryDuration: 2, stayDuration: 0, exitDuration: 3, holdDuration: 4 }
 * // result.itemTimelines[2] === { begin: -6, entryDuration: 3, stayDuration: 1, exitDuration: 2, holdDuration: 3 }
 */
export const buildCyclicTimelines = (items: T_SwitchPhase[]): I_CyclicTimelines => {
  if (!items.length) {
    throw new Error('`items` must not be empty.')
  }

  const N = items.length

  // 校验每一项的参数合法性
  items.forEach((item, i) => {
    if (item.switchDuration <= 0) {
      throw new Error(`\`switchDuration\` at index ${i} must be greater than 0, got ${item.switchDuration}.`)
    }
    if (item.stayDuration < 0) {
      throw new Error(`\`stayDuration\` at index ${i} must be >= 0, got ${item.stayDuration}.`)
    }
  })

  // 总周期 = 所有项的 (switchDuration + stayDuration) 之和
  const totalDuration = items.reduce(
    (sum, item) => sum + item.switchDuration + item.stayDuration,
    0,
  )

  /**
   * begin 前缀和：图 i 在周期内的"自然开始时刻"。
   *
   * 图1 的 entry 发生在周期末尾（和图N 的 exit 重叠），
   * 所以累加从图1 的 stayDuration 开始，跳过图1 的 switchDuration：
   *   beginPrefix[0] = 0
   *   beginPrefix[1] = items[0].stayDuration
   *   beginPrefix[i] = beginPrefix[i-1] + items[i-1].switchDuration + items[i-1].stayDuration  (i >= 2)
   *
   * 然后：
   *   图1 的 begin = -entryDuration（特殊处理，让 t=0 时图1 刚好完成 entry）
   *   其他图的 begin = beginPrefix[i] - totalDuration
   */
  const beginPrefix: number[] = [0]
  if (N > 1) {
    // 图2 的前缀 = 图1 的 stayDuration
    beginPrefix.push(items[0].stayDuration)
    // 图3 及之后 = 前一项的前缀 + 前一项的 switch + stay
    for (let i = 2; i < N; i++) {
      beginPrefix.push(
        beginPrefix[i - 1] + items[i - 1].switchDuration + items[i - 1].stayDuration,
      )
    }
  }

  // 计算每一项的四段时间分配
  const itemTimelines: I_ItemTimeline[] = items.map((item, i) => {
    // entry = 自己的 switchDuration
    const entryDuration = item.switchDuration
    // stay = 自己的 stayDuration（可以为 0）
    const stayDuration = item.stayDuration
    // exit = 下一项的 switchDuration（下一张推入时当前图退出）
    const exitDuration = items[(i + 1) % N].switchDuration
    // hold = 剩余时间（在屏幕外等待其他图走完）
    const holdDuration = totalDuration - entryDuration - stayDuration - exitDuration

    // 图1 特殊处理：begin = -entryDuration，t=0 时刚好完成 entry
    // 其他图：begin = beginPrefix[i] - totalDuration，映射到负时间轴
    const begin = i === 0
      ? -entryDuration
      : beginPrefix[i] - totalDuration

    return {
      begin,
      entryDuration,
      stayDuration,
      exitDuration,
      holdDuration,
    }
  })

  return { totalDuration, itemTimelines }
}
