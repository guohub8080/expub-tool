import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import sum from "lodash/sum"
import { transformTranslate, transformSkewX, transformSkewY, transformRotate, transformScaleRaw, animateVisibility } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import type { I_GhostTimeline } from "@utils/svg/buildCyclicTimelines"
import { getRotationOrigin } from "../timeline/offsetCalculator"
import { renderChildItemContent } from "./ChildItemContent"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const DEFAULT_EASE = "0.42 0 0.58 1"

/**
 * GhostLayer — 图1的视觉副本，渲染在 DOM 最后（SVG z 轴最顶层）。
 *
 * 问题背景：SVG 使用 painter's algorithm，DOM 靠后的元素覆盖靠前的元素。
 * 图1在 DOM 第一位（最底层），图N在最后（最顶层）。
 * 当图N退出、图1进入时，图N在上层会遮住图1，导致图1的进入动画不可见。
 *
 * 解决方案：在 DOM 末尾放一个与图1完全相同的副本（Ghost），
 * 只在图1进入的那段时间内可见（visibility: hidden → visible → hidden），
 * 其余时间隐藏。这样视觉上图1始终能覆盖图N，实现"新图永远盖住旧图"的效果。
 *
 * 时序：
 * - visibility/translate：begin=0s
 *   - [0, totalDuration-entryDuration)：停在屏幕外，visibility=hidden
 *   - [totalDuration-entryDuration, totalDuration)：执行进入动画，visibility=visible
 *   - totalDuration 时刻：瞬间 hidden，图1已到位，Ghost 完成使命
 * - rotate/scale/skew：begin=totalDuration-entryDuration
 *   - entry 段从 keyTime 0 开始，与 CycleItem 的 keyTimes 结构完全一致
 *   - entry 完成后 hold 在最终值直到周期结束
 */
const GhostLayer = (props: {
  /** 图1的标准化配置 */
  firstItem: I_NormalizedChildItem
  /** 图1的屏幕外进入坐标（由 getOffscreenTranslate 计算） */
  enterOffscreenTranslate: { x: number; y: number }
  /** Ghost 层时间轴（由 buildCyclicTimelines 计算） */
  ghostTimeline: I_GhostTimeline
  /** 总动画周期（秒） */
  totalDuration: number
  /** 内容区域宽度（已扣除 itemGap） */
  contentWidth: number
  /** 内容区域高度（已扣除 itemGap） */
  contentHeight: number
}) => {
  const { firstItem, enterOffscreenTranslate, ghostTimeline, totalDuration, contentWidth, contentHeight } = props
  const ghostEntryDuration = ghostTimeline.entryDuration
  const ghostHoldDuration = totalDuration - ghostEntryDuration

  // Ghost skew：仅在 entry.skew 存在时渲染
  // 先执行 entry 阶段（angle→0），再 hold 在 0（Ghost 不可见）
  const ghostSkewAnim = firstItem.entry.skew && (() => {
    const skewEase = defaultTo(firstItem.entry.skew!.keySplines, DEFAULT_EASE)
    const isSkewY = firstItem.entry.skew!.type === 'Y'
    const skewFn = isSkewY ? transformSkewY : transformSkewX

    return skewFn({
      initValue: firstItem.entry.skew!.angle,
      timeline: [
        { durationSeconds: ghostEntryDuration, to: 0,                           keySplines: skewEase },
        { durationSeconds: ghostHoldDuration,  to: 0,                           keySplines: skewEase },
      ],
      begin: `${ghostHoldDuration}s`,
      loopCount: 0,
      isFreeze: true,
      isAdditive: false,
    })
  })()

  // Ghost rotate：与 CycleItem 一致，支持简单模式和高级 timeline 模式
  //
  // 关键：begin = ghostHoldDuration（而非 "0s"）
  // 这样 entry 段从 keyTime 0 开始，与 CycleItem 的 keyTimes 结构完全一致，
  // 避免因 hold 段在前导致 entry 段落在 keyTimes 中间位置而产生微小 easing 差异。
  const ghostRotateAnim = !isNil(firstItem.entry.rotation) && (() => {
    const entryRotation = firstItem.entry.rotation!
    const rotationOrigin = getRotationOrigin({
      origin: entryRotation.childCanvasOrigin,
      contentWidth,
      contentHeight,
    })
    const ease = defaultTo(entryRotation.keySplines, DEFAULT_EASE)

    // 构建 Ghost rotation timeline
    // - entry 阶段：从 initValue 播放用户 timeline（或简单模式单段到 0）
    // - hold 阶段：保持 entry 最后值（Ghost 不可见，无视觉影响）
    const entrySegs = buildGhostRotationEntrySegs({
      rotationConfig: entryRotation,
      entryDuration: ghostEntryDuration,
      defaultEase: ease,
    })

    const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].to : 0
    const timeline = [
      ...entrySegs,
      { durationSeconds: ghostHoldDuration, to: lastEntryValue, keySplines: ease },
    ]

    return transformRotate({
      initValue: entryRotation.initValue,
      timeline,
      origin: rotationOrigin,
      begin: `${ghostHoldDuration}s`,
      loopCount: 0,
      isFreeze: true,
      isAdditive: false,
    })
  })()

  // Ghost scale：与 CycleItem 一致，支持简单模式和高级 timeline 模式
  // 同 rotation，begin = ghostHoldDuration，entry 段从 keyTime 0 开始
  const ghostScaleAnimConfig = !isNil(firstItem.entry.scale) && (() => {
    const entryScale = firstItem.entry.scale!
    const scaleOrigin = getRotationOrigin({
      origin: entryScale.childCanvasOrigin,
      contentWidth,
      contentHeight,
    })
    const ease = defaultTo(entryScale.keySplines, DEFAULT_EASE)

    // 构建 Ghost scale timeline
    // - entry 阶段：从 initValue 播放用户 timeline（或简单模式单段到 1）
    // - hold 阶段：保持 entry 最后值（Ghost 不可见，无视觉影响）
    const entrySegs = buildGhostScaleEntrySegs({
      scaleConfig: entryScale,
      entryDuration: ghostEntryDuration,
      defaultEase: ease,
    })

    const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].to : 1
    const timeline = [
      ...entrySegs,
      { durationSeconds: ghostHoldDuration, to: lastEntryValue, keySplines: ease },
    ]

    return {
      originX: scaleOrigin[0],
      originY: scaleOrigin[1],
      scaleAnim: transformScaleRaw({
        initValue: entryScale.initValue,
        timeline,
        begin: `${ghostHoldDuration}s`,
        loopCount: 0,
        isFreeze: true,
        isAdditive: false,
      }),
    }
  })()

  // 从最内层往外逐层包裹，只有存在对应动画时才加 <g>
  let ghostContent: React.ReactNode = renderChildItemContent({ item: firstItem, contentWidth, contentHeight })

  if (ghostRotateAnim) {
    ghostContent = <g>{ghostRotateAnim}{ghostContent}</g>
  }

  if (ghostScaleAnimConfig) {
    // 嵌套 <g> 隔离 translate→scale→translate-back，与 CycleItem 一致
    ghostContent = (
      <g transform={`translate(${ghostScaleAnimConfig.originX}, ${ghostScaleAnimConfig.originY})`}>
        <g>
          {ghostScaleAnimConfig.scaleAnim}
          <g transform={`translate(${-ghostScaleAnimConfig.originX}, ${-ghostScaleAnimConfig.originY})`}>
            {ghostContent}
          </g>
        </g>
      </g>
    )
  }

  if (ghostSkewAnim) {
    ghostContent = <g>{ghostSkewAnim}{ghostContent}</g>
  }

  return (
    <g key="ghost" visibility="hidden">
      {/* visibility 切换：在图1进入段瞬间变 visible，进入完成后瞬间 hidden */}
      {animateVisibility({
        initValue: "hidden",
        timeline: [
          { durationSeconds: ghostHoldDuration, to: "visible" },
          { durationSeconds: ghostEntryDuration, to: "hidden" },
        ],
        begin: "0s",
        loopCount: 0,
        isFreeze: true,
      })}
      {transformTranslate({
        initValue: enterOffscreenTranslate,
        timeline: [
          { durationSeconds: ghostHoldDuration, to: enterOffscreenTranslate, keySplines: DEFAULT_EASE },
          { durationSeconds: ghostEntryDuration, to: { x: 0, y: 0 },          keySplines: DEFAULT_EASE },
        ],
        begin: "0s",
        loopCount: 0,
        isFreeze: true,
        isAdditive: false,
        isRelativeMove: false,
      })}
      {ghostContent}
    </g>
  )
}

/**
 * 构建 Ghost rotation entry 阶段的 segments
 *
 * - 简单模式：单段 initValue → 0
 * - 高级模式：播放用户 timeline，不足 entryDuration 时自动补 hold 在最后值
 */
const buildGhostRotationEntrySegs = ({
  rotationConfig,
  entryDuration,
  defaultEase,
}: {
  rotationConfig: I_NormalizedChildItem['entry']['rotation']
  entryDuration: number
  defaultEase: string
}): { durationSeconds: number; to: number; keySplines?: string }[] => {
  if (!rotationConfig?.timeline) {
    // 简单模式：单段到 0
    return [{ durationSeconds: entryDuration, to: 0, keySplines: defaultEase }]
  }

  // 高级模式：使用用户 timeline
  const timelineTotal = sum(rotationConfig.timeline.map(segment => segment.durationSeconds))
  if (timelineTotal > entryDuration) {
    throw new Error(`Ghost rotation timeline total duration (${timelineTotal}s) must not exceed entry duration (${entryDuration}s).`)
  }

  const lastValue = rotationConfig.timeline[rotationConfig.timeline.length - 1].to
  const padding = entryDuration - timelineTotal

  return [
    ...rotationConfig.timeline,
    ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
  ]
}

/**
 * 构建 Ghost scale entry 阶段的 segments
 *
 * - 简单模式：单段 initValue → 1
 * - 高级模式：播放用户 timeline，不足 entryDuration 时自动补 hold 在最后值
 */
const buildGhostScaleEntrySegs = ({
  scaleConfig,
  entryDuration,
  defaultEase,
}: {
  scaleConfig: I_NormalizedChildItem['entry']['scale']
  entryDuration: number
  defaultEase: string
}): { durationSeconds: number; to: number; keySplines?: string }[] => {
  if (!scaleConfig?.timeline) {
    // 简单模式：单段到 1
    return [{ durationSeconds: entryDuration, to: 1, keySplines: defaultEase }]
  }

  // 高级模式：使用用户 timeline
  const timelineTotal = sum(scaleConfig.timeline.map(segment => segment.durationSeconds))
  if (timelineTotal > entryDuration) {
    throw new Error(`Ghost scale timeline total duration (${timelineTotal}s) must not exceed entry duration (${entryDuration}s).`)
  }

  const lastValue = scaleConfig.timeline[scaleConfig.timeline.length - 1].to
  const padding = entryDuration - timelineTotal

  return [
    ...scaleConfig.timeline,
    ...(padding > 0 ? [{ durationSeconds: padding, to: lastValue, keySplines: defaultEase }] : []),
  ]
}

export default GhostLayer
