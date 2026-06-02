import { ClickFlipCard } from 'expub-tool/svg'
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
		</div>
	)
}
