import { ClickFlipCard } from 'expub-tool/svg'
import { animateSoftBlink, transformBreathe, transformFloat } from 'expub-tool/behaviors'
import svgURL from 'expub-tool/svg-utils'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function ClickFlipCardPage() {
	return (
		<div>
			<h2>ClickFlipCard — 无限点击翻转卡牌</h2>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>URL 模式 — 300×300</h3>
				<ClickFlipCard
					canvasSize={{ w: 300, h: 300 }}
					frontSide={{ url: getWechat300x300(1) }}
					backSide={{ url: getWechat300x300(2) }}
				/>
			</div>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>URL 模式 — 750×400 宽屏</h3>
				<ClickFlipCard
					canvasSize={{ w: 750, h: 400 }}
					frontSide={{ url: getWechat300x300(3) }}
					backSide={{ url: getWechat300x300(4) }}
				/>
			</div>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>自定义背景色 + 慢翻转 (1.5s 上限)</h3>
				<ClickFlipCard
					canvasSize={{ w: 300, h: 300 }}
					canvasBg="#1a1a2e"
					flipDuration={1.5}
					frontSide={{ url: getWechat300x300(5) }}
					backSide={{ url: getWechat300x300(6) }}
				/>
			</div>

			<div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
				<h3 style={{ margin: '0 0 8px' }}>JSX 复合 SVG — 正面呼吸+浮动，反面闪烁文字</h3>
				<ClickFlipCard
					canvasSize={{ w: 300, h: 400 }}
					canvasBg="#0f0f23"
					frontSide={{
						jsx: (
							<svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
								{/* 背景图 */}
								<defs>
									<clipPath id="frontClip">
										<rect x={0} y={0} width={300} height={400} rx={16} />
									</clipPath>
								</defs>
								<g clipPath="url(#frontClip)">
									<foreignObject x={0} y={0} width={300} height={400}>
										<svg
											viewBox="0 0 300 400"
											style={{
												display: 'block',
												width: '100%',
												backgroundImage: svgURL(getWechat300x300(7)),
												backgroundSize: '100% 100%',
												backgroundRepeat: 'no-repeat',
											}}
										/>
									</foreignObject>

									{/* 半透明遮罩 */}
									<rect x={0} y={280} width={300} height={120} fill="rgba(0,0,0,0.6)" />

									{/* 浮动标题 */}
									<g transform="translate(150, 320)">
										{transformFloat({ floatRange: 6, duration: 2.5, begin: '0s' })}
										<text textAnchor="middle" fill="#fff" fontSize={22} fontWeight="bold" fontFamily="sans-serif">
											Click to Flip
										</text>
									</g>

									{/* 呼吸光圈 */}
									<g>
										{transformBreathe({ minScale: 0.8, maxScale: 1.2, duration: 1.5, begin: '0s' })}
										<circle cx={150} cy={180} r={50} fill="rgba(255,255,255,0.15)" />
									</g>

									{/* 呼吸角标 */}
									<g transform="translate(230, 40)">
										{transformBreathe({ minScale: 0.9, maxScale: 1.1, duration: 2, begin: '0.3s' })}
										<rect x={-24} y={-12} width={48} height={24} rx={12} fill="#ef4444" />
										<text x={0} y={5} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="bold" fontFamily="sans-serif">
											NEW
										</text>
									</g>
								</g>
							</svg>
						),
					}}
					backSide={{
						jsx: (
							<svg viewBox="0 0 300 400" style={{ width: '100%', display: 'block' }}>
								<defs>
									<linearGradient id="backGrad" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#6366f1" />
										<stop offset="100%" stopColor="#ec4899" />
									</linearGradient>
									<clipPath id="backClip">
										<rect x={0} y={0} width={300} height={400} rx={16} />
									</clipPath>
								</defs>
								<g clipPath="url(#backClip)">
									<rect x={0} y={0} width={300} height={400} fill="url(#backGrad)" />

									{/* 装饰圆 */}
									<circle cx={60} cy={80} r={120} fill="rgba(255,255,255,0.08)" />
									<circle cx={260} cy={320} r={100} fill="rgba(255,255,255,0.08)" />

									{/* 中心图标区 */}
									<g transform="translate(150, 160)">
										{transformBreathe({ minScale: 0.85, maxScale: 1.15, duration: 1.8, begin: '0s' })}
										<rect x={-50} y={-50} width={100} height={100} rx={20} fill="rgba(255,255,255,0.2)" />
										<text x={0} y={8} textAnchor="middle" fill="#fff" fontSize={40} fontFamily="sans-serif">
											★
										</text>
									</g>

									{/* 闪烁提示文字 */}
									<g>
										{animateSoftBlink({ minOpacity: 0.3, maxOpacity: 1, duration: 1.2, begin: '0.5s' })}
										<text x={150} y={280} textAnchor="middle" fill="#fff" fontSize={18} fontWeight="bold" fontFamily="sans-serif">
											Click to Back
										</text>
									</g>

									{/* 底部闪烁小字 */}
									<g>
										{animateSoftBlink({ minOpacity: 0.2, maxOpacity: 0.8, duration: 1.5, begin: '0.8s' })}
										<text x={150} y={360} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={12} fontFamily="sans-serif">
											infinite flip card
										</text>
									</g>
								</g>
							</svg>
						),
					}}
				/>
			</div>
		</div>
	)
}
