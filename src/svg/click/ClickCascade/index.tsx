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

	/** 移出视野的距离：取宽高较大值的 100 倍 */
	const outOfView = defaultTo(max([W, H]), W) * 100

	/** keyTime: 淡入完成时刻占总时长的比例 */
	const holdKeyTime = fadeDur / (fadeDur + HOLD_DURATION)

	/**
	 * 递归渲染单个图层
	 * @param layer 当前图层配置
	 * @param isFirstLayer 是否为嵌套的第一层（紧贴 SVG background 的那层）
	 */
	const renderLayer = (layer: I_CascadeLayer, isFirstLayer: boolean): React.ReactNode => {
		const useItem = !isNil(layer.jsx)
		if (isNil(layer.url) && isNil(layer.jsx)) return null

		// 热区：默认全屏
		const hx = defaultTo(layer.hotArea?.x, 0)
		const hy = defaultTo(layer.hotArea?.y, 0)
		const hw = defaultTo(layer.hotArea?.w, W)
		const hh = defaultTo(layer.hotArea?.h, H)

		return (
			<g opacity={0}>
				{/* 点击后淡入 */}
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
				{/* 点击后 additive 平移，与子元素 translate(-outOfView) 抵消，内容回到原位 */}
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
				{/* 热区 rect：点击后 visibility hidden，把点击权交给下一层 */}
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
				{/* 内容：静态偏移到屏幕外，等 animateTransform 抵消回来 */}
				<g transform={`translate(-${outOfView} 0)`}>
					{useItem ? (
						layer.jsx
					) : (
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
					)}
					{/* 递归：下一层 */}
					{!isFirstLayer && renderLayer(layers[layers.indexOf(layer) + 1], false)}
				</g>
			</g>
		)
	}

	/**
	 * 构建递归嵌套层
	 * 第 1 张图 = SVG background，第 2 张开始递归
	 */
	const buildNestedLayers = (): React.ReactNode => {
		// 从第 2 层开始递归（第 1 层是 background）
		const remaining = layers.slice(1)
		if (remaining.length === 0) return null

		// 递归链：remaining[0] → remaining[1] → ... → 最后一层（无动画）
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

			// 最后一层：静态内容，无动画
			if (isLast) {
				return (
					<g transform={`translate(-${outOfView} 0)`}>
						{useItem ? (
							layer.jsx
						) : (
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
						)}
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
						{useItem ? (
							layer.jsx
						) : (
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
						)}
						{buildChain(index + 1)}
					</g>
				</g>
			)
		}

		return buildChain(0)
	}

	// 第 1 张图用 background-image 显示
	const firstBg = !isNil(first.jsx) ? undefined : svgURL(first.url!)

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
					{buildNestedLayers()}
				</SvgEx>
			</section>
		</SectionEx>
	)
}

export default ClickCascade
