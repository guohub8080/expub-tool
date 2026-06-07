import React from 'react'
import defaultTo from 'lodash/defaultTo'
import clamp from 'lodash/clamp'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import type { I_ClickFlipOnceProps, I_FaceContent } from './types'

export type { I_ClickFlipOnceProps, I_FaceContent } from './types'

const DEFAULT_FLIP_DURATION = 1
const MIN_FLIP_DURATION = 0.3
const MAX_FLIP_DURATION = 3

// ──────────────────────────── 内容渲染 ────────────────────────────

/** 渲染卡牌单面内容（url 或 jsx） */
function FaceContent({ content, width, height }: {
  content: I_FaceContent
  width: number
  height: number
}) {
  if (content.jsx) return <>{content.jsx}</>
  if (!content.url) return null

  return (
    <SvgEx
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: 'block',
        width: '100%',
        margin: 0,
        backgroundImage: svgURL(content.url),
        backgroundSize: '100% 100%',
        backgroundPosition: '0px 0px',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}

// ──────────────────────────── 主组件 ────────────────────────────

/**
 * ClickFlipOnce — 点击翻转卡片（仅一次）
 *
 * 原理：
 *   1. 外层 translate(centerX, centerY) 将坐标原点移到画布中心
 *   2. animateTransform scale(1→-1, 1) 在点击后做水平翻转
 *   3. 内层 translate(-centerX, -centerY) 移回左上角
 *   4. 在翻转到一半时（scale X 过 0），瞬间切换：
 *      - 正面 opacity → 0
 *      - 反面通过 translate(0, 2*H) + 预置的 scale(-1,1) translate(-W, -2*H) 校正到正确位置
 *   5. restart="never" + 点击后隐藏热区 → 确保只能触发一次
 *
 * DOM 结构（对标 reference/无限点击翻转卡片/reference.html）：
 *
 *   <g transform="translate(cx, cy)">           ← 中心定位
 *     <g>                                        ← 翻转层
 *       <animateTransform scale 1→-1 click>      ← 翻转动画
 *       <g transform="translate(-cx, -cy)">      ← 回到左上角
 *         <g>                                    ← 反面
 *           <animateTransform translate click+半程> ← 位置校正
 *           <g transform="scale(-1,1) translate(-W,-2H)"> ← 预镜像
 *             <foreignObject> 反面内容
 *           </g>
 *         </g>
 *         <g>                                    ← 正面
 *           <animate opacity 1→0 click+半程>      ← 隐藏正面
 *           <foreignObject> 正面内容
 *           <rect>                               ← 点击热区
 *             <set visibility hidden click>       ← 点击后消失
 *           </rect>
 *         </g>
 *       </g>
 *     </g>
 *   </g>
 */
const ClickFlipOnce = (props: I_ClickFlipOnceProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  const W = props.canvasSize.w
  const H = props.canvasSize.h
  const cx = W / 2
  const cy = H / 2
  const rawDur = defaultTo(props.flipDuration, DEFAULT_FLIP_DURATION)
  const flipDur = clamp(rawDur, MIN_FLIP_DURATION, MAX_FLIP_DURATION)
  const halfDur = flipDur / 2
  const doubleH = H * 2

  const calcMode = props.keySplines ? 'spline' : 'linear'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'click-flip-once' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        textAlign: 'center',
        lineHeight: 0,
        ...spacingResult,
      }}
    >
      <section style={{ overflow: 'hidden', lineHeight: 0, margin: 0 }}>
        <SvgEx
          viewBox={`0 0 ${W} ${H}`}
          style={{
            display: 'block',
            margin: '0 auto',
            backgroundColor: props.canvasBg,
            pointerEvents: 'none',
          }}
          width="100%"
        >
          {/* 坐标原点移到画布中心（scale 围绕中心翻转） */}
          <g transform={`translate(${cx} ${cy})`}>
            <g>
              {/* 翻转动画：scale X 从 1 到 -1 */}
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1; -1 1"
                keyTimes="0; 1"
                dur={`${flipDur}s`}
                begin="click"
                fill="freeze"
                restart="never"
                calcMode={calcMode}
                {...(props.keySplines ? { keySplines: props.keySplines } : {})}
              />

              <g transform={`translate(${-cx} ${-cy})`}>
                {/* ── 反面 ── */}
                <g>
                  {/* 翻转到一半时，将反面移到正确位置 */}
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`0 ${doubleH}`}
                    begin={`click+${halfDur}s`}
                    calcMode="discrete"
                    dur="1ms"
                    fill="freeze"
                    restart="never"
                  />
                  {/* 预镜像：双重镜像 = 正常显示 */}
                  <g transform={`scale(-1,1) translate(${-W} ${-doubleH})`}>
                    <foreignObject x={0} y={0} width={W} height={H}>
                      <FaceContent content={props.backSide} width={W} height={H} />
                    </foreignObject>
                  </g>
                </g>

                {/* ── 正面 ── */}
                <g>
                  {/* 翻转到一半时隐藏正面 */}
                  <animate
                    attributeName="opacity"
                    values="1; 0"
                    begin={`click+${halfDur}s`}
                    calcMode="discrete"
                    dur="1ms"
                    fill="freeze"
                  />
                  <foreignObject x={0} y={0} width={W} height={H}>
                    <FaceContent content={props.frontSide} width={W} height={H} />
                  </foreignObject>
                  {/* 点击热区：点击后立即消失，防止重复触发 */}
                  <rect
                    x={0} y={0} width={W} height={H}
                    fill="#000" opacity={0}
                    style={{ pointerEvents: 'visible' }}
                  >
                    <set
                      attributeName="visibility"
                      from="visible"
                      to="hidden"
                      begin="click"
                    />
                  </rect>
                </g>
              </g>
            </g>
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ClickFlipOnce
