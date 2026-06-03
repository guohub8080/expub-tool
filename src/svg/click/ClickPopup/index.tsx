import React from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { popupBounceAnims, popupOpacityAnims } from './smil'
import { FaceContent } from '../ClickFlipCard/FaceContent'
import type { I_ClickPopupProps } from './types'

const DEFAULT_BOUNCE_DURATION = 0.6
const MIN_BOUNCE_DURATION = 0.3
const MAX_BOUNCE_DURATION = 1.5
const HOLD_RATIO = 0.5

const ClickPopup = (props: I_ClickPopupProps) => {
	const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
	const isDev = ExPubGoConfig().mode === 'development'

	const W = props.canvasSize.w
	const H = props.canvasSize.h
	const bgColor = defaultTo(props.canvasBg, '#FFFFFF')
	const rawDur = defaultTo(props.bounceDuration, DEFAULT_BOUNCE_DURATION)
	const bounceDur = Math.max(MIN_BOUNCE_DURATION, Math.min(MAX_BOUNCE_DURATION, rawDur))
	const holdRatio = HOLD_RATIO
	const halfW = W / 2
	const halfH = H / 2

	return (
		<SectionEx
			{...(isDev ? { 'expubgo-label': 'click-popup' } : {})}
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

			{/* 交互层 */}
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
					{/* 底层背景内容 */}
					<g>
						<foreignObject x={0} y={0} width={W} height={H}>
							<FaceContent content={props.cover} width={W} height={H} />
						</foreignObject>
					</g>

					{/*
						弹窗组：opacity + scale 动画 + click target 全在此组内
						click target 用 pointer-events:all 确保父级 opacity=0 时仍可点击
						事件从 click target 冒泡到本组 → 触发内部所有 begin="mousedown/mouseup"
					*/}
					<g opacity={0}>
						{popupOpacityAnims()}

						{/* 弹窗缩放中心 */}
						<g transform={`translate(${halfW} ${halfH})`}>
							<g>
								{popupBounceAnims({ bounceDur, holdRatio })}
								<g transform={`translate(${-halfW} ${-halfH})`}>
									<foreignObject x={0} y={0} width={W} height={H}>
										<FaceContent content={props.popup} width={W} height={H} />
									</foreignObject>
								</g>
							</g>
						</g>

						{/* 点击触发区域：在 scale 结构之外，始终可点击 */}
						<rect x={0} y={0} width={W} height={H} fill="transparent" opacity={0}
							style={{ pointerEvents: 'all' }} />
					</g>
				</SvgEx>
			</section>

			{/* 底部占位 */}
			<SvgEx viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', pointerEvents: 'none', userSelect: 'none' }} />
		</SectionEx>
	)
}

export default ClickPopup
