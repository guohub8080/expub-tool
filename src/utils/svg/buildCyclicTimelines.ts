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
 * ── begin 偏移 ──
 *
 * SMIL 的 begin 属性控制动画从何时开始播放。配合 repeatCount="indefinite"（无限循环），
 * 动画会以 dur=T 为周期不断重复。
 *
 * 通过 `isNegativeBegin` 选项控制两种偏移策略：
 *
 * 1. isNegativeBegin = true（默认）— 所有 begin 都为负数
 *    使用负的 begin 值，使得动画在页面加载（t=0）之前就已经开始播放。
 *    t=0 时每一项都处于正确的视觉位置：
 *      - 图1：刚好完成 entry，处于 stay 起始（完整可见）
 *      - 其他图：处于 hold 状态（在屏幕外等待）
 *    适用于 visibility="hidden" 初始隐藏策略（如 AnyLoopDisplay），
 *    因为 t=0 时所有动画必须已在运行，否则 hidden→visible 时元素会闪在原点。
 *
 * 2. isNegativeBegin = false — 非首项 begin 为正数（自然开始时刻）
 *    非首项的 begin = beginPrefix[i]（不减 totalDuration），
 *    t=0 时这些图的动画尚未启动，元素停在原生属性位置。
 *    适用于元素初始位置已在屏幕外的场景（如 AnyPush 的 foreignObject x/y 设在屏幕外），
 *    正 delay 时元素自然不可见，不需要 visibility 隐藏。
 *
 *    注意：两种模式视觉等价（差值 = totalDuration，取模后相同），
 *    区别仅在于 t=0 时元素"停在屏幕外"的机制不同。
 *
 * begin 的计算规则：
 *   - 图1: begin = -entryDuration（= -switchDuration）
 *     → t=0 时图1走了 |begin| = switchDuration 的时间，entry 刚好播完
 *   - 图 i (i > 0), isNegativeBegin=true:  begin = beginPrefix[i] - totalDuration
 *   - 图 i (i > 0), isNegativeBegin=false: begin = beginPrefix[i]
 *
 * beginPrefix 的累加（跳过图1 的 switchDuration，因为图1 的 entry 在周期末尾）：
 *   beginPrefix[0] = 0
 *   beginPrefix[1] = items[0].stayDuration
 *   beginPrefix[i] = beginPrefix[i-1] + items[i-1].switchDuration + items[i-1].stayDuration
 *
 * ── Ghost 层 ──
 *
 * 当 N > 1 时，输出包含 ghostTimeline，用于渲染图1 的视觉副本（Ghost）。
 * Ghost 渲染在 DOM 最后（SVG z 轴最顶层），解决 painter's algorithm 下
 * 图N 遮住图1 进入动画的问题。
 *
 * Ghost 的时间轴只有两个阶段：
 *   - hold: T - items[0].switchDuration（停在屏幕外，不可见）
 *   - entry: items[0].switchDuration（执行进入动画，可见）
 *
 * Ghost 的 begin 始终为 0，不受 isNegativeBegin 影响：
 *   Ghost 的可见段（entry）在周期末尾 [T-sw, T)，与图1 的进入时间自然对齐。
 *   无论 isNegativeBegin 取何值，图1 的 begin 都是 -switchDuration，
 *   图1 的 entry 在取模后始终落在 [T-sw, T)，与 Ghost 的可见段完全重合。
 *
 * ── 用途 ──
 *
 * 此函数的输出可以直接喂给 buildTimeline：
 *   1. 构建 segments 数组 = [entry段, stay段(可选), exit段, hold段]
 *   2. 用 buildTimeline 编译出 values / keyTimes / keySplines
 *   3. 设置 SMIL 属性：dur = `${totalDuration}s`, begin = `${timeline.begin}s`
 */

import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"

/** 每一项的切换配置 */
export type T_SwitchPhase = {
  /** 切换时长（秒），即 entry 段时长。必须 > 0 */
  switchDuration: number
  /** 停留时长（秒），即 stay 段时长。>= 0，= 0 时跳过 stay 段 */
  stayDuration: number
}

/** 构建选项 */
export interface I_CyclicTimelineOptions {
  /**
   * 是否对非首项的 begin 应用 -totalDuration 偏移。
   *
   * - true（默认）：所有 begin 都为负数，t=0 时所有动画已在运行。
   *   适用于 visibility="hidden" 初始隐藏策略（AnyLoopDisplay 风格）。
   * - false：非首项 begin 为正数（自然开始时刻）。
   *   适用于元素初始位置已在屏幕外的场景（AnyPush 风格）。
   *
   * 两种模式视觉等价（差值 = totalDuration，SMIL 取模后相同），
   * 区别仅在于 t=0 时元素"停在屏幕外"的机制。
   */
  isNegativeBegin?: boolean
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

/** Ghost 层时间轴结果 */
export interface I_GhostTimeline {
  /**
   * SMIL begin 偏移（秒），始终为 0。
   *
   * Ghost 的可见段（entry）在周期末尾 [T-sw, T)，
   * 与图1 的进入时间自然对齐，不受 isNegativeBegin 影响。
   */
  begin: number
  /** hold 段时长（秒）= totalDuration - items[0].switchDuration（在屏幕外等待） */
  holdDuration: number
  /** entry 段时长（秒）= items[0].switchDuration（执行进入动画，可见） */
  entryDuration: number
}

/** 循环时间轴构建结果 */
export interface I_CyclicTimelines {
  /** 总周期时长（秒），所有项共享，= Σ(switchDuration + stayDuration) */
  totalDuration: number
  /** 每一项的时间轴信息，与输入数组一一对应 */
  itemTimelines: I_ItemTimeline[]
  /**
   * Ghost 层时间轴（仅在 N > 1 时存在）。
   *
   * Ghost 是图1 的视觉副本，渲染在 DOM 最后（SVG z 轴最顶层），
   * 只在图1 进入的那段时间内可见，解决 painter's algorithm 下图N 遮住图1 的问题。
   */
  ghostTimeline?: I_GhostTimeline
}

/**
 * 构建循环推送时间轴
 *
 * @param items — 每一项的 { switchDuration, stayDuration }，至少 1 项
 * @param options — 构建选项，详见 I_CyclicTimelineOptions
 * @returns 总周期 + 每项的四段时间分配及 begin 偏移
 * @throws items 为空、switchDuration <= 0、stayDuration < 0 时抛错
 *
 * @example
 * // isNegativeBegin = true（默认，AnyLoopDisplay 风格）
 * const result = buildCyclicTimelines([
 *   { switchDuration: 2, stayDuration: 1 },
 *   { switchDuration: 2, stayDuration: 0 },
 *   { switchDuration: 3, stayDuration: 1 },
 * ])
 * // result.totalDuration === 9
 * // result.itemTimelines[0] === { begin: -2, entryDuration: 2, stayDuration: 1, exitDuration: 2, holdDuration: 4 }
 * // result.itemTimelines[1] === { begin: -8, entryDuration: 2, stayDuration: 0, exitDuration: 3, holdDuration: 4 }
 * // result.itemTimelines[2] === { begin: -6, entryDuration: 3, stayDuration: 1, exitDuration: 2, holdDuration: 3 }
 * // result.ghostTimeline === { begin: 0, holdDuration: 7, entryDuration: 2 }
 *
 * @example
 * // isNegativeBegin = false（AnyPush 风格，非首项 begin 为正数）
 * const result = buildCyclicTimelines([
 *   { switchDuration: 2, stayDuration: 1 },
 *   { switchDuration: 2, stayDuration: 0 },
 *   { switchDuration: 3, stayDuration: 1 },
 * ], { isNegativeBegin: false })
 * // result.totalDuration === 9
 * // result.itemTimelines[0] === { begin: -2, entryDuration: 2, stayDuration: 1, exitDuration: 2, holdDuration: 4 }
 * // result.itemTimelines[1] === { begin: 1,  entryDuration: 2, stayDuration: 0, exitDuration: 3, holdDuration: 4 }
 * // result.itemTimelines[2] === { begin: 3,  entryDuration: 3, stayDuration: 1, exitDuration: 2, holdDuration: 3 }
 * // result.ghostTimeline === { begin: 0, holdDuration: 7, entryDuration: 2 }
 */
export const buildCyclicTimelines = (items: T_SwitchPhase[], options?: I_CyclicTimelineOptions): I_CyclicTimelines => {
  if (isNil(items) || items.length === 0) {
    throw new Error('`items` must not be empty.')
  }

  const isNegativeBegin = defaultTo(options?.isNegativeBegin, true)
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
   *   isNegativeBegin=true:  其他图的 begin = beginPrefix[i] - totalDuration
   *   isNegativeBegin=false: 其他图的 begin = beginPrefix[i]
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
    // 其他图：根据 isNegativeBegin 决定是否减去 totalDuration
    const begin = i === 0
      ? -entryDuration
      : isNegativeBegin
        ? beginPrefix[i] - totalDuration
        : beginPrefix[i]

    return {
      begin,
      entryDuration,
      stayDuration,
      exitDuration,
      holdDuration,
    }
  })

  // Ghost 层时间轴：图1 的视觉副本，只在周期末尾（图1 进入时）可见
  // begin 始终为 0，不受 isNegativeBegin 影响（详见模块文档 "Ghost 层" 章节）
  const ghostTimeline = N > 1 ? {
    begin: 0 as number,
    holdDuration: totalDuration - items[0].switchDuration,
    entryDuration: items[0].switchDuration,
  } : undefined

  return { totalDuration, itemTimelines, ghostTimeline }
}
