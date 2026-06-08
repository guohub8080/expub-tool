import { ClickPopup } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function ClickPopupPage() {
	return (
		<div>
			<h2>ClickPopup — 无限点击弹跳弹出</h2>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>URL 模式 — 300×300</h3>
				<ClickPopup
					canvasSize={{ w: 300, h: 300 }}
					cover={{ url: getWechat300x300(1) }}
					popup={{ url: getWechat300x300(2) }}
				/>
			</div>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>深色背景 + 慢弹跳 (1.2s)</h3>
				<ClickPopup
					canvasSize={{ w: 300, h: 300 }}
					canvasBg={{ color: "#1a1a2e" }}
					bounceDuration={1.2}
					cover={{ url: getWechat300x300(3) }}
					popup={{ url: getWechat300x300(4) }}
				/>
			</div>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>JSX 弹窗 — 渐变背景 + 文字</h3>
				<ClickPopup
					canvasSize={{ w: 300, h: 400 }}
					canvasBg={{ color: "#0f0f23" }}
					cover={{ url: getWechat300x300(5) }}
					popup={{
						jsx: (
							<svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
								<defs>
									<linearGradient id="popupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#6366f1" />
										<stop offset="100%" stopColor="#ec4899" />
									</linearGradient>
								</defs>
								<rect x={0} y={0} width={300} height={400} rx={20} fill="url(#popupGrad)" />
								<circle cx={60} cy={80} r={100} fill="rgba(255,255,255,0.08)" />
								<circle cx={260} cy={320} r={80} fill="rgba(255,255,255,0.08)" />
								<text x={150} y={190} textAnchor="middle" fill="#fff" fontSize={28} fontWeight="bold" fontFamily="sans-serif">
									POPUP!
								</text>
								<text x={150} y={230} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={14} fontFamily="sans-serif">
									click to bounce again
								</text>
							</svg>
						),
					}}
				/>
			</div>
		</div>
	)
}
