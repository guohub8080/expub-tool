import { ClickFlipOnce } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function ClickFlipOncePage() {
	return (
		<div>
			<h2>ClickFlipOnce — 点击翻转卡片（仅一次）</h2>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>URL 模式 — 300×300</h3>
				<ClickFlipOnce
					canvasSize={{ w: 300, h: 300 }}
					frontSide={{ url: getWechat300x300(1) }}
					backSide={{ url: getWechat300x300(2) }}
				/>
			</div>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>自定义背景色 + 慢翻转 (2s)</h3>
				<ClickFlipOnce
					canvasSize={{ w: 300, h: 300 }}
					canvasBg="#1a1a2e"
					flipDuration={2}
					frontSide={{ url: getWechat300x300(3) }}
					backSide={{ url: getWechat300x300(4) }}
				/>
			</div>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>JSX 复合内容 — 正面带文字，反面纯色</h3>
				<ClickFlipOnce
					canvasSize={{ w: 300, h: 400 }}
					canvasBg="#0f0f23"
					frontSide={{
						jsx: (
							<svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
								<rect x={0} y={0} width={300} height={400} fill="#1e293b" />
								<foreignObject x={0} y={0} width={300} height={400}>
									<svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
										<rect x={0} y={0} width={300} height={400} rx={16} fill="url(#frontGrad)" />
										<defs>
											<linearGradient id="frontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
												<stop offset="0%" stopColor="#6366f1" />
												<stop offset="100%" stopColor="#3b82f6" />
											</linearGradient>
										</defs>
										<text x={150} y={200} textAnchor="middle" fill="#fff" fontSize={24} fontWeight="bold" fontFamily="sans-serif">
											点击翻转
										</text>
										<text x={150} y={240} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={14} fontFamily="sans-serif">
											只能点一次
										</text>
									</svg>
								</foreignObject>
							</svg>
						),
					}}
					backSide={{
						jsx: (
							<svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
								<rect x={0} y={0} width={300} height={400} rx={16} fill="#ec4899" />
								<text x={150} y={200} textAnchor="middle" fill="#fff" fontSize={28} fontWeight="bold" fontFamily="sans-serif">
									已翻转 ✓
								</text>
							</svg>
						),
					}}
				/>
			</div>
		</div>
	)
}
