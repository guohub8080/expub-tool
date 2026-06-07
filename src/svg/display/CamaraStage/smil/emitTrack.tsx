import React from 'react'
import SvgEx from '@html/basicEx/SvgEx'
import svgURL from '@utils/svg/svgURL'
import type { CanonicalTrack } from '../types'

/**
 * emitObjectGroup — 将 CanonicalTrack 编译为 SVG <g> + SMIL 动画
 *
 * DOM 结构（每个 animateTransform 独占一层 <g>，避免覆盖）：
 *
 *   <g>                              ← translate 层（屏幕位置）
 *     <animateTransform type="translate" />
 *     <g>                            ← scale 层（深度缩放）
 *       <animateTransform type="scale" />
 *       <g>                          ← opacity 层
 *         <animate attributeName="opacity" />
 *         <g transform="translate(-w/2,-h/2)">  ← 内容居中于原点
 *           <foreignObject>
 *             <SvgEx backgroundImage />
 *           </foreignObject>
 *         </g>
 *       </g>
 *     </g>
 *   </g>
 */
export function emitObjectGroup(track: CanonicalTrack, totalDuration: number): React.ReactNode {
  const { frames, size, asset } = track

  if (frames.length < 2) return null

  const keyTimes = frames.map(f => f.t.toFixed(6)).join(';')
  const translateValues = frames.map(f => `${f.tx.toFixed(2)} ${f.ty.toFixed(2)}`).join(';')
  const scaleValues = frames.map(f => `${f.scale.toFixed(4)} ${f.scale.toFixed(4)}`).join(';')
  const opacityValues = frames.map(f => f.opacity.toFixed(3)).join(';')

  const dur = `${totalDuration}s`
  const { w, h } = size

  return (
    <g key={track.id}>
      {/* translate 层：屏幕空间位移 */}
      <animateTransform
        attributeName="transform"
        type="translate"
        values={translateValues}
        keyTimes={keyTimes}
        dur={dur}
        calcMode="linear"
        begin="0s"
        fill="freeze"
      />
      <g>
        {/* scale 层：深度缩放（内容居中于原点，直接 scale） */}
        <animateTransform
          attributeName="transform"
          type="scale"
          values={scaleValues}
          keyTimes={keyTimes}
          dur={dur}
          calcMode="linear"
          begin="0s"
          fill="freeze"
        />
        <g>
          {/* opacity 层 */}
          <animate
            attributeName="opacity"
            values={opacityValues}
            keyTimes={keyTimes}
            dur={dur}
            calcMode="linear"
            begin="0s"
            fill="freeze"
          />
          {/* 内容居中于原点，使 scale 以内容中心为锚点 */}
          <g transform={`translate(${-w / 2}, ${-h / 2})`}>
            <foreignObject x={0} y={0} width={w + 1} height={h + 1}>
              <SvgEx
                viewBox={`0 0 ${w + 1} ${h + 1}`}
                style={{
                  backgroundImage: svgURL(asset),
                  backgroundSize: 'cover',
                  backgroundPosition: '50% 50%',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  display: 'block',
                  boxSizing: 'border-box',
                }}
              />
            </foreignObject>
          </g>
        </g>
      </g>
    </g>
  )
}
