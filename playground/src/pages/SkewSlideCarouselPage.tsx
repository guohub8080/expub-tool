import { SkewSlideCarousel } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function SkewSlideCarouselPage() {
  return (
    <div>
      <h2>SkewSlideCarouselX — 横向斜切轮播</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>5 图 — 默认逆时针（300×300）</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>5 图 — 顺时针 isReversed</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          isReversed
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — skewAngle=30, switchDuration=3</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          skewAngle={30}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 3 },
            { url: getWechat300x300(2), switchDuration: 3 },
            { url: getWechat300x300(3), switchDuration: 3 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — childCanvasSize=240×240，canvas 300×300</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 240, h: 240 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 3 },
            { url: getWechat300x300(2), switchDuration: 3 },
            { url: getWechat300x300(3), switchDuration: 3 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — childCanvasSize=200×200 + gap=40，canvas 300×300</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 200, h: 200 }}
          gap={40}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 3 },
            { url: getWechat300x300(2), switchDuration: 3 },
            { url: getWechat300x300(3), switchDuration: 3 },
          ]}
        />
      </div>
    </div>
  )
}
