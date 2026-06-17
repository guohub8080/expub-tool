import { ClickZoom } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 400 }}>
    <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{title}</h3>
    {children}
  </div>
)

export default function ClickZoomPage() {
  return (
    <div>
      <h2>ClickZoom — 点击热区放大详情（toggle）</h2>

      <CopyDemo title="2 热区 + url 详情图（点击放大、再点关闭）">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          background={{ url: getWechat300x300(1) }}
          items={[
            { x: 75, y: 100, url: getWechat300x300(2), hotspotW: 130, hotspotH: 130 },
            { x: 225, y: 100, url: getWechat300x300(3), hotspotW: 130, hotspotH: 130 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="2 热区 + jsx 详情（自定义内容）">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          background={{ url: getWechat300x500(1) }}
          items={[
            {
              x: 80, y: 150, hotspotW: 140, hotspotH: 140,
              jsx: (
                <foreignObject x={0} y={0} width={300} height={400}>
                  <svg viewBox="0 0 300 400" style={{ width: '100%' }}>
                    <rect width={300} height={400} fill="#1e293b" />
                    <text x={150} y={180} fontSize={28} fill="#fff" textAnchor="middle" fontWeight={900}>详情 A</text>
                    <text x={150} y={230} fontSize={14} fill="#94a3b8" textAnchor="middle">这是 jsx 自定义内容</text>
                    <text x={150} y={280} fontSize={14} fill="#94a3b8" textAnchor="middle">点击任意处关闭</text>
                  </svg>
                </foreignObject>
              ),
            },
            {
              x: 220, y: 150, hotspotW: 140, hotspotH: 140,
              jsx: (
                <foreignObject x={0} y={0} width={300} height={400}>
                  <svg viewBox="0 0 300 400" style={{ width: '100%' }}>
                    <rect width={300} height={400} fill="#7c2d12" />
                    <text x={150} y={180} fontSize={28} fill="#fff" textAnchor="middle" fontWeight={900}>详情 B</text>
                    <text x={150} y={230} fontSize={14} fill="#fed7aa" textAnchor="middle">另一张 jsx 卡片</text>
                  </svg>
                </foreignObject>
              ),
            },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="放大 2× + 慢速 1.5s">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          background={{ url: getWechat300x300(4) }}
          zoomScale={2}
          duration={1.5}
          items={[
            { x: 100, y: 130, url: getWechat300x300(5), hotspotW: 160, hotspotH: 160 },
            { x: 200, y: 280, url: getWechat300x300(6), hotspotW: 160, hotspotH: 160 },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
