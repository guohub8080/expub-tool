import React from 'react'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import clamp from 'lodash/clamp'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { popupBounceAnims, popupOpacityAnims } from './smil'
import { FaceContent } from '../ClickFlipInfinity/components/FaceContent'
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
	// canvasBg resolved via resolveCanvasBg
	const rawDur = defaultTo(props.bounceDuration, DEFAULT_BOUNCE_DURATION)
	const bounceDur = clamp(rawDur, MIN_BOUNCE_DURATION, MAX_BOUNCE_DURATION)
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
					style={{ display: 'block', width: '100%', marginTop: '0px', ...resolveCanvasBg(props.canvasBg) }}
				/>
			</section>

			{/* 交互层 */}
			<section style={{ height: 0 }}>
				<SvgEx
					viewBox={`0 0 ${W} ${H}`}
					style={{
						display: 'block',
						width: '100%',
						marginTop: '-1px',
						pointerEvents: 'none',
						userSelect: 'none',
					}}
				>
					{/* 共用交互组：热区与弹窗动画在同一 DOM 子树内，确保事件冒泡可达 */}
					<g>
						{/* 底层背景内容 */}
						<g>
							<foreignObject x={0} y={0} width={W} height={H}>
								<FaceContent content={props.cover} width={W} height={H} />
							</foreignObject>
						</g>

						{/* 弹窗层：opacity=0 隐藏，mouseup/click 的 <set> 覆盖为 1 */}
						<g opacity={0}>
							{popupOpacityAnims()}

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
						</g>

						{/* 点击触发区域：在共用 <g> 内，事件冒泡路径经过弹窗动画 */}
						<g>
							<rect x={0} y={0} width={W} height={halfH} fill="#000" opacity={0}
								style={{ pointerEvents: 'all' }}>
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="mousedown" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="mouseup" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="click" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="touchstart" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="touchmove" />
							</rect>
						</g>
						<g>
							<rect x={0} y={halfH} width={W} height={halfH} fill="#000" opacity={0}
								style={{ pointerEvents: 'all' }}>
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="mousedown" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="mouseup" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="click" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="touchstart" />
								<animate attributeName="x" dur="1s" fill="remove" restart="always" values="-88888888" begin="touchmove" />
							</rect>
						</g>
					</g>
				</SvgEx>
			</section>

			{/* 底部占位 */}
			<SvgEx viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', pointerEvents: 'none', userSelect: 'none' }} />
		</SectionEx>
	)
}

export default ClickPopup
