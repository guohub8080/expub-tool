import React from 'react'

/**
 * Front face opacity toggle for click-flip state machine
 *
 * Press (mousedown/touchstart): 0 → 1 (front appears)
 * Move (touchmove): 0 (stays hidden)
 * Release (mouseup/click): 1 → 0 (front disappears)
 */
export function opacityToggleAnims({ flipDur }: { flipDur: number }) {
	const dur = `${flipDur}s`
	return (
		<>
			<animate calcMode="linear" attributeName="opacity"
				values="0;0;1;1" dur={dur}
				keyTimes="0;0.7;0.7;1" fill="freeze" begin="mousedown" />
			<animate calcMode="linear" attributeName="opacity"
				values="0;0;1;1" dur={dur}
				keyTimes="0;0.7;0.7;1" fill="freeze" begin="touchstart" />
			<animate calcMode="linear" attributeName="opacity"
				values="0;0;0;0" dur={dur}
				keyTimes="0;0.7;0.7;1" fill="freeze" begin="touchmove" />
			<animate calcMode="linear" attributeName="opacity"
				values="1;1;0;0" dur={dur}
				keyTimes="0;0.5;0.5;1" fill="freeze" begin="mouseup" />
			<animate calcMode="linear" attributeName="opacity"
				values="1;1;0;0" dur={dur}
				keyTimes="0;0.5;0.5;1" fill="freeze" begin="click" />
		</>
	)
}
