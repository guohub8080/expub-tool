import React from 'react'
import defaultTo from 'lodash/defaultTo'
import clamp from 'lodash/clamp'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import { getEaseBezier } from '@smil/bezier'
import type { I_ClickFlipOnceProps, I_FaceContent } from './types'

export type { I_ClickFlipOnceProps, I_FaceContent } from './types'

const DEFAULT_FLIP_DURATION = 1
const MIN_FLIP_DURATION = 0.3
const MAX_FLIP_DURATION = 3
const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })

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
 * 从 ClickFlipCard 简化而来：去掉按压状态机，只保留 click → flip 一次。
 *
 * DOM 结构：
 *
 *   <svg viewBox="0 0 W H">
 *     <g transform="translate(halfW, 0)">        ← 翻转轴心：水平中心
 *       <g>
 *         <animateTransform scale 1→-1 click>     ← 翻转动画（spline 缓动）
 *         <g transform="translate(-halfW, 0)">
 *           <g transform="translate(W, 0) scale(-1, 1)">  ← 反面（预镜像，翻转后双重镜像=正常）
 *             <foreignObject> 反面内容
 *           </g>
 *           <g>                                             ← 正面
 *             <animate opacity 1→0 click>                    ← 翻转过半后正面消失
 *             <foreignObject> 正面内容
 *             <rect>                                        ← 点击热区
 *               <set visibility hidden click>                ← 点击后热区消失
 *             </rect>
 *           </g>
 *         </g>
 *       </g>
 *     </g>
 *   </svg>
 */
const ClickFlipOnce = (props: I_ClickFlipOnceProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  const W = props.canvasSize.w
  const H = props.canvasSize.h
  const halfW = W / 2
  const rawDur = defaultTo(props.flipDuration, DEFAULT_FLIP_DURATION)
  const flipDur = clamp(rawDur, MIN_FLIP_DURATION, MAX_FLIP_DURATION)
  const dur = `${flipDur}s`

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
      <section style={{ height: 0 }}>
        <SvgEx
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="插图"
          style={{ display: 'block', width: '100%', marginTop: '0px', backgroundColor: props.canvasBg }}
        />
      </section>

      <section style={{ height: 0 }}>
        <SvgEx
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="插图"
          style={{
            display: 'block',
            width: '100%',
            marginTop: '-1px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* 翻转轴心：translate(水平中心) → scale → translate(-水平中心) */}
          <g transform={`translate(${halfW} 0)`}>
            <g>
              {/* 翻转动画：scale X 从 1 到 -1，spline 缓动 */}
              <animateTransform
                calcMode="spline"
                attributeName="transform"
                type="scale"
                values="1 1;-1 1"
                dur={dur}
                keyTimes="0;1"
                keySplines={EASE_IN_OUT}
                fill="freeze"
                begin="click"
                restart="never"
              />

              <g transform={`translate(${-halfW} 0)`}>
                {/* 反面：预先 scale(-1,1) 镜像，翻转后双重镜像=正常显示 */}
                <g transform={`translate(${W} 0) scale(-1 1)`}>
                  <foreignObject x={0} y={0} width={W} height={H}>
                    <FaceContent content={props.backSide} width={W} height={H} />
                  </foreignObject>
                </g>

                {/* 正面 */}
                <g>
                  {/* 翻转过半后正面消失（keyTimes 0.5 处离散切换） */}
                  <animate
                    calcMode="linear"
                    attributeName="opacity"
                    values="1;1;0;0"
                    dur={dur}
                    keyTimes="0;0.5;0.5;1"
                    fill="freeze"
                    begin="click"
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

      {/* 底部占位（维持 viewBox 高度） */}
      <SvgEx
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', width: '100%', pointerEvents: 'none', userSelect: 'none' }}
      />
    </SectionEx>
  )
}

export default ClickFlipOnce
