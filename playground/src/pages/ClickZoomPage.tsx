import { useRef, useState } from 'react'
import { ClickZoom } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const html = ref.current?.innerHTML
    if (html) { navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        <button onClick={handleCopy} style={{
          padding: '4px 12px', fontSize: 12, borderRadius: 4, border: '1px solid #d1d5db', background: copied ? '#10b981' : '#fff', color: copied ? '#fff' : '#374151', cursor: 'pointer',
        }}>{copied ? 'Copied!' : 'Copy HTML'}</button>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  )
}

const Bg = ({ img }: { img: string }) => (
  <image href={img} x={0} y={0} width={300} height={300} preserveAspectRatio="xMidYMid slice" />
)

export default function ClickZoomPage() {
  return (
    <div>
      <h2>ClickZoom — 点击热区放大详情</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <CopyDemo title="zoomScale=2（放大 2×）">
          <ClickZoom
            canvasSize={{ w: 300, h: 300 }}
            homeBg={<Bg img={getWechat300x300(1)} />}
            zoomScale={2}
            childItems={[
              { thumbnail: { x: 25, y: 25, w: 100, h: 100 }, modalContent: getWechat300x300(2) },
              { thumbnail: { x: 175, y: 175, w: 100, h: 100 }, modalContent: getWechat300x300(3) },
            ]}
          />
        </CopyDemo>

        <CopyDemo title="zoomScale=4（默认，放大 4×）">
          <ClickZoom
            canvasSize={{ w: 300, h: 300 }}
            homeBg={<Bg img={getWechat300x300(4)} />}
            childItems={[
              { thumbnail: { x: 25, y: 25, w: 100, h: 100 }, modalContent: getWechat300x300(5) },
              { thumbnail: { x: 175, y: 175, w: 100, h: 100 }, modalContent: getWechat300x300(6) },
            ]}
          />
        </CopyDemo>

        <CopyDemo title="zoomScale=8（放大 8×）">
          <ClickZoom
            canvasSize={{ w: 300, h: 300 }}
            homeBg={<Bg img={getWechat300x300(7)} />}
            zoomScale={8}
            childItems={[
              { thumbnail: { x: 25, y: 25, w: 100, h: 100 }, modalContent: getWechat300x300(8) },
              { thumbnail: { x: 175, y: 175, w: 100, h: 100 }, modalContent: getWechat300x300(9) },
            ]}
          />
        </CopyDemo>

        <CopyDemo title="zoomScale=2 + per-item scale（A 快开慢关、B 默认）">
          <ClickZoom
            canvasSize={{ w: 300, h: 300 }}
            homeBg={<Bg img={getWechat300x300(1)} />}
            zoomScale={2}
            childItems={[
              {
                thumbnail: { x: 25, y: 25, w: 100, h: 100 },
                modalContent: getWechat300x300(2),
                scale: { inDuration: 0.3, outDuration: 2, inKeySplines: "0 0 0.2 1", outKeySplines: "0.8 0 1 1" },
              },
              { thumbnail: { x: 175, y: 175, w: 100, h: 100 }, modalContent: getWechat300x300(3) },
            ]}
          />
        </CopyDemo>

        <CopyDemo title="zoomScale=3 + 标注 + 装饰">
          <ClickZoom
            canvasSize={{ w: 300, h: 300 }}
            homeBg={
              <>
                <Bg img={getWechat300x300(4)} />
                <rect x={0} y={0} width={300} height={300} fill="#000" opacity={0.15} />
                <text x={150} y={25} fontSize={14} fill="#fff" textAnchor="middle" fontWeight={700}>点击圆形区域</text>
                <circle cx={75} cy={75} r={50} fill="none" stroke="#fbbf24" strokeWidth={2} />
                <circle cx={225} cy={225} r={50} fill="none" stroke="#f87171" strokeWidth={2} />
              </>
            }
            zoomScale={3}
            childItems={[
              { thumbnail: { x: 25, y: 25, w: 100, h: 100 }, modalContent: getWechat300x300(5) },
              { thumbnail: { x: 175, y: 175, w: 100, h: 100 }, modalContent: getWechat300x300(6) },
            ]}
          />
        </CopyDemo>

        <CopyDemo title="纯色 + 仿桌面布局">
          <ClickZoom
            canvasSize={{ w: 300, h: 400 }}
            homeBg={
              <>
                <rect x={0} y={0} width={300} height={400} fill="#0f172a" />
                <rect x={0} y={0} width={300} height={30} fill="#1e293b" />
                <text x={20} y={20} fontSize={11} fill="#94a3b8">9:41</text>
                <text x={280} y={20} fontSize={11} fill="#94a3b8" textAnchor="end">100%</text>
                <rect x={25} y={50} width={100} height={100} rx={20} fill="#1e293b" />
                <rect x={175} y={50} width={100} height={100} rx={20} fill="#1e293b" />
                <rect x={25} y={200} width={100} height={100} rx={20} fill="#1e293b" />
                <rect x={175} y={200} width={100} height={100} rx={20} fill="#1e293b" />
                <text x={75} y={170} fontSize={10} fill="#cbd5e1" textAnchor="middle">相册</text>
                <text x={225} y={170} fontSize={10} fill="#cbd5e1" textAnchor="middle">音乐</text>
                <text x={75} y={320} fontSize={10} fill="#cbd5e1" textAnchor="middle">设置</text>
                <text x={225} y={320} fontSize={10} fill="#cbd5e1" textAnchor="middle">天气</text>
                <rect x={0} y={360} width={300} height={40} fill="#1e293b" />
              </>
            }
            childItems={[
              { thumbnail: { x: 25, y: 50, w: 100, h: 100 }, modalContent: getWechat300x300(1) },
              { thumbnail: { x: 175, y: 50, w: 100, h: 100 }, modalContent: getWechat300x300(2) },
              { thumbnail: { x: 25, y: 200, w: 100, h: 100 }, modalContent: getWechat300x300(3) },
              { thumbnail: { x: 175, y: 200, w: 100, h: 100 }, modalContent: getWechat300x300(4) },
            ]}
          />
        </CopyDemo>
      </div>
    </div>
  )
}
