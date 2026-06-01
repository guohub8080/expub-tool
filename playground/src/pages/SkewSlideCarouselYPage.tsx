import { SkewSlideCarouselY } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function SkewSlideCarouselYPage() {
  return (
    <div>
      <h2>SkewSlideCarouselY — 纵向斜切</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>5 图 — 纵向默认（300×500）</h3>
        <SkewSlideCarouselY
          canvasSize={{ w: 300, h: 500 }}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>5 图 — 纵向 isReversed</h3>
        <SkewSlideCarouselY
          canvasSize={{ w: 300, h: 500 }}
          isReversed
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — skewAngle=30, stepDuration=3</h3>
        <SkewSlideCarouselY
          canvasSize={{ w: 300, h: 500 }}
          skewAngle={30}
          stepDuration={3}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — itemGap=30（带间距）</h3>
        <SkewSlideCarouselY
          canvasSize={{ w: 300, h: 500 }}
          itemGap={30}
          stepDuration={3}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>
    </div>
  )
}
