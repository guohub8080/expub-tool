import { SkewSlideCarousel } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function SkewSlideCarouselPage() {
  return (
    <div>
      <h2>SkewSlideCarouselX — 三面可见斜切轮播</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>5 图 — childCanvasSize=80×80，三面可见</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 80, h: 80 }}
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
        <h3 style={{ margin: '0 0 8px' }}>5 图 — isReversed，childCanvasSize=80×80</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 80, h: 80 }}
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
        <h3 style={{ margin: '0 0 8px' }}>3 图 — childCanvasSize=80×80，skewAngle=20</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 80, h: 80 }}
          skewAngle={20}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — normalize 到 4 张</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 80, h: 80 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>1 图 — normalize 到 3 张</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 80, h: 80 }}
          childItems={[
            { url: getWechat300x300(1) },
          ]}
        />
      </div>
    </div>
  )
}
