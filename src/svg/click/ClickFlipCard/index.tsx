import React from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { getEaseBezier } from '@smil/bezier'
import {
	widthToggleAnims,
	outerScaleToggleAnims,
	flipScaleAnims,
	opacityToggleAnims,
	clickResetTranslateAnims,
	hiddenResetTranslateAnims,
} from './smil'
import { FaceContent } from './FaceContent'
import type { I_ClickFlipProps } from './types'

const DEFAULT_FLIP_DURATION = 1
const MIN_FLIP_DURATION = 0.3
const MAX_FLIP_DURATION = 1.5
/** mousedown/touchstart 翻转前的静止等待时间（秒） */
const HOLD_TIME = 0.2
const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })

/** interactive SVG 需要 max-width: none !important 以支持 width 200% 动画 */
const SVG_IMPORTANT: [string, string][] = [['max-width', 'none']]

const ClickFlipCard = (props: I_ClickFlipProps) => {
	const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
	const isDev = ExPubGoConfig().mode === 'development'

	const W = props.canvasSize.w
	const H = props.canvasSize.h
	const bgColor = defaultTo(props.canvasBg, '#FFFFFF')
	const rawFlipDur = defaultTo(props.flipDuration, DEFAULT_FLIP_DURATION)
	const flipDur = Math.max(MIN_FLIP_DURATION, Math.min(MAX_FLIP_DURATION, rawFlipDur))
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
					role="img"
					aria-label="插图"
					style={{ display: 'block', width: '100%', marginTop: '0px', backgroundColor: bgColor }}
				/>
			</section>

			{/* 交互翻转层 */}
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

										{/* 正面 */}
										<foreignObject x={0} y={0} width={W} height={H}>
											<FaceContent content={props.frontSide} width={W} height={H} />
										</foreignObject>

										{/* 点击交互层：translate ±10000 管理点击目标的可见性 */}
										<g>
											{clickResetTranslateAnims({ discreteDur })}

											{/* 主点击区域 */}
											<rect x={0} y={0} width={W} height={H} fill="#39f" opacity={0} style={{ pointerEvents: 'visible' }}>
												<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="mouseup" />
												<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="click" />
											</rect>

											{/* 隐藏的重置触发器 */}
											<g transform="translate(10000 0)">
												<g>
													{hiddenResetTranslateAnims({ pressFlipDur })}
													<rect x={0} y={0} width={W} height={H} fill="#000" opacity={0} style={{ pointerEvents: 'visible' }} />
												</g>
											</g>
										</g>
									</g>
								</g>
							</g>
						</g>
					</g>
				</SvgEx>

				{/* 180° 旋转重置触发层 */}
				<section style={{ height: 0, transform: 'rotate(180deg)' }}>
					<SvgEx
						viewBox={`0 0 ${W} ${H}`}
						role="img"
						aria-label="插图"
						style={{
							transform: 'rotate(180deg)',
							display: 'block',
							width: '100%',
							pointerEvents: 'none',
							userSelect: 'none',
						}}
					>
						<g opacity={0}>
							<rect x={0} y={0} width={W} height={H} fill="blue" style={{ pointerEvents: 'visible' }} />
							<animateTransform calcMode="discrete" attributeName="transform" type="translate" values="4000 0" dur="0.2s" begin="mousedown" />
							<animateTransform calcMode="discrete" attributeName="transform" type="translate" values="4000 0" dur="0.2s" begin="touchstart" />
						</g>
					</SvgEx>
				</section>
			</section>

			{/* 底部占位（维持 viewBox 高度） */}
			<SvgEx viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', pointerEvents: 'none', userSelect: 'none' }} />
		</SectionEx>
	)
}

export default ClickFlipCard
