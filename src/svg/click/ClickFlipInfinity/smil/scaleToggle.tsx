import React from 'react'

/**
 * Outer scale discrete toggle for click-flip state machine
 *
 * Press (mousedown/touchstart): 0.5 → 1
 * Move (touchmove): 0.5 (no change)
 * Release (mouseup/click): 1 → 0.5
 */
export function outerScaleToggleAnims({ discreteDur }: { discreteDur: number }) {
	const dur = `${discreteDur}s`
	return (
		<>
			<animateTransform calcMode="discrete" attributeName="transform" type="scale"
				values="0.5;0.5;1;1" dur={dur}
				keyTimes="0;0.6;0.6;1" fill="freeze" begin="mousedown" />
			<animateTransform calcMode="discrete" attributeName="transform" type="scale"
				values="0.5;0.5;1;1" dur={dur}
				keyTimes="0;0.6;0.6;1" fill="freeze" begin="touchstart" />
			<animateTransform calcMode="discrete" attributeName="transform" type="scale"
				values="0.5;0.5;0.5;0.5" dur={dur}
				keyTimes="0;0.6;0.6;1" fill="freeze" begin="touchmove" />
			<animateTransform calcMode="discrete" attributeName="transform" type="scale"
				values="1;1;0.5;0.5" dur={dur}
				keyTimes="0;0.5;0.5;1" fill="freeze" begin="mouseup" />
			<animateTransform calcMode="discrete" attributeName="transform" type="scale"
				values="1;1;0.5;0.5" dur={dur}
				keyTimes="0;0.5;0.5;1" fill="freeze" begin="click" />
		</>
	)
}
