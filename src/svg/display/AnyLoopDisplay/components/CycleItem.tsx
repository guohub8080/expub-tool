import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import max from "lodash/max"
import { transformTranslate } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import type { I_ItemTimeline } from "@utils/svg/buildCyclicTimelines"
import { getOffscreenTranslate } from "../timeline/offsetCalculator"
import { buildTranslatePhaseSegments, buildStayTranslateSegments } from "../utils/phaseSegmentBuilders"
import { renderChildItemContent } from "./ChildItemContent"
import { renderSkewAxisAnim } from "./renderSkewAnim"
import { renderRotateAnim } from "./renderRotateAnim"
import { buildScaleAnimConfig } from "./renderScaleAnim"
import { renderOpacityAnim } from "./renderOpacityAnim"
import { DEFAULT_EASE, combinePhaseSegments } from "./buildFullSegments"

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

  const entryTranslate = item.entry.translate
  const exitTranslate = item.exit.translate

  // ── 计算 translate initValue ──
  // 简单模式：由 direction + distance 自动计算 offscreen 坐标
  // 高级模式：用户自定义 initValue
  const translateInitValue = entryTranslate.timeline
    ? (entryTranslate.initValue ?? { x: 0, y: 0 })
    : getOffscreenTranslate({
        direction: entryTranslate.direction, canvasWidth, canvasHeight,
        bufferMultiplier: defaultTo(entryTranslate.distance, getEntryBuffer(item.entry.scale)),
      })

  // ── 计算 exit simpleTarget（仅简单模式使用） ──
  const exitOffscreen = exitTranslate.timeline
    ? undefined
    : getOffscreenTranslate({
        direction: exitTranslate.direction, canvasWidth, canvasHeight,
        bufferMultiplier: defaultTo(exitTranslate.distance, getExitBuffer(item.exit.scale)),
      })

  // ── 分阶段构建 translate timeline ──
  const ease = entryTranslate.keySplines ?? exitTranslate.keySplines ?? DEFAULT_EASE

  const entrySegs = buildTranslatePhaseSegments({
    translateConfig: entryTranslate,
    phaseDuration: switchDuration,
    simpleTargetValue: { x: 0, y: 0 },
    defaultEase: ease,
  })

  const lastEntryValue = entrySegs[entrySegs.length - 1].to
  const staySegs = buildStayTranslateSegments({
    stayConfig: item.stay.translate,
    stayDuration,
    entryEndValue: lastEntryValue,
    defaultEase: DEFAULT_EASE,
  })

  const exitSegs = buildTranslatePhaseSegments({
    translateConfig: exitTranslate,
    phaseDuration: nextSwitchDuration,
    simpleTargetValue: exitOffscreen ?? { x: 0, y: 0 },
    defaultEase: defaultTo(exitTranslate.keySplines, ease),
  })

  const translateTimeline = combinePhaseSegments(
    entrySegs, staySegs, exitSegs,
    exitOffscreen ?? { x: 0, y: 0 },
    holdDuration,
    DEFAULT_EASE,
  )

  const hasSkewX = !isNil(item.entry.skewX) || !isNil(item.exit.skewX) || !isNil(item.stay.skewX)
  const hasSkewY = !isNil(item.entry.skewY) || !isNil(item.exit.skewY) || !isNil(item.stay.skewY)
  const hasScale = !isNil(item.entry.scale) || !isNil(item.exit.scale) || !isNil(item.stay.scale)
  const hasRotation = !isNil(item.entry.rotation) || !isNil(item.exit.rotation) || !isNil(item.stay.rotation)
  const hasOpacity = !isNil(item.entry.opacity) || !isNil(item.exit.opacity) || !isNil(item.stay.opacity) || !isNil(item.hold.opacity)

  // 内容节点：从最内层往外逐层包裹，只有存在对应动画时才加 <g>
  let content: React.ReactNode = renderChildItemContent({ item, contentWidth, contentHeight })

  if (hasOpacity) {
    content = (
      <g>
        {renderOpacityAnim({
          entryOpacity: item.entry.opacity, exitOpacity: item.exit.opacity,
          stayOpacity: item.stay.opacity, holdOpacity: item.hold.opacity,
          stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
        })}
        {content}
      </g>
    )
  }

  if (hasRotation) {
    content = (
      <g>
        {renderRotateAnim({
          entryRotation: item.entry.rotation, exitRotation: item.exit.rotation,
          stayRotation: item.stay.rotation,
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
      stayScale: item.stay.scale,
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

  if (hasSkewY) {
    content = (
      <g>
        {renderSkewAxisAnim({
          axis: 'Y',
          entrySkew: item.entry.skewY, exitSkew: item.exit.skewY,
          staySkew: item.stay.skewY,
          stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
        })}
        {content}
      </g>
    )
  }

  if (hasSkewX) {
    content = (
      <g>
        {renderSkewAxisAnim({
          axis: 'X',
          entrySkew: item.entry.skewX, exitSkew: item.exit.skewX,
          staySkew: item.stay.skewX,
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
        initValue: translateInitValue,
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
  return 1
}

/** 获取 exit 阶段的 buffer（取 scale 最大值确保放大内容完全离屏） */
const getExitBuffer = (exitScale?: I_NormalizedChildItem['exit']['scale']): number => {
  if (isNil(exitScale)) return 1
  if (exitScale.timeline) {
    const timelineMax = max(exitScale.timeline.map(segment => segment.to)) ?? 1
    return max([1, timelineMax]) ?? 1
  }
  return max([1, defaultTo(exitScale.initValue, 1)]) ?? 1
}

export default CycleItem
