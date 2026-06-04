import React from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import max from 'lodash/max'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { getEaseBezier } from '@smil/bezier'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import svgURL from '@utils/svg/svgURL'
import type { I_ClickCascadeProps, I_CascadeLayer } from './types'

const DEFAULT_FADE_DURATION = 0.8
const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })
/** 动画总时长足够长，确保淡入后保持 */
const HOLD_DURATION = 1000

const ClickCascade = (props: I_ClickCascadeProps) => {
	const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
	const isDev = ExPubGoConfig().mode === 'development'

	const W = props.canvasSize.w
	const H = props.canvasSize.h
	const bgColor = defaultTo(props.canvasBg, '#FFFFFF')
	const fadeDur = defaultTo(props.fadeDuration, DEFAULT_FADE_DURATION)
	const splines = defaultTo(props.keySplines, EASE_IN_OUT)
	const layers = props.layers

	if (!layers || layers.length < 2) {
		throw new Error('`layers` must contain at least 2 items.')
	}

	const first = layers[0]
	if (isNil(first.url) && isNil(first.jsx)) {
		throw new Error('The first layer must have either `url` or `jsx`.')
	}

	const firstIsJsx = !isNil(first.jsx)

	/** 移出视野的距离：取宽高较大值的 100 倍 */
	const outOfView = defaultTo(max([W, H]), W) * 100

	/** keyTime: 淡入完成时刻占总时长的比例 */
	const holdKeyTime = fadeDur / (fadeDur + HOLD_DURATION)

	/**
	 * 构建递归嵌套层
	 * 第 1 张图 = SVG background 或 foreignObject（JSX），第 2 张开始递归
	 */
	const buildNestedLayers = (): React.ReactNode => {
		const remaining = layers.slice(1)
		if (remaining.length === 0) return null

		const buildChain = (index: number): React.ReactNode => {
			if (index >= remaining.length) return null
			const layer = remaining[index]
			const useItem = !isNil(layer.jsx)
			if (isNil(layer.url) && isNil(layer.jsx)) return null

			const isLast = index === remaining.length - 1

			// 热区
			const hx = defaultTo(layer.hotArea?.x, 0)
			const hy = defaultTo(layer.hotArea?.y, 0)
			const hw = defaultTo(layer.hotArea?.w, W)
			const hh = defaultTo(layer.hotArea?.h, H)

			const renderContent = () => useItem
				? layer.jsx
				: (
					<foreignObject x={0} y={0} width={W} height={H}>
						<SvgEx
							viewBox={`0 0 ${W} ${H}`}
							style={{
								backgroundImage: svgURL(layer.url!),
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

			// 最后一层：静态内容，无动画
			if (isLast) {
				return (
					<g transform={`translate(-${outOfView} 0)`}>
						{renderContent()}
					</g>
				)
			}

			return (
				<g opacity={0}>
					{/* 淡入 */}
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
					{/* 平移抵消 */}
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
					{/* 热区 */}
					<rect
						x={hx} y={hy} width={hw} height={hh}
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
					{/* 内容 + 下一层递归 */}
					<g transform={`translate(-${outOfView} 0)`}>
						{renderContent()}
						{buildChain(index + 1)}
					</g>
				</g>
			)
		}

		return buildChain(0)
	}

	// 第 1 张图：URL → background-image；JSX → foreignObject 直接渲染
	const firstBg = firstIsJsx ? undefined : svgURL(first.url!)

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
						backgroundImage: firstBg,
						backgroundSize: '100% auto',
						backgroundRepeat: 'no-repeat',
						backgroundPosition: '50% 0',
						backgroundColor: bgColor,
						boxSizing: 'border-box',
						display: 'inline-block',
						pointerEvents: 'none',
						userSelect: 'none',
						verticalAlign: 'top',
						width: '100%',
					}}
				>
					{/* 第一层是 JSX 时，直接渲染内容（不用 background） */}
					{firstIsJsx && (
						<foreignObject x={0} y={0} width={W} height={H}>
							{first.jsx}
						</foreignObject>
					)}
					{buildNestedLayers()}
				</SvgEx>
			</section>
		</SectionEx>
	)
}

export default ClickCascade
