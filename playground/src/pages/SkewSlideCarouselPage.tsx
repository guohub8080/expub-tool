import { SkewSlideCarousel, SkewSlideCarouselY, SkewPushY } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function SkewSlideCarouselPage() {
  return (
    <div>
      <h2>SkewSlideCarousel — 斜切轮播</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>5 图 — 默认逆时针（300×300）</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
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
        <h3 style={{ margin: '0 0 8px' }}>5 图 — 顺时针 isReversed</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
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
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
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
        <h3 style={{ margin: '0 0 8px' }}>3 图 — skewAngle=45（正方形极限）</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          skewAngle={45}
          stepDuration={3}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — margin=30（带间距）</h3>
        <SkewSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          itemGap={30}
          stepDuration={3}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <h2 style={{ marginTop: 32 }}>SkewPushY — 交叉斜切</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 交叉默认</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          stepDuration={3}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 交叉 isReversed</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          isReversed
          stepDuration={3}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 每图自定义 skewIn/skewOut</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          stepDuration={3}
          items={[
            { url: getWechat300x300(1), skewIn: 'L', skewOut: 'R' },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'L' },
            { url: getWechat300x300(3), skewIn: 'L', skewOut: 'L' },
          ]}
        />
      </div>

      <h2 style={{ marginTop: 32 }}>SkewSlideCarouselY — 纵向斜切</h2>

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
        <h3 style={{ margin: '0 0 8px' }}>5 图 — 纵向随机 L/R 组合</h3>
        <SkewSlideCarouselY
          canvasSize={{ w: 300, h: 500 }}
          items={[
            { url: getWechat300x300(1), skewIn: 'L', skewOut: 'R' },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'L' },
            { url: getWechat300x300(3), skewIn: 'L', skewOut: 'L' },
            { url: getWechat300x300(4), skewIn: 'R', skewOut: 'R' },
            { url: getWechat300x300(5), skewIn: 'R', skewOut: 'L' },
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
