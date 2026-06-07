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

/**
 * ClickFlipOnce — 点击翻转卡片（仅一次）
 *
 * DOM 结构（严格对标 reference/reference.html）：
 *
 *   <g transform="translate(cx, cy)">       ← 中心定位（scale 围绕中心翻转）
 *     <g>                                    ← 翻转层
 *       <animateTransform scale 1→-1 click>  ← 翻转动画
 *       <g transform="translate(-cx, -cy)">  ← 回到左上角
 *         <g>                                ← 公共包装层（click 冒泡路径上的祖先）
 *           <animateTransform translate click+半程> ← 反面位置校正
 *           <g transform="scale(-1,1) translate(-W,-2H)"> ← 反面预镜像
 *             <foreignObject> 反面
 *           </g>
 *         </g>                               ← 反面组结束
 *         <g>                                ← 正面组
 *           <animate opacity 1→0 click+半程>  ← 正面消失
 *           <foreignObject> 正面
 *           <rect>                           ← 点击热区
 *             <set visibility hidden click>   ← 点击后消失
 *           </rect>
 *         </g>
 *       </g>
 *     </g>
 *   </g>
 *
 * 关键：反面 translate 动画放在公共祖先上（click 冒泡路径内），
 * 而不是反面自身的 <g>（不在冒泡路径内）。
 * 正面 opacity→0 后 translate 对正面无视觉影响。
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

                {/* ── 反面组 ── */}
                {/* translate 动画挂在此 <g>（公共祖先，click 冒泡路径内） */}
                <g>
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
                  {/* 预镜像：父 scale(-1,1) × 此 scale(-1,1) = 正常显示 */}
                  <g transform={`scale(-1,1) translate(${-W} ${-doubleH})`}>
                    <foreignObject x={0} y={0} width={W} height={H}>
                      <FaceContent content={props.backSide} width={W} height={H} />
                    </foreignObject>
                  </g>
                </g>

                {/* ── 正面组 ── */}
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
