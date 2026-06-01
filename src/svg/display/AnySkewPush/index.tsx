import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import svgURL from "@utils/svg/svgURL"
import { compileTimeline } from "@smil/timeline/compile"
import type { ReactNode } from "react"
import type { T_Direction4 } from "../../types"

export interface I_SkewConfig {
  /** skewX 或 skewY，决定斜切轴方向 */
  type: 'X' | 'Y'
  /** 斜切角度（度），正负决定倾斜方向，建议 0–45 */
  angle: number
}

export interface I_AnySkewPushChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一） */
  jsx?: ReactNode
  /**
   * 进入方向：图片从哪个方向推入画布，默认 T（从上方进入）
   * T = 从上方进入，B = 从下方，L = 从左，R = 从右
   */
  entryDirection?: T_Direction4
  /**
   * 退出方向：图片向哪个方向推出画布，默认与进入方向相反（T↔B，L↔R）
   * 可独立配置，例如从上进入、从右退出
   */
  exitDirection?: T_Direction4
  /**
   * 进入时的 skew 变换配置，不传则进入无 skew
   * angle 为进入起始角度，动画结束时归零（全屏静止时无 skew）
   */
  entrySkew?: I_SkewConfig
  /**
   * 退出时的 skew 变换配置，不传则退出无 skew
   * angle 为退出终止角度，从零开始动画到该角度
   */
  exitSkew?: I_SkewConfig
  /**
   * 进入时的旋转角度（度），正值=顺时针，不传则进入无旋转
   * 以画布中心为旋转原点，进入起始角度，动画结束时归零
   */
  entryRotation?: number
  /**
   * 退出时的旋转角度（度），正值=顺时针，不传则退出无旋转
   * 以画布中心为旋转原点，从零开始动画到该角度
   */
  exitRotation?: number
  /** 停留时长（秒），图片全屏静止的持续时间，默认 2 */
  stayDuration?: number
  /**
   * 切换动画时长（秒），默认 2
   * 注意：当前图的退出时长由【下一张图】的 switchDuration 决定，
   * 因为下一张图进入时会覆盖当前图的退出，两者共享同一段时间。
   */
  switchDuration?: number
}

// ease-in-out cubic-bezier，用于所有进入/退出动画
const EASE = "0.42 0 0.58 1"
const DEFAULT_STAY = 2
const DEFAULT_SWITCH = 2
const DEFAULT_DIRECTION: T_Direction4 = 'T'

/** 进入方向取反，作为默认退出方向（T↔B，L↔R） */
const oppositeDir = (dir: T_Direction4): T_Direction4 =>
  dir === 'T' ? 'B' : dir === 'B' ? 'T' : dir === 'L' ? 'R' : 'L'

const AnySkewPush = (props: {
  canvasSize: { w: number; h: number }
  childItems: I_AnySkewPushChildItem[]
  itemGap?: number
  spacing?: T_SpacingProps
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  if (!props.childItems?.length) return null

  const { w, h } = props.canvasSize
  const items = props.childItems
  const N = items.length
  const itemGap = defaultTo(props.itemGap, 0)
  const contentW = Math.max(1, w - itemGap * 2)
  const contentH = Math.max(1, h - itemGap * 2)
  const isDev = ExPubGoConfig().mode === 'development'

  // 总动画周期 = 所有图的 (switchDuration + stayDuration) 之和
  const T = items.reduce((s, p) =>
    s + defaultTo(p.stayDuration, DEFAULT_STAY) + defaultTo(p.switchDuration, DEFAULT_SWITCH), 0)

  /**
   * 计算第 i 张图的 SMIL begin 时间。
   *
   * 设计原则：图1的 begin = -sw，使得 t=0 时图1恰好完成进入、处于全屏静止状态。
   * 后续图的 begin 依次累加，但整体减去一个完整周期 T，
   * 确保 t=0 时所有图的动画都已经运行过一轮、处于正确位置——
   * 否则 begin > 0 的图在 t=0 时动画尚未开始，<g> 会停在原点（全屏中心）造成闪烁。
   */
  const getBegin = (i: number) => {
    if (i === 0) return -defaultTo(items[0].switchDuration, DEFAULT_SWITCH)
    let b = defaultTo(items[0].stayDuration, DEFAULT_STAY)
    for (let j = 1; j < i; j++)
      b += defaultTo(items[j].switchDuration, DEFAULT_SWITCH) + defaultTo(items[j].stayDuration, DEFAULT_STAY)
    return b - T
  }

  /**
   * 根据推入/推出方向返回屏幕外的 translate 坐标字符串（"x y" 格式）。
   *
   * 坐标系以画布中心为原点：
   *   T（从上进入）→ 图片初始在下方边界外：y = +(h+1)
   *   B（从下进入）→ 图片初始在上方边界外：y = -(h+1)
   *   L（从左进入）→ 图片初始在右方边界外：x = +(w+1)
   *   R（从右进入）→ 图片初始在左方边界外：x = -(w+1)
   */
  const getOffscreenTy = (dir: T_Direction4) => {
    switch (dir) {
      case 'T': return `0 ${h + 1}`
      case 'B': return `0 ${-(h + 1)}`
      case 'L': return `${w + 1} 0`
      case 'R': return `${-(w + 1)} 0`
    }
  }

  // 渲染图片内容（url 模式或 jsx 模式），坐标系以画布中心为原点，这里平移回左上角
  const renderContent = (item: I_AnySkewPushChildItem) => (
    <g transform={`translate(${-contentW / 2}, ${-contentH / 2})`}>
      <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
        {item.jsx
          ? item.jsx
          : <SvgEx viewBox={`0 0 ${contentW + 1} ${contentH + 1}`}
              style={{
                backgroundImage: svgURL(item.url!), backgroundSize: "cover",
                backgroundPosition: "50% 50%", backgroundRepeat: "no-repeat",
                width: "100%", display: "block", boxSizing: "border-box",
              }} />
        }
      </foreignObject>
    </g>
  )

  /**
   * 生成 skew animateTransform（entrySkew 和 exitSkew 均不传时返回 null）。
   *
   * 时间线4段（stay=0 时跳过 stay 段，避免 keyTimes 相邻相等导致 calcMode=spline 非法）：
   *   进入段 sw：    entryAngle → 0（skew 随图片进入归零）
   *   stay 段：      0 → 0（全屏静止，无 skew）
   *   退出段 nextSw：0 → exitAngle（skew 随图片退出增大）
   *   hold 段：      exitAngle（停在屏幕外，保持退出角度）
   *
   * @param entrySkew  进入 skew 配置（type + angle）
   * @param exitSkew   退出 skew 配置（type + angle）
   * @param stay       停留时长（秒）
   * @param sw         当前图进入时长（秒）
   * @param nextSw     下一张图进入时长 = 当前图退出时长（秒）
   * @param holdTime   屏幕外等待时长（秒）
   * @param begin      SMIL begin 时间（秒）
   */
  const renderSkewAnim = (
    entrySkew: I_SkewConfig | undefined,
    exitSkew: I_SkewConfig | undefined,
    stay: number,
    sw: number,
    nextSw: number,
    holdTime: number,
    begin: number,
  ) => {
    if (isNil(entrySkew) && isNil(exitSkew)) return null

    const entryAngle = entrySkew?.angle ?? 0
    const exitAngle  = exitSkew?.angle  ?? 0
    // 两者都传时以 entrySkew.type 为准（进入和退出共用同一个 skew 轴）
    const skewType   = `skew${(entrySkew ?? exitSkew)!.type}` as 'skewX' | 'skewY'

    const segs = [
      { durationSeconds: sw,       to: 0,         keySplines: EASE },
      ...(stay > 0 ? [{ durationSeconds: stay, to: 0, keySplines: EASE }] : []),
      { durationSeconds: nextSw,   to: exitAngle, keySplines: EASE },
      { durationSeconds: holdTime, to: exitAngle, keySplines: EASE },
    ]
    const result = compileTimeline(segs, v => `${v}`, entryAngle)

    return (
      <animateTransform attributeName="transform" type={skewType}
        values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
        dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
        begin={`${begin}s`} fill="freeze" />
    )
  }

  /**
   * 生成 rotate animateTransform（entryRotation 和 exitRotation 均不传时返回 null）。
   *
   * rotate values 格式为 "angle cx cy"，cx=cy=0 表示以坐标系原点（画布中心）为旋转中心。
   * 时间线结构与 renderSkewAnim 完全一致，参数含义相同。
   */
  const renderRotateAnim = (
    entryRotation: number | undefined,
    exitRotation: number | undefined,
    stay: number,
    sw: number,
    nextSw: number,
    holdTime: number,
    begin: number,
  ) => {
    if (isNil(entryRotation) && isNil(exitRotation)) return null

    const entryAngle = entryRotation ?? 0
    const exitAngle  = exitRotation  ?? 0

    const segs = [
      { durationSeconds: sw,       to: 0,         keySplines: EASE },
      ...(stay > 0 ? [{ durationSeconds: stay, to: 0, keySplines: EASE }] : []),
      { durationSeconds: nextSw,   to: exitAngle, keySplines: EASE },
      { durationSeconds: holdTime, to: exitAngle, keySplines: EASE },
    ]
    const result = compileTimeline(segs, v => `${v} 0 0`, entryAngle)

    return (
      <animateTransform attributeName="transform" type="rotate"
        values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
        dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
        begin={`${begin}s`} fill="freeze" />
    )
  }

  /**
   * Ghost Layer：图1的视觉副本，渲染在 DOM 最后（SVG z 轴最顶层）。
   *
   * 问题背景：SVG 使用 painter's algorithm，DOM 靠后的元素覆盖靠前的元素。
   * 图1在 DOM 第一位（最底层），图N在最后（最顶层）。
   * 当图N退出、图1进入时，图N在上层会遮住图1，导致图1的进入动画不可见。
   *
   * 解决方案：在 DOM 末尾放一个与图1完全相同的副本（Ghost），
   * 只在图1进入的那段时间内可见（visibility: hidden → visible → hidden），
   * 其余时间隐藏。这样视觉上图1始终能覆盖图N，实现"新图永远盖住旧图"的效果。
   *
   * 时序：Ghost 的动画周期 = T，begin = 0s。
   * - [0, T-sw0)：停在屏幕外，visibility=hidden（图1处于 stay/退出/hold 阶段）
   * - [T-sw0, T)：执行与图1完全相同的进入动画，visibility=visible（图1进入阶段）
   * - T 时刻：瞬间 hidden，图1已到位，Ghost 完成使命
   *
   * Ghost 的 skew/rotate 用2段时间线（前段保持进入值，后段归零），
   * 与 Ghost translate 同构，begin 统一为 0s。
   */
  const renderGhostLayer = () => {
    if (N <= 1) return null

    const item0    = items[0]
    const dir0     = defaultTo(item0.entryDirection, DEFAULT_DIRECTION)
    const sw0      = defaultTo(item0.switchDuration, DEFAULT_SWITCH)
    const enterTy0 = getOffscreenTy(dir0)

    // Ghost 在周期内的 keyTime：从这个时刻开始变 visible（= 图1进入开始）
    const ghostShowKt = ((T - sw0) / T).toFixed(6)

    // Ghost translate：前段停在屏幕外（enterTy0），后段执行进入动画（→ 0 0）
    const ghostTy = compileTimeline(
      [
        { durationSeconds: T - sw0, to: enterTy0, keySplines: EASE },
        { durationSeconds: sw0,     to: '0 0',    keySplines: EASE },
      ],
      v => v,
      enterTy0,
    )

    // Ghost skew：仅在 entrySkew 存在时渲染
    // 前段保持 entryAngle（图1在屏幕外时的 skew 状态），后段随进入动画归零
    const ghostSkewAnim = item0.entrySkew && (() => {
      const result = compileTimeline(
        [
          { durationSeconds: T - sw0, to: item0.entrySkew!.angle, keySplines: EASE },
          { durationSeconds: sw0,     to: 0,                      keySplines: EASE },
        ],
        v => `${v}`,
        item0.entrySkew!.angle,
      )
      return (
        <animateTransform attributeName="transform" type={`skew${item0.entrySkew!.type}` as 'skewX' | 'skewY'}
          values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
          dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
      )
    })()

    // Ghost rotate：仅在 entryRotation 存在时渲染，结构与 ghostSkewAnim 完全对称
    const ghostRotateAnim = !isNil(item0.entryRotation) && (() => {
      const result = compileTimeline(
        [
          { durationSeconds: T - sw0, to: item0.entryRotation!, keySplines: EASE },
          { durationSeconds: sw0,     to: 0,                    keySplines: EASE },
        ],
        v => `${v} 0 0`,
        item0.entryRotation!,
      )
      return (
        <animateTransform attributeName="transform" type="rotate"
          values={result.values} keyTimes={result.keyTimes} keySplines={result.keySplines}
          dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
      )
    })()

    return (
      <g key="ghost" visibility="hidden">
        {/* visibility 切换：在图1进入段瞬间变 visible，进入完成后瞬间 hidden */}
        <animate attributeName="visibility"
          values="hidden; visible; hidden"
          keyTimes={`0; ${ghostShowKt}; 1`}
          dur={`${T}s`} calcMode="discrete"
          repeatCount="indefinite" begin="0s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate"
          values={ghostTy.values} keyTimes={ghostTy.keyTimes} keySplines={ghostTy.keySplines}
          dur={`${T}s`} calcMode="spline" repeatCount="indefinite" begin="0s" fill="freeze" />
        <g>
          {ghostSkewAnim}
          {ghostRotateAnim}
          {renderContent(item0)}
        </g>
      </g>
    )
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-skew-push' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto" }} width="100%">
          {/*
            初始 visibility="hidden"，0.05s 后变 visible。
            目的：SMIL 引擎在第一个 paint 之前尚未初始化，若不隐藏，
            各图的 <g> 会在动画接管前短暂停在原点（全屏中心），造成初始闪烁。
          */}
          <g transform={`translate(${itemGap}, ${itemGap})`} visibility="hidden">
            <set attributeName="visibility" to="visible" begin="0.05s" fill="freeze" />
            {/* 坐标系平移到画布中心，所有图的 translate 动画以中心为原点计算 */}
            <g transform={`translate(${contentW / 2}, ${contentH / 2})`}>
              {items.map((item, i) => {
                const dir      = defaultTo(item.entryDirection, DEFAULT_DIRECTION)
                const exitDir  = defaultTo(item.exitDirection, oppositeDir(dir))
                const stay     = defaultTo(item.stayDuration, DEFAULT_STAY)
                const sw       = defaultTo(item.switchDuration, DEFAULT_SWITCH)
                // 退出时长由下一张图的 switchDuration 决定（下一张进入时覆盖当前图退出）
                const nextSw   = defaultTo(items[(i + 1) % N].switchDuration, DEFAULT_SWITCH)
                // hold = 在屏幕外等待下一轮进入的时间
                const holdTime = T - sw - stay - nextSw
                const begin    = getBegin(i)
                const enterTy  = getOffscreenTy(dir)
                const exitTy   = getOffscreenTy(exitDir)

                // translate 4段时间线：进入 → stay → 退出 → hold
                // stay=0 时跳过 stay 段，避免 keyTimes 相邻相等（calcMode=spline 下非法）
                const tySegs = [
                  { durationSeconds: sw,       to: '0 0',  keySplines: EASE },
                  ...(stay > 0 ? [{ durationSeconds: stay, to: '0 0', keySplines: EASE }] : []),
                  { durationSeconds: nextSw,   to: exitTy, keySplines: EASE },
                  { durationSeconds: holdTime, to: exitTy, keySplines: EASE },
                ]
                const tyResult = compileTimeline(tySegs, v => v, enterTy)

                return (
                  <g key={i}>
                    {/* 外层 translate：控制图片的进入/退出位移 */}
                    <animateTransform attributeName="transform" type="translate"
                      values={tyResult.values} keyTimes={tyResult.keyTimes} keySplines={tyResult.keySplines}
                      dur={`${T}s`} calcMode="spline" repeatCount="indefinite"
                      begin={`${begin}s`} fill="freeze" />
                    <g>
                      {/* 可选变换：skew 和 rotate，不传时不渲染对应的 animateTransform */}
                      {renderSkewAnim(item.entrySkew, item.exitSkew, stay, sw, nextSw, holdTime, begin)}
                      {renderRotateAnim(item.entryRotation, item.exitRotation, stay, sw, nextSw, holdTime, begin)}
                      {renderContent(item)}
                    </g>
                  </g>
                )
              })}

              {renderGhostLayer()}
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnySkewPush
