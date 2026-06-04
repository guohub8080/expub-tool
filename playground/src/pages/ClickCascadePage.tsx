import { useRef, useState } from 'react'
import { ClickCascade } from 'expub-tool/svg'
import { animateSoftBlink, transformBreathe, transformFloat } from 'expub-tool/behaviors'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => {
	const ref = useRef<HTMLDivElement>(null)
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		const html = ref.current?.innerHTML
		if (html) {
			navigator.clipboard.writeText(html)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	return (
		<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
				<h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
				<button
					onClick={handleCopy}
					style={{
						padding: '4px 12px', fontSize: 12, borderRadius: 4,
						border: '1px solid #d1d5db', background: copied ? '#10b981' : '#fff',
						color: copied ? '#fff' : '#374151', cursor: 'pointer',
					}}
				>
					{copied ? 'Copied!' : 'Copy HTML'}
				</button>
			</div>
			<div ref={ref}>{children}</div>
		</div>
	)
}

export default function ClickCascadePage() {
	return (
		<div>
			<h2>ClickCascade — 点击逐层渐显</h2>

			<CopyDemo title="3 图 URL — 基础全屏点击">
				<ClickCascade
					canvasSize={{ w: 300, h: 300 }}
					canvasBg="#1a1a2e"
					layers={[
						{ url: getWechat300x300(1) },
						{ url: getWechat300x300(2) },
						{ url: getWechat300x300(3) },
					]}
				/>
			</CopyDemo>

			<CopyDemo title="3 图 JSX — 呼吸 + 浮动 + 旋转">
				<ClickCascade
					canvasSize={{ w: 300, h: 300 }}
					fadeDuration={0.6}
					layers={[
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<rect width={300} height={300} fill="#6366f1" />
									<g>
										{transformBreathe({ origin: [150, 150], onceBreatheDurationSeconds: 2, fromScale: 0.9, toScale: 1.1 })}
										<circle cx={150} cy={150} r={60} fill="#a5b4fc" />
									</g>
								</svg>
							),
						},
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<rect width={300} height={300} fill="#ec4899" />
									<g>
										{transformFloat({ duration: 1.5, floatRangeY: 15 })}
										<circle cx={150} cy={150} r={50} fill="#fbbf24" />
									</g>
								</svg>
							),
						},
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<rect width={300} height={300} fill="#10b981" />
									<g transform="translate(150 150)">
										<animateTransform
											attributeName="transform"
											type="rotate"
											from="0" to="360"
											dur="6s"
											repeatCount="indefinite"
										/>
										<rect x={-40} y={-40} width={80} height={80} rx={12} fill="#34d399" />
									</g>
								</svg>
							),
						},
					]}
				/>
			</CopyDemo>

			<CopyDemo title="3 图混合 — URL + JSX 闪烁">
				<ClickCascade
					canvasSize={{ w: 300, h: 300 }}
					canvasBg="#1e293b"
					fadeDuration={0.8}
					layers={[
						{ url: getWechat300x300(4) },
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<rect width={300} height={300} fill="#0f172a" />
									<g>
										{animateSoftBlink({ onceBlinkDurationSeconds: 1.2 })}
										<circle cx={150} cy={150} r={80} fill="#f59e0b" />
									</g>
								</svg>
							),
						},
						{ url: getWechat300x300(5) },
					]}
				/>
			</CopyDemo>

			<CopyDemo title="4 图 — 慢速淡入 (1.5s)">
				<ClickCascade
					canvasSize={{ w: 300, h: 300 }}
					canvasBg="#0f0f23"
					fadeDuration={1.5}
					layers={[
						{ url: getWechat300x300(6) },
						{ url: getWechat300x300(7) },
						{ url: getWechat300x300(8) },
						{ url: getWechat300x300(1) },
					]}
				/>
			</CopyDemo>

			<CopyDemo title="3 图 — 右下角局部热区">
				<p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>
					只有右下角 1/4 区域可点击
				</p>
				<ClickCascade
					canvasSize={{ w: 300, h: 300 }}
					canvasBg="#18181b"
					fadeDuration={0.8}
					layers={[
						{ url: getWechat300x300(2), hotArea: { x: 150, y: 150, w: 150, h: 150 } },
						{ url: getWechat300x300(3), hotArea: { x: 150, y: 150, w: 150, h: 150 } },
						{ url: getWechat300x300(4) },
					]}
				/>
			</CopyDemo>
		</div>
	)
}
