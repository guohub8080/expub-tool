import { useRef, useState } from 'react'
import { ClickZoom } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

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
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 400 }}>
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

export default function ClickZoomPage() {
  return (
    <div>
      <h2>ClickZoom — 点击热区放大详情</h2>

      <CopyDemo title="canvasBg 底图 + children 标注（300×500，点击图标放大看详情）">
        <ClickZoom
          canvasSize={{ w: 300, h: 500 }}
          canvasBg={{ url: getWechat300x500(1), fit: 'cover' }}
          items={[
            { x: 75, y: 125, url: getWechat300x500(2), hotspotW: 120, hotspotH: 120 },
            { x: 225, y: 125, url: getWechat300x500(3), hotspotW: 120, hotspotH: 120 },
            { x: 150, y: 320, url: getWechat300x500(4), hotspotW: 120, hotspotH: 120 },
          ]}
        >
          {/* 标题 */}
          <text x={150} y={40} fontSize={20} fill="#fff" fontWeight={900} textAnchor="middle">
            点击图标查看详情
          </text>
          {/* 三个圆形标注框 + 小字 */}
          <g>
            <circle cx={75} cy={125} r={52} fill="none" stroke="#fbbf24" strokeWidth={3} />
            <text x={75} y={195} fontSize={11} fill="#fbbf24" textAnchor="middle" fontWeight={700}>A</text>
          </g>
          <g>
            <circle cx={225} cy={125} r={52} fill="none" stroke="#34d399" strokeWidth={3} />
            <text x={225} y={195} fontSize={11} fill="#34d399" textAnchor="middle" fontWeight={700}>B</text>
          </g>
          <g>
            <circle cx={150} cy={320} r={52} fill="none" stroke="#f87171" strokeWidth={3} />
            <text x={150} y={390} fontSize={11} fill="#f87171" textAnchor="middle" fontWeight={700}>C</text>
          </g>
          {/* 底部提示 */}
          <text x={150} y={470} fontSize={11} fill="#fff" opacity={0.6} textAnchor="middle">
            👆 点击上方圆圈区域
          </text>
        </ClickZoom>
      </CopyDemo>

      <CopyDemo title="纯色背景 + children 自由排版（仿桌面布局，慢速 20s）">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          canvasBg={{ color: '#0f172a' }}
          duration={20}
          items={[
            { x: 75, y: 100, url: getWechat300x300(1), hotspotW: 100, hotspotH: 100 },
            { x: 225, y: 100, url: getWechat300x300(2), hotspotW: 100, hotspotH: 100 },
            { x: 75, y: 250, url: getWechat300x300(3), hotspotW: 100, hotspotH: 100 },
            { x: 225, y: 250, url: getWechat300x300(4), hotspotW: 100, hotspotH: 100 },
          ]}
        >
          {/* 顶部状态栏 */}
          <rect x={0} y={0} width={300} height={30} fill="#1e293b" />
          <text x={20} y={20} fontSize={11} fill="#94a3b8">9:41</text>
          <text x={280} y={20} fontSize={11} fill="#94a3b8" textAnchor="end">100%</text>

          {/* 四个图标格子背景 */}
          <rect x={25} y={50} width={100} height={100} rx={20} fill="#1e293b" />
          <rect x={175} y={50} width={100} height={100} rx={20} fill="#1e293b" />
          <rect x={25} y={200} width={100} height={100} rx={20} fill="#1e293b" />
          <rect x={175} y={200} width={100} height={100} rx={20} fill="#1e293b" />

          {/* 图标标签 */}
          <text x={75} y={170} fontSize={10} fill="#cbd5e1" textAnchor="middle">相册</text>
          <text x={225} y={170} fontSize={10} fill="#cbd5e1" textAnchor="middle">音乐</text>
          <text x={75} y={320} fontSize={10} fill="#cbd5e1" textAnchor="middle">设置</text>
          <text x={225} y={320} fontSize={10} fill="#cbd5e1" textAnchor="middle">天气</text>

          {/* 底部 Dock 栏 */}
          <rect x={0} y={360} width={300} height={40} fill="#1e293b" />
        </ClickZoom>
      </CopyDemo>

      <CopyDemo title="canvasBg 底图 + children 装饰边框 + 2 热区">
        <ClickZoom
          canvasSize={{ w: 300, h: 300 }}
          canvasBg={{ url: getWechat300x300(5), fit: 'cover' }}
          items={[
            { x: 80, y: 80, url: getWechat300x300(6), hotspotW: 110, hotspotH: 110 },
            { x: 220, y: 220, url: getWechat300x300(7), hotspotW: 110, hotspotH: 110 },
          ]}
        >
          {/* 半透明遮罩 */}
          <rect x={0} y={0} width={300} height={300} fill="#000" opacity={0.2} />
          {/* 装饰边框 */}
          <rect x={10} y={10} width={280} height={280} fill="none" stroke="#fff" strokeWidth={1} opacity={0.4} rx={8} />
          {/* 角标 */}
          <text x={20} y={25} fontSize={9} fill="#fff" opacity={0.7}>GALLERY</text>
          <text x={280} y={290} fontSize={9} fill="#fff" opacity={0.7} textAnchor="end">2024</text>
          {/* 热区提示十字线 */}
          <line x1={80} y1={65} x2={80} y2={95} stroke="#fbbf24" strokeWidth={2} />
          <line x1={65} y1={80} x2={95} y2={80} stroke="#fbbf24" strokeWidth={2} />
          <line x1={220} y1={205} x2={220} y2={235} stroke="#fbbf24" strokeWidth={2} />
          <line x1={205} y1={220} x2={235} y2={220} stroke="#fbbf24" strokeWidth={2} />
        </ClickZoom>
      </CopyDemo>
    </div>
  )
}
