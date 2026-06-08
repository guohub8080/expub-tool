import React from 'react'
import defaultTo from 'lodash/defaultTo'
import SvgEx from '@html/basicEx/SvgEx'
import type { T_HotArea } from '@svg/types'

/**
 * 180° 旋转重置触发层
 *
 * 独立的 SVG section，整体 rotate(180deg) 遮挡。
 * mousedown/touchstart 时通过 translate(4000) 移入视图，
 * 用于在反面状态下触发翻回。
 */
export function ResetTriggerLayer({ W, H, hotArea }: {
	W: number
	H: number
	hotArea?: T_HotArea
}) {
	// 180° 旋转后 x/y 都镜像
	const rX = W - defaultTo(hotArea?.x, 0) - defaultTo(hotArea?.w, W)
	const rY = H - defaultTo(hotArea?.y, 0) - defaultTo(hotArea?.h, H)
	const rW = defaultTo(hotArea?.w, W)
	const rH = defaultTo(hotArea?.h, H)

	return (
		<section style={{ height: 0, transform: 'rotate(180deg)' }}>
			<SvgEx
				viewBox={`0 0 ${W} ${H}`}
				style={{
					transform: 'rotate(180deg)',
					display: 'block',
					width: '100%',
					pointerEvents: 'none',
					userSelect: 'none',
				}}
			>
				<g opacity={0}>
					<rect x={rX} y={rY} width={rW} height={rH} fill="blue" style={{ pointerEvents: 'visible' }} />
					<animateTransform calcMode="discrete" attributeName="transform" type="translate" values="4000 0" dur="0.2s" begin="mousedown" />
					<animateTransform calcMode="discrete" attributeName="transform" type="translate" values="4000 0" dur="0.2s" begin="touchstart" />
				</g>
			</SvgEx>
		</section>
	)
}
