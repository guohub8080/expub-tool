import React from 'react'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { isDefined } from '@utils/fn/isDefined'
import max from 'lodash/max'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { getEaseBezier } from '@smil/bezier'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import svgURL from '@utils/svg/svgURL'
import type { I_ClickCascadeProps, I_CascadeChildItem } from './types'

const DEFAULT_FADE_DURATION = 0.8
const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })
/** 动画总时长足够长，确保淡入后保持 */
const HOLD_DURATION = 1000

const ClickCascade = (props: I_ClickCascadeProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  const W = props.canvasSize.w
  const H = props.canvasSize.h
  // canvasBg resolved via resolveCanvasBg
  const childItems = props.childItems

  if (isNil(childItems) || childItems.length < 2) {
    throw new Error('`childItems` must contain at least 2 items.')
  }

  /** 移出视野的距离：取宽高较大值的 100 倍 */
  const outOfView = defaultTo(max([W, H]), W) * 100

  /** 渲染单个 item 的内容 */
  const renderContent = (item: I_CascadeChildItem) => {
    if (isDefined(item.jsx)) return item.jsx
    if (isNil(item.url)) return null
    return (
      <foreignObject x={0} y={0} width={W} height={H}>
        <SvgEx
          viewBox={`0 0 ${W} ${H}`}
          style={{
            backgroundImage: svgURL(item.url),
            backgroundSize: '100% auto',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '50% 0',
            display: 'inline-block',
            pointerEvents: 'none',
            userSelect: 'none',
            verticalAlign: 'top',
            width: '100%',
          }}
        />
      </foreignObject>
    )
  }

  /** 构建单层的淡入动画 + 热区 */
  const renderFadeIn = (item: I_CascadeChildItem) => {
    const fadeDur = defaultTo(item.fadeDuration, DEFAULT_FADE_DURATION)
    const splines = defaultTo(item.keySplines, EASE_IN_OUT)
    const holdKeyTime = fadeDur / (fadeDur + HOLD_DURATION)

    const hotAreaX = defaultTo(item.hotArea?.x, 0)
    const hotAreaY = defaultTo(item.hotArea?.y, 0)
    const hotAreaWidth = defaultTo(item.hotArea?.w, W)
    const hotAreaHeight = defaultTo(item.hotArea?.h, H)

    return (
      <>
        <animate
          attributeName="opacity"
          begin="click+0s"
          calcMode="spline"
          dur={`${fadeDur + HOLD_DURATION}s`}
          fill="freeze"
          keySplines={`${splines}; ${splines}`}
          keyTimes={`0; ${holdKeyTime.toFixed(6)}; 1`}
          restart="never"
          values="0; 1; 1"
        />
        <animateTransform
          additive="sum"
          attributeName="transform"
          begin="click"
          dur={`${fadeDur + HOLD_DURATION}s`}
          fill="freeze"
          restart="never"
          type="translate"
          values={`${outOfView} 0`}
        />
        <rect
          x={hotAreaX} y={hotAreaY} width={hotAreaWidth} height={hotAreaHeight}
          opacity={0} fill="transparent"
          style={{ pointerEvents: 'visible' }}
        >
          <set
            attributeName="visibility"
            from="visible"
            to="hidden"
            begin="click+0s"
            dur="1ms"
            fill="freeze"
            restart="never"
          />
        </rect>
      </>
    )
  }

  /**
   * 递归构建所有层
   * - 第 1 层：无动画，直接渲染
   * - 其余层（含最后一层）：opacity=0 + 淡入动画 + 热区
   */
  const buildChain = (index: number): React.ReactNode => {
    if (index >= childItems.length) return null
    const item = childItems[index]
    if (isNil(item.url) && isNil(item.jsx)) return null

    const isFirst = index === 0

    // 第一层：无动画，直接渲染
    if (isFirst) {
      return (
        <>
          {renderContent(item)}
          {buildChain(index + 1)}
        </>
      )
    }

    // 其余层：淡入 + 热区
    return (
      <g opacity={0}>
        {renderFadeIn(item)}
        <g transform={`translate(-${outOfView} 0)`}>
          {renderContent(item)}
          {buildChain(index + 1)}
        </g>
      </g>
    )
  }

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'click-cascade' } : {})}
      style={{
        boxSizing: 'border-box',
        display: 'block',
        overflow: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
        width: '100%',
        ...spacingResult,
      }}
    >
      <section style={{ fontSize: 0, lineHeight: 0, margin: 0, padding: 0, pointerEvents: 'none' }}>
        <SvgEx
          viewBox={`0 0 ${W} ${H}`}
          style={{
            ...resolveCanvasBg(props.canvasBg),
            boxSizing: 'border-box',
            display: 'inline-block',
            pointerEvents: 'none',
            userSelect: 'none',
            verticalAlign: 'top',
            width: '100%',
          }}
        >
          {buildChain(0)}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ClickCascade
