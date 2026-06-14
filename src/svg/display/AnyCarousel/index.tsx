import type { ReactNode } from "react"
import SectionEx from "@html/basicEx/SectionEx"
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import type { I_CanvasBg } from '@svg/types'
import SvgEx from "@html/basicEx/SvgEx"
import floor from "lodash/floor"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import {
  transformTranslate,
  transformScaleRaw,
  transformRotate,
  transformSkewX,
  transformSkewY,
} from "@smil/index"
import { animateOpacity } from "@smil/index"
import { getSineBezier } from "@smil/bezier"
import svgURL from "@utils/svg/svgURL"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type {
  I_AnyCarouselItemConfig,
  I_NormalizedItemConfig,
  I_ChildTransform,
  I_NormalizedChildTransform,
  I_PivotPoint,
  T_ChildRole,
} from "./types"
import { DEFAULT_CHILD_GAP, DEFAULT_ANGLE } from "./types"
import { normalizeItems, normalizeChildConfig } from "./utils/normalizer"

/** 通道缺省缓动：easeInOutSine（channel keySplines 未指定时使用） */
const DEFAULT_CHANNEL_KEY_SPLINES = getSineBezier()

/**
 * 角度 → 内容流动方向单位向量
 *
 * 约定：angle 即内容流动方向——0° = 向右流 (+x)，90° = 向上流，180° = 向左流。
 * 内容整体沿此方向平移（flow = +angle 方向）。
 * 因 SVG 的 y 轴朝下，"上"对应 -y，故 y = -sin(θ)。
 */
const getAngleUnitVector = (angle: number): { x: number; y: number } => {
  const rad = angle * Math.PI / 180
  return { x: Math.cos(rad), y: -Math.sin(rad) }
}

/**
 * 计算 slot 在某个「状态」下所扮演的角色
 *
 * 状态 S = 已推进的格数；slot 的相对位置 kEff = activeIdx - S：
 * - kEff == 0  → center（正中）
 * - kEff == +1 → next（-angle 入口侧，即将进入中心）
 * - kEff == -1 → last（+angle 出口侧，刚离开中心）
 * - 其余       → outWindow（屏外）
 *
 * 推进时 S 增加，kEff 减小：item 从 next(-angle) 滑入 center，再滑向 last(+angle)。
 * 内容整体沿 +angle 方向流动（0°=向右，180°=向左）。
 */
const roleOf = (activeIdx: number, state: number): T_ChildRole => {
  const k = activeIdx - state
  if (k === 0) return 'center'
  if (k === 1) return 'next'
  if (k === -1) return 'last'
  return 'outWindow'
}

/**
 * 为某 slot 的单个通道构建 timeline（值序列或 pivot 序列，泛型 T）
 *
 * - initValue = 状态 0（初始帧）该角色的通道值
 * - 每段 toAbs = 段末对应状态的该角色通道值（switch 段过渡到新角色，stay 段保持）
 *
 * 段 s（s=0..2N-1）：偶数段=switch，奇数段=stay；段末状态 = floor(s/2)+1。
 * 同一 slot 用相同 seg 迭代驱动不同 getValue，得到的各通道 timeline 天然逐帧同步。
 */
const buildChannelTimeline = <T,>(
  activeIdx: number,
  N: number,
  items: I_NormalizedItemConfig[],
  roleConfigs: Record<T_ChildRole, I_NormalizedChildTransform>,
  getValue: (cfg: I_NormalizedChildTransform) => T,
  getKeySplines?: (cfg: I_NormalizedChildTransform) => string | undefined,
): { initValue: T; timeline: I_TimelineKeyframe<T>[] } => {
  const initValue = getValue(roleConfigs[roleOf(activeIdx, 0)])
  const timeline: I_TimelineKeyframe<T>[] = []
  const totalSegs = N * 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const item = items[floor(seg / 2) % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const state = floor(seg / 2) + 1
    const role = roleOf(activeIdx, state)
    // switch 段缓动：优先取该角色该通道的 keySplines，缺省回退 easeInOutSine
    const channelKeySplines = getKeySplines?.(roleConfigs[role])
    const splines = isSwitch ? defaultTo(channelKeySplines, DEFAULT_CHANNEL_KEY_SPLINES) : undefined
    const value = getValue(roleConfigs[role])
    timeline.push({ toAbs: value, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }

  return { initValue, timeline }
}

/** pivot 序列（initValue + 每段末值） */
type T_PointSeq = { initValue: I_PivotPoint; timeline: I_TimelineKeyframe<I_PivotPoint>[] }

/** 把 pivot 序列展开为逐关键帧 [x,y] 数组（供 transformRotate 的 pivots，长度 = timeline.length + 1） */
const pivotSeqToRotatePivots = (seq: T_PointSeq): [number, number][] =>
  [seq.initValue, ...seq.timeline.map(k => k.toAbs)].map(p => [p.x, p.y])

/**
 * 用「pivot 补偿」把一个变换动画（scale/skewX/skewY）的 pivot 从默认的内容中心挪到 seq 指定的点。
 * 分三档省 DOM：
 * - 全 Center（[0,0]）：不补偿，<g>{inner}{anim}</g>（等价于原先无 pivot）
 * - 全相同非 Center：静态 translate(+p) → anim → translate(-p)（+0 anim，微信 WebView 友好）
 * - 逐角色不同：动画 pivot（pivot-in translate → anim → pivot-out translate，逐帧同步，+2 anim）
 *
 * 纯 translate 不涉及隐式 pivot，additive/replace 均无微信叠加问题；这里每个 pivot <g> 只挂一条 anim，
 * 用 isAdditive:false（replace）最稳。
 */
const wrapWithPivot = (inner: ReactNode, pivotSeq: T_PointSeq, anim: ReactNode): ReactNode => {
  const points: I_PivotPoint[] = [pivotSeq.initValue, ...pivotSeq.timeline.map(k => k.toAbs)]

  const allCenter = points.every(p => p.x === 0 && p.y === 0)
  if (allCenter) {
    return <g>{inner}{anim}</g>
  }

  const first = points[0]
  const constant = points.every(p => p.x === first.x && p.y === first.y)
  if (constant) {
    return (
      <g transform={`translate(${first.x},${first.y})`}>
        <g>
          {anim}
          <g transform={`translate(${-first.x},${-first.y})`}>{inner}</g>
        </g>
      </g>
    )
  }

  // 逐角色不同 pivot：动画 pivot，逐帧与 anim 的 keyTimes 同步
  const negSeq: T_PointSeq = {
    initValue: { x: -pivotSeq.initValue.x, y: -pivotSeq.initValue.y },
    timeline: pivotSeq.timeline.map(k => ({ ...k, toAbs: { x: -k.toAbs.x, y: -k.toAbs.y } })),
  }
  return (
    <g>
      {transformTranslate({ initValue: pivotSeq.initValue, timeline: pivotSeq.timeline, begin: '0s', loopCount: 0, isFreeze: true, isAdditive: false })}
      <g>
        {anim}
        <g>
          {transformTranslate({ initValue: negSeq.initValue, timeline: negSeq.timeline, begin: '0s', loopCount: 0, isFreeze: true, isAdditive: false })}
          {inner}
        </g>
      </g>
    </g>
  )
}

const AnyCarousel = (props: {
  canvasSize: { w: number; h: number }
  spacing?: T_SpacingProps
  childItems?: I_AnyCarouselItemConfig[]
  canvasBg?: I_CanvasBg
  /** 每个 child 的画布尺寸（共用） */
  childCanvasSize: { w: number; h: number }
  /** 相邻 child 之间的间距，默认 100 */
  childGap?: number
  /** 中心角色（当前居中）变换配置 */
  centerChildConfig?: I_ChildTransform
  /** last 角色（+angle 出口侧、刚离开中心）变换配置 */
  lastChildConfig?: I_ChildTransform
  /** next 角色（-angle 入口侧、即将进入中心）变换配置 */
  nextChildConfig?: I_ChildTransform
  /** 屏外角色（超出 last/next 之外）变换配置，默认恒等 */
  outWindowConfig?: I_ChildTransform
  /** 流动方向角度（度），即内容流动方向：0 = 向右，90 = 向上，180 = 向左，默认 0 */
  angle?: number
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.childItems?.[0]
  if (isNil(firstPic?.url) && isNil(firstPic?.item)) return null

  const viewBoxW = props.canvasSize.w
  const viewBoxH = props.canvasSize.h
  const imageW = props.childCanvasSize.w
  const imageH = props.childCanvasSize.h
  const gap = defaultTo(props.childGap, DEFAULT_CHILD_GAP)
  const angle = defaultTo(props.angle, DEFAULT_ANGLE)

  const items = normalizeItems(props.childItems)
  const N = items.length
  const isDev = ExPubGoConfig().mode === 'development'

  // 4 角色变换配置（标准化，pivot 以 childCanvas 尺寸为基准解析）
  const roleConfigs: Record<T_ChildRole, I_NormalizedChildTransform> = {
    center: normalizeChildConfig(props.centerChildConfig, imageW, imageH),
    last: normalizeChildConfig(props.lastChildConfig, imageW, imageH),
    next: normalizeChildConfig(props.nextChildConfig, imageW, imageH),
    outWindow: normalizeChildConfig(props.outWindowConfig, imageW, imageH),
  }

  // 检测哪些通道有非恒等值（决定是否渲染对应 animateTransform / animate）
  const allCfgs = Object.values(roleConfigs)
  const scaleActive = allCfgs.some(c => c.scale !== 1)
  const rotateActive = allCfgs.some(c => c.rotate !== 0)
  const skewXActive = allCfgs.some(c => c.skewX !== 0)
  const skewYActive = allCfgs.some(c => c.skewY !== 0)
  const opacityActive = allCfgs.some(c => c.opacity !== 1)
  const hasTransform = scaleActive || rotateActive || skewXActive || skewYActive

  // 流动方向单位向量（0°=右，90°=上）
  const unit = getAngleUnitVector(angle)

  // 相邻 slot 步距（中心到中心，沿流向）：盒子在流向轴上的投影长 + gap。
  // 投影长 = imageW·|cosθ| + imageH·|sinθ|（盒子沿流向的影子）。
  // gap=0 → 影子相接：轴向即贴边；斜向留一条对角细缝，永不重叠。
  // 单一 step×unit 使 slots 严格沿真实角度排列（非正方形画布也不歪斜）。
  const step = imageW * Math.abs(unit.x) + imageH * Math.abs(unit.y) + gap

  // 中心 slot 左上角坐标（中心 item 居中于 viewBox）
  const centerX = (viewBoxW - imageW) / 2
  const centerY = (viewBoxH - imageH) / 2

  /**
   * slot 排布：内容沿 +angle 方向流动，故 next/入口侧在 -angle 方向、last/出口侧在 +angle 方向，共 N+3 个 slot。
   * slot[1] = 中心（activeIdx=0，显示 items[0]），slot[2..] 依次往 -angle 方向排（next），
   * slot[0] 在 +angle 侧（初始的 last）。首尾 ghost 副本用于无缝循环。
   */
  const slots: { item: I_NormalizedItemConfig; activeIdx: number; x: number; y: number }[] = []
  for (let i = 0; i < N + 3; i++) {
    const itemIdx = (i - 1 + N * 10) % N      // slot[1] 显示 items[0]
    const activeIdx = i - 1                    // 该 slot 在第 activeIdx 个状态到达中心
    const k = i - 1                            // 相对中心的步数（k>0 = next 入口侧）
    const x = centerX - k * step * unit.x
    const y = centerY - k * step * unit.y
    slots.push({ item: items[itemIdx], activeIdx, x, y })
  }

  // 外层整体沿 +unit 方向平移：每轮推进一格（内容向 +angle 流动，next 从 -angle 侧滑入中心）
  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const deltaK = i + 1
    const target = {
      x: deltaK * step * unit.x,
      y: deltaK * step * unit.y,
    }
    outerTimeline.push({ toAbs: target, durationSeconds: item.switchDuration, keySplines: DEFAULT_CHANNEL_KEY_SPLINES })
    outerTimeline.push({ toAbs: target, durationSeconds: item.stayDuration })
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-carousel' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "none", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          style={{ display: "block", margin: "0 auto", ...resolveCanvasBg(props.canvasBg) }}
          width="100%">
          <g>
            {slots.map((slot, si) => {
              const { item, activeIdx, x, y } = slot
              const channel = <T,>(
                getValue: (c: I_NormalizedChildTransform) => T,
                getKeySplines?: (c: I_NormalizedChildTransform) => string | undefined,
              ) =>
                buildChannelTimeline<T>(activeIdx, N, items, roleConfigs, getValue, getKeySplines)

              // 内容（最内层）：内容中心置于本地原点，使各 transform 自然围绕中心作用
              const content = (
                <g transform={`translate(${-imageW / 2},${-imageH / 2})`}>
                  <foreignObject x={0} y={0} width={imageW} height={imageH}>
                    {item.useItem
                      ? item.item
                      : <SvgEx
                          viewBox={`0 0 ${imageW} ${imageH}`}
                          style={{
                            backgroundImage: svgURL(item.url!),
                            backgroundSize: "cover",
                          }}
                        />
                    }
                  </foreignObject>
                  {opacityActive && animateOpacity({
                    ...channel(c => c.opacity),
                    begin: '0s',
                    loopCount: 0,
                    isFreeze: true,
                  })}
                </g>
              )

              // 变换层：由内到外依次包裹 skewY → skewX → rotate → scale
              // （外层后作用：内容先居中 → 倾斜 → 旋转 → 缩放 → 落位）
              // scale/skew 用 wrapWithPivot 按该通道 pivot 补偿；rotate 用逐关键帧 pivot
              let tree: ReactNode = content
              if (skewYActive) {
                tree = wrapWithPivot(
                  tree,
                  channel(c => c.skewYPivot),
                  transformSkewY({ ...channel(c => c.skewY, c => c.skewYKeySplines), begin: '0s', loopCount: 0, isAdditive: false, isFreeze: true }),
                )
              }
              if (skewXActive) {
                tree = wrapWithPivot(
                  tree,
                  channel(c => c.skewXPivot),
                  transformSkewX({ ...channel(c => c.skewX, c => c.skewXKeySplines), begin: '0s', loopCount: 0, isAdditive: false, isFreeze: true }),
                )
              }
              if (rotateActive) {
                tree = (
                  <g>
                    {tree}
                    {transformRotate({
                      ...channel(c => c.rotate, c => c.rotateKeySplines),
                      pivots: pivotSeqToRotatePivots(channel(c => c.rotatePivot)),
                      begin: '0s',
                      loopCount: 0,
                      isAdditive: false,
                      isFreeze: true,
                    })}
                  </g>
                )
              }
              if (scaleActive) {
                tree = wrapWithPivot(
                  tree,
                  channel(c => c.scalePivot),
                  transformScaleRaw({ ...channel(c => c.scale, c => c.scaleKeySplines), begin: '0s', loopCount: 0, isAdditive: false, isFreeze: true }),
                )
              }

              // slot 定位到「slot 中心」（内容已内移 -w/2 居中）
              return (
                <g key={si} transform={`translate(${x + imageW / 2},${y + imageH / 2})`}>
                  {tree}
                </g>
              )
            })}
            {transformTranslate({
              initValue: { x: 0, y: 0 },
              timeline: outerTimeline,
              begin: '0s',
              loopCount: 0,
              isFreeze: true,
              isAdditive: true,
            })}
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnyCarousel
