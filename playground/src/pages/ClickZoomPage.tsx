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

      <CopyDemo title="canvasBg 底图 300×500 + 2 热区（放大镜效果）">
        <ClickZoom
          canvasSize={{ w: 300, h: 500 }}
          canvasBg={{ url: getWechat300x500(1), fit: 'cover' }}
          items={[
            { x: 75, y: 125, url: getWechat300x500(2), hotspotW: 130, hotspotH: 130 },
            { x: 225, y: 125, url: getWechat300x500(3), hotspotW: 130, hotspotH: 130 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="canvasBg 底图 300×500 + 3 热区 + 放大 2×">
        <ClickZoom
          canvasSize={{ w: 300, h: 500 }}
          canvasBg={{ url: getWechat300x500(4), fit: 'cover' }}
          zoomScale={2}
          items={[
            { x: 75, y: 120, url: getWechat300x500(5), hotspotW: 120, hotspotH: 120 },
            { x: 225, y: 120, url: getWechat300x500(6), hotspotW: 120, hotspotH: 120 },
            { x: 150, y: 300, url: getWechat300x500(7), hotspotW: 120, hotspotH: 120 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="canvasBg 纯色背景 + 2 热区（无放大镜，只有详情弹出）">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          canvasBg={{ color: '#1e293b' }}
          items={[
            {
              x: 75, y: 100, hotspotW: 100, hotspotH: 100,
              jsx: (
                <foreignObject x={0} y={0} width={300} height={400}>
                  <svg viewBox="0 0 300 400" style={{ width: '100%' }}>
                    <rect width={300} height={400} fill='#3b82f6' />
                    <text x={150} y={200} fontSize={24} fill='#fff' textAnchor='middle' fontWeight={900}>详情 A</text>
                  </svg>
                </foreignObject>
              ),
            },
            {
              x: 225, y: 100, hotspotW: 100, hotspotH: 100,
              jsx: (
                <foreignObject x={0} y={0} width={300} height={400}>
                  <svg viewBox="0 0 300 400" style={{ width: '100%' }}>
                    <rect width={300} height={400} fill='#ef4444' />
                    <text x={150} y={200} fontSize={24} fill='#fff' textAnchor='middle' fontWeight={900}>详情 B</text>
                  </svg>
                </foreignObject>
              ),
            },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
