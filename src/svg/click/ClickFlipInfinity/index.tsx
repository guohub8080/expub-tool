import React from 'react'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import clamp from 'lodash/clamp'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { getEaseBezier } from '@smil/bezier'
import {
	widthToggleAnims,
	outerScaleToggleAnims,
	flipScaleAnims,
	opacityToggleAnims,
} from './smil'
import { FaceContent } from './components/FaceContent'
import { ClickInteractionLayer } from './components/ClickInteractionLayer'
import { ResetTriggerLayer } from './components/ResetTriggerLayer'
import type { I_ClickFlipInfinityProps } from './types'

const DEFAULT_FLIP_DURATION = 1
const MIN_FLIP_DURATION = 0.3
const MAX_FLIP_DURATION = 1.5
/** mousedown/touchstart 翻转前的静止等待时间（秒） */
const HOLD_TIME = 0.2
const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })

/** interactive SVG 需要 max-width: none !important 以支持 width 200% 动画 */
const SVG_IMPORTANT: [string, string][] = [['max-width', 'none']]

const ClickFlipInfinity = (props: I_ClickFlipInfinityProps) => {
	const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
	const isDev = ExPubGoConfig().mode === 'development'

	const W = props.canvasSize.w
	const H = props.canvasSize.h
	// canvasBg resolved via resolveCanvasBg
	const rawFlipDur = defaultTo(props.flipDuration, DEFAULT_FLIP_DURATION)
	const flipDur = clamp(rawFlipDur, MIN_FLIP_DURATION, MAX_FLIP_DURATION)
	const pressFlipDur = flipDur + HOLD_TIME
	const discreteDur = flipDur * 2
	const halfW = W / 2

	return (
		<SectionEx
			{...(isDev ? { 'expubgo-label': 'click-flip-card' } : {})}
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
			{/* 背景层（静态底色） */}
			<section style={{ height: 0 }}>
				<SvgEx
					viewBox={`0 0 ${W} ${H}`}
					style={{ display: 'block', width: '100%', marginTop: '0px', ...resolveCanvasBg(props.canvasBg) }}
				/>
			</section>

			{/* 交互翻转层 */}
			<section style={{ height: 0 }}>
				<SvgEx
					viewBox={`0 0 ${W} ${H}`}
					style={{
						display: 'block',
						width: '100%',
						pointerEvents: 'none',
						userSelect: 'none',
					}}
					important={SVG_IMPORTANT}
				>
					{widthToggleAnims({ discreteDur })}

					<g>
						{outerScaleToggleAnims({ discreteDur })}

						{/* 翻转轴心：translate(中心) → scale(-1,1) → translate(-中心) */}
						<g transform={`translate(${halfW} 0)`}>
							<g>
								{flipScaleAnims({ flipDur, pressFlipDur, keySplines: EASE_IN_OUT })}

								<g transform={`translate(${-halfW} 0)`}>
									{/* 反面（预先 scale(-1,1) 镜像，翻转后双重镜像=正常） */}
									<g transform={`translate(${W} 0) scale(-1 1)`}>
										<foreignObject x={0} y={0} width={W} height={H}>
											<FaceContent content={props.backSide} width={W} height={H} />
										</foreignObject>
									</g>

									{/* 正面组 */}
									<g>
										{opacityToggleAnims({ flipDur })}

										<foreignObject x={0} y={0} width={W} height={H}>
											<FaceContent content={props.frontSide} width={W} height={H} />
										</foreignObject>

										<ClickInteractionLayer
													W={W} H={H} discreteDur={discreteDur} pressFlipDur={pressFlipDur}
													frontHotArea={props.frontSide.hotArea}
													backHotArea={props.backSide.hotArea}
												/>
									</g>
								</g>
							</g>
						</g>
					</g>
				</SvgEx>

				<ResetTriggerLayer W={W} H={H} hotArea={props.backSide.hotArea} />
			</section>

			{/* 底部占位（维持 viewBox 高度） */}
			<SvgEx viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', pointerEvents: 'none', userSelect: 'none' }} />
		</SectionEx>
	)
}

export default ClickFlipInfinity
