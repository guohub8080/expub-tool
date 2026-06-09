import React from 'react'
import { transformTranslate, transformSkewX, transformSkewY } from '@smil/index'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import { isDefined } from '@utils/fn/isDefined'
import { buildPhaseSegments } from './buildTimeline'
import type { I_ItemTimeline } from './buildTimeline'

interface I_SkewSlideItemProps {
  url?: string
  jsx?: React.ReactNode
  timeline: I_ItemTimeline
  contentW: number
  contentH: number
  faceW: number
  faceH: number
  axis: 'X' | 'Y'
  entryAngle: number
  exitAngle: number
  signedCrossComp: number
  originX: number
  originY: number
}

const SkewSlideItem = (props: I_SkewSlideItemProps) => {
  const {
    url, jsx, timeline,
    contentW, contentH, faceW, faceH,
    axis, entryAngle, exitAngle, signedCrossComp,
    originX, originY,
  } = props

  const { begin, entryDuration, stayDuration, exitDuration, holdDuration } = timeline

  // ── 离屏位置（translate 距离严格等于 faceW/faceH，保证 cube 面无缝衔接） ──
  const entryTranslate = axis === 'X'
    ? { x: faceW, y: signedCrossComp }
    : { x: signedCrossComp, y: faceH }
  const exitTranslate = axis === 'X'
    ? { x: -faceW, y: signedCrossComp }
    : { x: signedCrossComp, y: -faceH }
  const center = { x: 0, y: 0 }

  // ── 构建 timeline segments ──
  const translateTimeline = buildPhaseSegments({
    entryDur: entryDuration, stayDur: stayDuration, exitDur: exitDuration, holdDur: holdDuration,
    entryTarget: center, stayTarget: center, exitTarget: exitTranslate, holdTarget: exitTranslate,
  })

  const skewTimeline = buildPhaseSegments({
    entryDur: entryDuration, stayDur: stayDuration, exitDur: exitDuration, holdDur: holdDuration,
    entryTarget: 0, stayTarget: 0, exitTarget: exitAngle, holdTarget: exitAngle,
  })

  // ── 内容偏移（相对于 skew origin） ──
  const contentOffsetX = -contentW / 2
  const contentOffsetY = axis === 'X' ? -contentH : 0

  // ── skew 动画配置 ──
  const skewAnimConfig = {
    initValue: entryAngle,
    timeline: skewTimeline,
    begin: `${begin}s`,
    loopCount: 0 as const,
    isFreeze: true,
    isAdditive: false,
  }

  // ── 内容渲染 ──
  const content = isDefined(jsx)
    ? jsx
    : <SvgEx viewBox={`0 0 ${contentW + 1} ${contentH + 1}`}
        style={{
          backgroundImage: svgURL(url!), backgroundSize: "cover",
          backgroundPosition: "50% 50%", backgroundRepeat: "no-repeat",
          width: "100%", display: "block", boxSizing: "border-box",
        }} />

  return (
    <g>
      {/* 外层 translate：控制进入/退出位移 */}
      {transformTranslate({
        initValue: entryTranslate,
        timeline: translateTimeline,
        begin: `${begin}s`,
        loopCount: 0,
        isFreeze: true,
        isAdditive: false,
      })}
      <g>
        {/* skew origin 偏移 */}
        <g transform={`translate(${originX}, ${originY})`}>
          <g>
            {axis === 'Y'
              ? transformSkewX(skewAnimConfig)
              : transformSkewY(skewAnimConfig)}
            <g transform={`translate(${contentOffsetX}, ${contentOffsetY})`}>
              <foreignObject x={0} y={0} width={contentW + 1} height={contentH + 1}>
                {content}
              </foreignObject>
            </g>
          </g>
        </g>
      </g>
    </g>
  )
}

export default SkewSlideItem
