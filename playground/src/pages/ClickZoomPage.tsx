import { useRef, useState } from 'react'
import { ClickZoom } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const html = ref.current?.innerHTML
    if (html) { navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 400 }}>
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

export default function ClickZoomPage() {
  return (
    <div>
      <h2>ClickZoom — 点击热区放大详情</h2>

      <CopyDemo title="homeBg = url（自动包 <image>）+ 标注">
        <ClickZoom
          canvasSize={{ w: 300, h: 500 }}
          homeBg={
            <>
              <image href={getWechat300x500(1)} x={0} y={0} width={300} height={500} preserveAspectRatio="xMidYMid slice" />
              <text x={150} y={40} fontSize={20} fill="#fff" fontWeight={900} textAnchor="middle">点击图标查看详情</text>
              <circle cx={75} cy={125} r={52} fill="none" stroke="#fbbf24" strokeWidth={3} />
              <text x={75} y={195} fontSize={11} fill="#fbbf24" textAnchor="middle" fontWeight={700}>A</text>
              <circle cx={225} cy={125} r={52} fill="none" stroke="#34d399" strokeWidth={3} />
              <text x={225} y={195} fontSize={11} fill="#34d399" textAnchor="middle" fontWeight={700}>B</text>
              <circle cx={150} cy={320} r={52} fill="none" stroke="#f87171" strokeWidth={3} />
              <text x={150} y={390} fontSize={11} fill="#f87171" textAnchor="middle" fontWeight={700}>C</text>
              <text x={150} y={470} fontSize={11} fill="#fff" opacity={0.6} textAnchor="middle">👆 点击圆圈区域</text>
            </>
          }
          childItems={[
            { thumbnail: { x: 15, y: 65, w: 120, h: 120 }, modalContent: getWechat300x500(2) },
            { thumbnail: { x: 165, y: 65, w: 120, h: 120 }, modalContent: getWechat300x500(3) },
            { thumbnail: { x: 90, y: 260, w: 120, h: 120 }, modalContent: getWechat300x500(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="homeBg = 纯色 + 自由排版（仿桌面布局）">
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

      <CopyDemo title="homeBg = 底图 + 装饰边框 + per-item scale">
        <ClickZoom
          canvasSize={{ w: 300, h: 300 }}
          homeBg={
            <>
              <image href={getWechat300x300(5)} x={0} y={0} width={300} height={300} preserveAspectRatio="xMidYMid slice" />
              <rect x={0} y={0} width={300} height={300} fill="#000" opacity={0.2} />
              <rect x={10} y={10} width={280} height={280} fill="none" stroke="#fff" strokeWidth={1} opacity={0.4} rx={8} />
              <text x={20} y={25} fontSize={9} fill="#fff" opacity={0.7}>GALLERY</text>
              <text x={280} y={290} fontSize={9} fill="#fff" opacity={0.7} textAnchor="end">2024</text>
            </>
          }
          childItems={[
            { thumbnail: { x: 25, y: 25, w: 110, h: 110 }, modalContent: getWechat300x300(6), scale: { inDuration: 0.5, outDuration: 1.5 } },
            { thumbnail: { x: 165, y: 165, w: 110, h: 110 }, modalContent: getWechat300x300(7), scale: { inKeySplines: "0 0 0.2 1", outKeySplines: "0.8 0 1 1" } },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
