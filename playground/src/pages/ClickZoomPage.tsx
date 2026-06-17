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

      <CopyDemo title="2 热区 + url（缩略图点击放大看详情图）">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          items={[
            {
              x: 80, y: 110, hotspotW: 130, hotspotH: 130,
              thumbnail: { url: getWechat300x300(1) },
              url: getWechat300x500(1),
            },
            {
              x: 220, y: 110, hotspotW: 130, hotspotH: 130,
              thumbnail: { url: getWechat300x300(2) },
              url: getWechat300x500(2),
            },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="缩略图 = 详情图（同一张，点击放大）">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          items={[
            { x: 75, y: 110, url: getWechat300x300(3), hotspotW: 130, hotspotH: 130 },
            { x: 225, y: 110, url: getWechat300x300(4), hotspotW: 130, hotspotH: 130 },
            { x: 150, y: 280, url: getWechat300x300(5), hotspotW: 130, hotspotH: 130 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="底图 + 热区缩略图 + 放大镜效果">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          background={{ url: getWechat300x500(3) }}
          items={[
            {
              x: 80, y: 150, hotspotW: 120, hotspotH: 120,
              thumbnail: { url: getWechat300x300(6) },
              url: getWechat300x300(7),
            },
            {
              x: 220, y: 150, hotspotW: 120, hotspotH: 120,
              thumbnail: { url: getWechat300x300(8) },
              url: getWechat300x300(9),
            },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
