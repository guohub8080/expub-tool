import isNil from "lodash/isNil"
import { isDefined } from '@utils/fn/isDefined'
import defaultTo from "lodash/defaultTo"
import { transformTranslate, transformSkewX, transformSkewY, transformRotate, transformScaleRaw, animateOpacity, animateVisibility } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import type { I_GhostTimeline } from "@utils/svg/buildCyclicTimelines"
import { getRotationOrigin } from "../timeline/offsetCalculator"
import { buildTranslatePhaseSegments, buildRotationPhaseSegments, buildScalePhaseSegments, buildOpacityPhaseSegments, buildSkewPhaseSegments } from "../utils/phaseSegmentBuilders"
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
 * - rotate/scale/skew/opacity：begin=totalDuration-entryDuration
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

  // ── Ghost translate entry segments ──
  // 使用与 CycleItem 相同的 buildTranslatePhaseSegments，确保 Ghost 的进入路径完全一致
  // 包括高级 timeline 模式（过冲回弹、弧线进入等）
  const entryTranslate = firstItem.entry.translate
  const translateEase = defaultTo(entryTranslate.keySplines, DEFAULT_EASE)

  const ghostEntryTranslateSegs = buildTranslatePhaseSegments({
    translateConfig: entryTranslate,
    phaseDuration: ghostEntryDuration,
    simpleTargetValue: { x: 0, y: 0 },
    defaultEase: translateEase,
  })

  // Ghost skewX：与 CycleItem 一致，支持简单模式和高级 timeline 模式
  // begin = ghostHoldDuration，entry 段从 keyTime 0 开始
  const buildGhostSkewXAnim = () => {
    if (isNil(firstItem.entry.skewX)) return null
    const entrySkew = firstItem.entry.skewX
    const ease = defaultTo(entrySkew.keySplines, DEFAULT_EASE)

    const entrySegs = buildSkewPhaseSegments({
      skewConfig: entrySkew,
      phaseDuration: ghostEntryDuration,
      simpleTargetValue: 0,
      defaultEase: ease,
    })

    const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 0

    return transformSkewX({
      initValue: entrySkew.initValue,
      timeline: [
        ...entrySegs,
        { durationSeconds: ghostHoldDuration, toAbs: lastEntryValue, keySplines: ease },
      ],
      begin: `${ghostHoldDuration}s`,
      loopCount: 0,
      isFreeze: true,
      isAdditive: false,
    })
  }

  // Ghost skewY：与 skewX 结构相同，使用 transformSkewY
  const buildGhostSkewYAnim = () => {
    if (isNil(firstItem.entry.skewY)) return null
    const entrySkew = firstItem.entry.skewY
    const ease = defaultTo(entrySkew.keySplines, DEFAULT_EASE)

    const entrySegs = buildSkewPhaseSegments({
      skewConfig: entrySkew,
      phaseDuration: ghostEntryDuration,
      simpleTargetValue: 0,
      defaultEase: ease,
    })

    const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 0

    return transformSkewY({
      initValue: entrySkew.initValue,
      timeline: [
        ...entrySegs,
        { durationSeconds: ghostHoldDuration, toAbs: lastEntryValue, keySplines: ease },
      ],
      begin: `${ghostHoldDuration}s`,
      loopCount: 0,
      isFreeze: true,
      isAdditive: false,
    })
  }

  // Ghost rotate：与 CycleItem 一致，支持简单模式和高级 timeline 模式
  //
  // 关键：begin = ghostHoldDuration（而非 "0s"）
  // 这样 entry 段从 keyTime 0 开始，与 CycleItem 的 keyTimes 结构完全一致，
  // 避免因 hold 段在前导致 entry 段落在 keyTimes 中间位置而产生微小 easing 差异。
  const buildGhostRotateAnim = () => {
    if (isNil(firstItem.entry.rotation)) return null
    const entryRotation = firstItem.entry.rotation
    const rotationOrigin = getRotationOrigin({
      origin: entryRotation.childCanvasOrigin,
      contentWidth,
      contentHeight,
    })
    const ease = defaultTo(entryRotation.keySplines, DEFAULT_EASE)

    // entry 阶段：与 CycleItem 使用完全相同的 buildRotationPhaseSegments
    const entrySegs = buildRotationPhaseSegments({
      rotationConfig: entryRotation,
      phaseDuration: ghostEntryDuration,
      simpleTargetValue: 0,
      defaultEase: ease,
    })

    const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 0
    const timeline = [
      ...entrySegs,
      { durationSeconds: ghostHoldDuration, toAbs: lastEntryValue, keySplines: ease },
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
  }

  // Ghost scale：与 CycleItem 一致，支持简单模式和高级 timeline 模式
  // 同 rotation，begin = ghostHoldDuration，entry 段从 keyTime 0 开始
  const buildGhostScaleAnimConfig = () => {
    if (isNil(firstItem.entry.scale)) return null
    const entryScale = firstItem.entry.scale
    const scaleOrigin = getRotationOrigin({
      origin: entryScale.childCanvasOrigin,
      contentWidth,
      contentHeight,
    })
    const ease = defaultTo(entryScale.keySplines, DEFAULT_EASE)

    // entry 阶段：与 CycleItem 使用完全相同的 buildScalePhaseSegments
    const entrySegs = buildScalePhaseSegments({
      scaleConfig: entryScale,
      phaseDuration: ghostEntryDuration,
      simpleTargetValue: 1,
      defaultEase: ease,
    })

    const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 1
    const timeline = [
      ...entrySegs,
      { durationSeconds: ghostHoldDuration, toAbs: lastEntryValue, keySplines: ease },
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
  }

  // Ghost opacity：与 CycleItem 一致，支持简单模式和高级 timeline 模式
  // 同 rotate/scale，begin = ghostHoldDuration，entry 段从 keyTime 0 开始
  const buildGhostOpacityAnim = () => {
    if (isNil(firstItem.entry.opacity)) return null
    const entryOpacity = firstItem.entry.opacity
    const ease = defaultTo(entryOpacity.keySplines, DEFAULT_EASE)

    const entrySegs = buildOpacityPhaseSegments({
      opacityConfig: entryOpacity,
      phaseDuration: ghostEntryDuration,
      simpleTargetValue: 1,
      defaultEase: ease,
    })

    const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 1
    const timeline = [
      ...entrySegs,
      { durationSeconds: ghostHoldDuration, toAbs: lastEntryValue, keySplines: ease },
    ]

    return animateOpacity({
      initValue: entryOpacity.initValue,
      timeline,
      begin: `${ghostHoldDuration}s`,
      loopCount: 0,
      isFreeze: true,
    })
  }

  const ghostSkewXAnim = buildGhostSkewXAnim()
  const ghostSkewYAnim = buildGhostSkewYAnim()
  const ghostRotateAnim = buildGhostRotateAnim()
  const ghostScaleAnimConfig = buildGhostScaleAnimConfig()
  const ghostOpacityAnim = buildGhostOpacityAnim()

  // 从最内层往外逐层包裹，只有存在对应动画时才加 <g>
  let ghostContent: React.ReactNode = renderChildItemContent({ item: firstItem, contentWidth, contentHeight })

  if (isDefined(ghostOpacityAnim)) {
    ghostContent = <g>{ghostOpacityAnim}{ghostContent}</g>
  }

  if (isDefined(ghostRotateAnim)) {
    ghostContent = <g>{ghostRotateAnim}{ghostContent}</g>
  }

  if (isDefined(ghostScaleAnimConfig)) {
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

  if (isDefined(ghostSkewYAnim)) {
    ghostContent = <g>{ghostSkewYAnim}{ghostContent}</g>
  }

  if (isDefined(ghostSkewXAnim)) {
    ghostContent = <g>{ghostSkewXAnim}{ghostContent}</g>
  }

  return (
    <g key="ghost" visibility="hidden">
      {/* visibility 切换：在图1进入段瞬间变 visible，进入完成后瞬间 hidden */}
      {animateVisibility({
        initValue: "hidden",
        timeline: [
          { durationSeconds: ghostHoldDuration, toAbs: "visible" },
          { durationSeconds: ghostEntryDuration, toAbs: "hidden" },
        ],
        begin: "0s",
        loopCount: 0,
        isFreeze: true,
      })}
      {transformTranslate({
        initValue: enterOffscreenTranslate,
        timeline: [
          { durationSeconds: ghostHoldDuration, toAbs: enterOffscreenTranslate, keySplines: DEFAULT_EASE },
          ...ghostEntryTranslateSegs,
        ],
        begin: "0s",
        loopCount: 0,
        isFreeze: true,
        isAdditive: false,
      })}
      {ghostContent}
    </g>
  )
}

export default GhostLayer
