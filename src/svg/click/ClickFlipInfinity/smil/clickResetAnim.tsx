import React from 'react'

/**
 * Click reset layer translate animations for click-flip state machine
 *
 * Press (mousedown/touchstart): -10000 → 0 (click target moves into view)
 * Move (touchmove): -10000 (stays off-screen)
 * Release (mouseup/click): 0 → -10000 (click target moves off-screen)
 */
export function clickResetTranslateAnims({ discreteDur }: { discreteDur: number }) {
	const dur = `${discreteDur}s`
	return (
		<>
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="-10000 0;-10000 0;0 0;0 0" dur={dur}
				keyTimes="0;0.6;0.6;1" fill="freeze" begin="mousedown" />
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="-10000 0;-10000 0;0 0;0 0" dur={dur}
				keyTimes="0;0.6;0.6;1" fill="freeze" begin="touchstart" />
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="-10000 0;-10000 0;-10000 0;-10000 0" dur={dur}
				keyTimes="0;0.6;0.6;1" fill="freeze" begin="touchmove" />
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="0 0;0 0;-10000 0;-10000 0" dur={dur}
				keyTimes="0;0.5;0.5;1" fill="freeze" begin="mouseup" />
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="0 0;0 0;-10000 0;-10000 0" dur={dur}
				keyTimes="0;0.5;0.5;1" fill="freeze" begin="click" />
		</>
	)
}

/**
 * Hidden reset trigger translate animations (the rect at translate(10000,0))
 *
 * Press (mousedown/touchstart): stays at 10000 (off-screen)
 * Move (touchmove): moves to 0 (into view)
 */
export function hiddenResetTranslateAnims({ pressFlipDur }: { pressFlipDur: number }) {
	const dur = `${pressFlipDur}s`
	return (
		<>
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="10000 0;10000 0;10000 0" dur={dur}
				keyTimes="0;0.00001;1" fill="remove" begin="mousedown" />
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="10000 0;10000 0;10000 0" dur={dur}
				keyTimes="0;0.00001;1" fill="remove" begin="touchstart" />
			<animateTransform calcMode="discrete" attributeName="transform" type="translate"
				values="0 0;0 0;0 0" dur={dur}
				keyTimes="0;0.00001;1" fill="remove" begin="touchmove" />
		</>
	)
}
