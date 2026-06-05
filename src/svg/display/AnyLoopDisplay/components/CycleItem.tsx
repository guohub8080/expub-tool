import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import max from "lodash/max"
import { transformTranslate, transformSkewX, transformSkewY, transformRotate, transformScaleRaw } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import type { I_ItemTimeline } from "@utils/svg/buildCyclicTimelines"
import { getOffscreenTranslate, getRotationOrigin } from "../timeline/offsetCalculator"
import { buildRotationPhaseSegments, buildScalePhaseSegments } from "../utils/phaseSegmentBuilders"
import { renderChildItemContent } from "./ChildItemContent"

// ease-in-out cubic-bezier，用于所有进入/退出动画
const DEFAULT_EASE = "0.42 0 0.58 1"

/**
 * CycleItem — 单张循环展示子项组件
 *
 * 每个实例渲染一张图片及其 translate/skew/scale/rotate 动画，结构为：
 *
 *   <g>                              ← 外层 translate（控制进入/退出位移）
 *     <animateTransform translate/>
 *     <g>
 *       <animateTransform skew/>     ← 可选，skew 斜切动画
 *       <g>
 *         <g transform="translate(ox,oy)">   ← 可选，scale 缩放动画（嵌套 <g> 隔离）
 *           <g>
 *             <animateTransform scale/>
 *             <g transform="translate(-ox,-oy)">
 *               content
 *             </g>
 *           </g>
 *         </g>
 *         <g>
 *           <animateTransform rotate/> ← 可选，旋转动画
 *           content
 *         </g>
 *       </g>
 *     </g>
 *   </g>
 */
const CycleItem = (props: {
  /** 当前子项的标准化配置 */
  item: I_NormalizedChildItem
  /** 当前子项的时间轴信息（由 buildCyclicTimelines 计算） */
  timeline: I_ItemTimeline
  /** 总动画周期（秒） */
  totalDuration: number
  /** 内容区域宽度（已扣除 itemGap） */
  contentWidth: number
  /** 内容区域高度（已扣除 itemGap） */
  contentHeight: number
  /** 画布宽度 */
  canvasWidth: number
  /** 画布高度 */
  canvasHeight: number
}) => {
  const { item, timeline, contentWidth, contentHeight, canvasWidth, canvasHeight } = props

  const { begin, entryDuration: switchDuration, stayDuration, exitDuration: nextSwitchDuration, holdDuration } = timeline

  // 计算 offscreen 距离时考虑 scale 因子，确保放大后的内容也完全离屏
  // 用户可通过 distance 手动覆盖自动计算的倍数
  const entryBuffer = defaultTo(item.distance, getEntryBuffer(item.entry.scale))
  const exitBuffer = defaultTo(item.distance, getExitBuffer(item.exit.scale))

  const enterOffscreenTranslate = getOffscreenTranslate({
    direction: item.entry.direction, canvasWidth, canvasHeight,
    bufferMultiplier: entryBuffer,
  })
  const exitOffscreenTranslate = getOffscreenTranslate({
    direction: item.exit.direction, canvasWidth, canvasHeight,
    bufferMultiplier: exitBuffer,
  })

  // ── translate 时间线：进入 → stay → 退出 → hold ──
  // stay=0 时跳过 stay 段，避免 keyTimes 相邻相等（calcMode=spline 下非法）
  const translateTimeline = [
    { durationSeconds: switchDuration, to: { x: 0, y: 0 }, keySplines: DEFAULT_EASE },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: { x: 0, y: 0 }, keySplines: DEFAULT_EASE }] : []),
    { durationSeconds: nextSwitchDuration, to: exitOffscreenTranslate, keySplines: DEFAULT_EASE },
    { durationSeconds: holdDuration, to: exitOffscreenTranslate, keySplines: DEFAULT_EASE },
  ]

  const hasSkew = !isNil(item.entry.skew) || !isNil(item.exit.skew)
  const hasScale = !isNil(item.entry.scale) || !isNil(item.exit.scale)
  const hasRotation = !isNil(item.entry.rotation) || !isNil(item.exit.rotation)

  // 内容节点：从最内层往外逐层包裹，只有存在对应动画时才加 <g>
  let content: React.ReactNode = renderChildItemContent({ item, contentWidth, contentHeight })

  if (hasRotation) {
    content = (
      <g>
        {renderRotateAnim({
          entryRotation: item.entry.rotation, exitRotation: item.exit.rotation,
          contentWidth, contentHeight,
          stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
        })}
        {content}
      </g>
    )
  }

  if (hasScale) {
    const scaleAnimConfig = buildScaleAnimConfig({
      entryScale: item.entry.scale, exitScale: item.exit.scale,
      contentWidth, contentHeight,
      stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
    })
    if (scaleAnimConfig) {
      // 用嵌套 <g> 隔离 translate→scale→translate-back，
      // 而不是在同一个 <g> 上用 additive="sum"（微信 WebView 对非 Center origin 叠加不准）
      content = (
        <g transform={`translate(${scaleAnimConfig.originX}, ${scaleAnimConfig.originY})`}>
          <g>
            {scaleAnimConfig.scaleAnim}
            <g transform={`translate(${-scaleAnimConfig.originX}, ${-scaleAnimConfig.originY})`}>
              {content}
            </g>
          </g>
        </g>
      )
    }
  }

  if (hasSkew) {
    content = (
      <g>
        {renderSkewAnim({
          entrySkew: item.entry.skew, exitSkew: item.exit.skew,
          stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
        })}
        {content}
      </g>
    )
  }

  return (
    <g>
      {/* 外层 translate：控制图片的进入/退出位移 */}
      {transformTranslate({
        initValue: enterOffscreenTranslate,
        timeline: translateTimeline,
        begin: `${begin}s`,
        loopCount: 0,
        isFreeze: true,
        isAdditive: false,
        isRelativeMove: false,
      })}
      {content}
    </g>
  )
}

// ── 内部工具函数 ──

/** 获取 entry 阶段的 buffer（entry 从小到大，最大值不超过 1，所以 buffer = 1） */
const getEntryBuffer = (entryScale?: I_NormalizedChildItem['entry']['scale']): number => {
  if (isNil(entryScale)) return 1
  // entry 始终趋向 1，即使 initValue > 1，entry 阶段 buffer 不影响 offscreen 距离
  return 1
}

/** 获取 exit 阶段的 buffer（取 scale 最大值确保放大内容完全离屏） */
const getExitBuffer = (exitScale?: I_NormalizedChildItem['exit']['scale']): number => {
  if (isNil(exitScale)) return 1
  if (exitScale.timeline) {
    // 高级模式：取 timeline 所有 to 值中的最大值
    const timelineMax = max(exitScale.timeline.map(segment => segment.to)) ?? 1
    return max([1, timelineMax]) ?? 1
  }
  // 简单模式：initValue 就是目标缩放值
  return max([1, defaultTo(exitScale.initValue, 1)]) ?? 1
}

/** 生成 skew animateTransform（entrySkew 和 exitSkew 均不传时返回 null） */
const renderSkewAnim = ({
  entrySkew, exitSkew, stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entrySkew?: I_NormalizedChildItem['entry']['skew']
  exitSkew?: I_NormalizedChildItem['exit']['skew']
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entrySkew) && isNil(exitSkew)) return null

  const entryAngle = entrySkew?.angle ?? 0
  const exitAngle  = exitSkew?.angle  ?? 0
  const isSkewY    = (entrySkew ?? exitSkew)!.type === 'Y'
  const skewEase   = defaultTo(entrySkew?.keySplines, defaultTo(exitSkew?.keySplines, DEFAULT_EASE))

  const segs = [
    { durationSeconds: switchDuration,    to: 0,         keySplines: skewEase },
    ...(stayDuration > 0 ? [{ durationSeconds: stayDuration, to: 0, keySplines: skewEase }] : []),
    { durationSeconds: nextSwitchDuration, to: exitAngle, keySplines: defaultTo(exitSkew?.keySplines, skewEase) },
    { durationSeconds: holdDuration,       to: exitAngle, keySplines: defaultTo(exitSkew?.keySplines, skewEase) },
  ]

  const skewConfig = {
    initValue: entryAngle,
    timeline: segs,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
    isAdditive: false,
  }

  return isSkewY ? transformSkewY(skewConfig) : transformSkewX(skewConfig)
}

/** 生成 rotate animateTransform（entryRotation 和 exitRotation 均不传时返回 null） */
const renderRotateAnim = ({
  entryRotation, exitRotation, contentWidth, contentHeight,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryRotation?: I_NormalizedChildItem['entry']['rotation']
  exitRotation?: I_NormalizedChildItem['exit']['rotation']
  contentWidth: number
  contentHeight: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entryRotation) && isNil(exitRotation)) return null

  const animInitValue = defaultTo(entryRotation?.initValue, 0)
  const exitTargetValue = defaultTo(exitRotation?.initValue, 0)

  const rotationOrigin = getRotationOrigin({
    origin: defaultTo(entryRotation?.childCanvasOrigin, exitRotation?.childCanvasOrigin ?? 'Center'),
    contentWidth,
    contentHeight,
  })

  const ease = entryRotation?.keySplines ?? exitRotation?.keySplines ?? DEFAULT_EASE

  // ── 构建 entry 阶段 segments（支持简单模式和 timeline 模式）──
  const entrySegs = buildRotationPhaseSegments({
    rotationConfig: entryRotation,
    phaseDuration: switchDuration,
    simpleTargetValue: 0,
    defaultEase: ease,
  })

  // ── 构建 stay 阶段 segments（hold 在 entry 最后值）──
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].to : 0
  const staySegs = stayDuration > 0
    ? [{ durationSeconds: stayDuration, to: lastEntryValue, keySplines: ease }]
    : []

  // ── 构建 exit 阶段 segments（支持简单模式和 timeline 模式）──
  const exitSegs = buildRotationPhaseSegments({
    rotationConfig: exitRotation,
    phaseDuration: nextSwitchDuration,
    simpleTargetValue: exitTargetValue,
    defaultEase: defaultTo(exitRotation?.keySplines, ease),
  })

  // ── 构建 hold 阶段 segments（hold 在 exit 最后值）──
  const lastExitValue = exitSegs.length > 0 ? exitSegs[exitSegs.length - 1].to : exitTargetValue
  const holdSegs = [{ durationSeconds: holdDuration, to: lastExitValue, keySplines: ease }]

  const segs = [...entrySegs, ...staySegs, ...exitSegs, ...holdSegs]

  return transformRotate({
    initValue: animInitValue,
    timeline: segs,
    origin: rotationOrigin,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
    isAdditive: false,
  })
}

/**
 * 构建 scale 动画配置（使用 transformScaleRaw + 嵌套 <g>）
 *
 * 支持：
 * - 简单模式：entry from→1, exit 1→from
 * - 高级模式：entry/exit 使用用户自定义 timeline
 */
const buildScaleAnimConfig = ({
  entryScale, exitScale, contentWidth, contentHeight,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryScale?: I_NormalizedChildItem['entry']['scale']
  exitScale?: I_NormalizedChildItem['exit']['scale']
  contentWidth: number
  contentHeight: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}): { originX: number; originY: number; scaleAnim: React.ReactNode } | null => {
  if (isNil(entryScale) && isNil(exitScale)) return null

  // 动画初始值：entry 的起始 scale
  const animInitValue = defaultTo(entryScale?.initValue, 1)

  const scaleOrigin = getRotationOrigin({
    origin: defaultTo(entryScale?.childCanvasOrigin, exitScale?.childCanvasOrigin ?? 'Center'),
    contentWidth,
    contentHeight,
  })

  const [originX, originY] = scaleOrigin
  const ease = entryScale?.keySplines ?? exitScale?.keySplines ?? DEFAULT_EASE

  // ── 构建 entry 阶段 segments ──
  const entrySegs = buildScalePhaseSegments({
    scaleConfig: entryScale,
    phaseDuration: switchDuration,
    simpleTargetValue: 1,
    defaultEase: ease,
  })

  // ── 构建 stay 阶段 segments（hold 在 entry 最后值）──
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].to : 1
  const staySegs = stayDuration > 0
    ? [{ durationSeconds: stayDuration, to: lastEntryValue, keySplines: ease }]
    : []

  // ── 构建 exit 阶段 segments ──
  const exitTargetValue = defaultTo(exitScale?.initValue, 1)
  const exitSegs = buildScalePhaseSegments({
    scaleConfig: exitScale,
    phaseDuration: nextSwitchDuration,
    simpleTargetValue: exitTargetValue,
    defaultEase: ease,
  })

  // ── 构建 hold 阶段 segments（hold 在 exit 最后值）──
  const lastExitValue = exitSegs.length > 0 ? exitSegs[exitSegs.length - 1].to : exitTargetValue
  const holdSegs = [{ durationSeconds: holdDuration, to: lastExitValue, keySplines: ease }]

  const segs = [...entrySegs, ...staySegs, ...exitSegs, ...holdSegs]

  return {
    originX,
    originY,
    scaleAnim: transformScaleRaw({
      initValue: animInitValue,
      timeline: segs,
      begin: `${begin}s`,
      loopCount: 0,
      isFreeze: true,
      isAdditive: false,
    }),
  }
}

export default CycleItem
