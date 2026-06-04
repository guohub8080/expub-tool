import { useRef, useState } from 'react'
import { ClickCascade } from 'expub-tool/svg'
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

			<CopyDemo title="3 图 JSX — 纯渐变文字">
				<ClickCascade
					canvasSize={{ w: 300, h: 300 }}
					fadeDuration={0.6}
					layers={[
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<rect width={300} height={300} fill="#6366f1" />
									<text x={150} y={140} textAnchor="middle" fill="#fff" fontSize={36} fontWeight="bold" fontFamily="sans-serif">第 1 层</text>
									<text x={150} y={180} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={14} fontFamily="sans-serif">click to reveal</text>
								</svg>
							),
						},
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<defs>
										<linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor="#6366f1" />
											<stop offset="100%" stopColor="#ec4899" />
										</linearGradient>
									</defs>
									<rect width={300} height={300} fill="url(#cg1)" />
									<text x={150} y={140} textAnchor="middle" fill="#fff" fontSize={36} fontWeight="bold" fontFamily="sans-serif">第 2 层</text>
									<text x={150} y={180} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={14} fontFamily="sans-serif">click to reveal</text>
								</svg>
							),
						},
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<rect width={300} height={300} fill="#10b981" />
									<text x={150} y={140} textAnchor="middle" fill="#fff" fontSize={36} fontWeight="bold" fontFamily="sans-serif">第 3 层</text>
									<text x={150} y={180} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={14} fontFamily="sans-serif">final layer 🎉</text>
								</svg>
							),
						},
					]}
				/>
			</CopyDemo>

			<CopyDemo title="3 图混合 — URL + JSX">
				<ClickCascade
					canvasSize={{ w: 300, h: 300 }}
					canvasBg="#1e293b"
					fadeDuration={0.8}
					layers={[
						{ url: getWechat300x300(4) },
						{
							jsx: (
								<svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block' }}>
									<defs>
										<linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" stopColor="#f59e0b" />
											<stop offset="100%" stopColor="#ef4444" />
										</linearGradient>
									</defs>
									<rect width={300} height={300} fill="url(#cg2)" />
									<text x={150} y={150} textAnchor="middle" fill="#fff" fontSize={28} fontWeight="bold" fontFamily="sans-serif">JSX 插层</text>
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
