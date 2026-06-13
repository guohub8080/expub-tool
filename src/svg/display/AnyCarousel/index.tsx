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
import svgURL from "@utils/svg/svgURL"
import type { I_TimelineKeyframe } from "@smil/timeline/types"
import type { I_TranslateValue } from "@smil/animateTransform/translate"
import type {
  I_AnyCarouselItemConfig,
  I_NormalizedItemConfig,
  I_ChildTransform,
  I_NormalizedChildTransform,
  T_ChildRole,
} from "./types"
import { DEFAULT_CHILD_GAP, DEFAULT_ANGLE } from "./types"
import { normalizeItems, normalizeChildConfig } from "./utils/normalizer"

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
 * 为某 slot 的单个通道构建 timeline
 *
 * - initValue = 状态 0（初始帧）该角色的通道值
 * - 每段 toAbs = 段末对应状态的该角色通道值（switch 段过渡到新角色，stay 段保持）
 *
 * 段 s（s=0..2N-1）：偶数段=switch，奇数段=stay；段末状态 = floor(s/2)+1。
 */
const buildChannelTimeline = (
  activeIdx: number,
  N: number,
  items: I_NormalizedItemConfig[],
  roleConfigs: Record<T_ChildRole, I_NormalizedChildTransform>,
  getValue: (cfg: I_NormalizedChildTransform) => number,
): { initValue: number; timeline: I_TimelineKeyframe<number>[] } => {
  const initValue = getValue(roleConfigs[roleOf(activeIdx, 0)])
  const timeline: I_TimelineKeyframe<number>[] = []
  const totalSegs = N * 2

  for (let seg = 0; seg < totalSegs; seg++) {
    const item = items[floor(seg / 2) % N]
    const isSwitch = seg % 2 === 0
    const dur = isSwitch ? item.switchDuration : item.stayDuration
    const splines = isSwitch ? item.keySplines : undefined
    const state = floor(seg / 2) + 1
    const value = getValue(roleConfigs[roleOf(activeIdx, state)])
    timeline.push({ toAbs: value, durationSeconds: dur, ...(splines ? { keySplines: splines } : {}) })
  }

  return { initValue, timeline }
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

  // 4 角色变换配置（标准化）
  const roleConfigs: Record<T_ChildRole, I_NormalizedChildTransform> = {
    center: normalizeChildConfig(props.centerChildConfig),
    last: normalizeChildConfig(props.lastChildConfig),
    next: normalizeChildConfig(props.nextChildConfig),
    outWindow: normalizeChildConfig(props.outWindowConfig),
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

  // 相邻 slot 步距：x 方向用 imageW+gap，y 方向用 imageH+gap
  const stepX = imageW + gap
  const stepY = imageH + gap

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
    const x = centerX - k * stepX * unit.x
    const y = centerY - k * stepY * unit.y
    slots.push({ item: items[itemIdx], activeIdx, x, y })
  }

  // 外层整体沿 +unit 方向平移：每轮推进一格（内容向 +angle 流动，next 从 -angle 侧滑入中心）
  const outerTimeline: I_TimelineKeyframe<Partial<I_TranslateValue>>[] = []
  for (let i = 0; i < N; i++) {
    const item = items[i]
    const deltaK = i + 1
    const target = {
      x: deltaK * stepX * unit.x,
      y: deltaK * stepY * unit.y,
    }
    outerTimeline.push({ toAbs: target, durationSeconds: item.switchDuration, keySplines: item.keySplines })
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
              const channel = (getValue: (c: I_NormalizedChildTransform) => number) =>
                buildChannelTimeline(activeIdx, N, items, roleConfigs, getValue)

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
              let tree = content
              if (skewYActive) {
                tree = (
                  <g>
                    {tree}
                    {transformSkewY({ ...channel(c => c.skewY), begin: '0s', loopCount: 0, isAdditive: false, isFreeze: true })}
                  </g>
                )
              }
              if (skewXActive) {
                tree = (
                  <g>
                    {tree}
                    {transformSkewX({ ...channel(c => c.skewX), begin: '0s', loopCount: 0, isAdditive: false, isFreeze: true })}
                  </g>
                )
              }
              if (rotateActive) {
                tree = (
                  <g>
                    {tree}
                    {transformRotate({ ...channel(c => c.rotate), origin: [0, 0], begin: '0s', loopCount: 0, isAdditive: false, isFreeze: true })}
                  </g>
                )
              }
              if (scaleActive) {
                tree = (
                  <g>
                    {tree}
                    {transformScaleRaw({ ...channel(c => c.scale), begin: '0s', loopCount: 0, isAdditive: false, isFreeze: true })}
                  </g>
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
