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
        display: 'inline-block',
        width: '100%',
        margin: 0,
        background: `${svgURL(content.url)} 0 0/100% 100% no-repeat`,
        boxSizing: 'border-box',
        outline: 'none',
        userSelect: 'none',
        verticalAlign: 'top',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  )
}

/**
 * ClickFlipOnce — 点击翻转卡片（仅一次）
 *
 * 严格对标 reference/无限点击翻转卡片/reference.html
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
          <g transform={`translate(${cx} ${cy})`}>
            <g>
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
                  <g transform={`scale(-1,1) translate(${-W} ${-doubleH})`}>
                    <foreignObject x="0" y="0" width={W} height={H}>
                      <FaceContent content={props.backSide} width={W} height={H} />
                    </foreignObject>
                  </g>
                </g>

                {/* ── 正面 ── */}
                <g>
                  <animate
                    attributeName="opacity"
                    values="1; 0"
                    begin={`click+${halfDur}s`}
                    calcMode="discrete"
                    dur="1ms"
                    fill="freeze"
                  />
                  <foreignObject x="0" y="0" width={W} height={H}>
                    <FaceContent content={props.frontSide} width={W} height={H} />
                  </foreignObject>
                  <rect
                    width={W}
                    height={H}
                    opacity="0"
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
