import { SpinZoomCarousel } from 'expub-tool/svg'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

export default function SpinZoomCarouselPage() {
  return (
    <div>
      <h2>SpinZoomCarousel — 缩小旋转轮播</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 默认参数（300×500）</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          items={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 各自不同时长</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          items={[
            { url: getWechat300x500(1), stayDuration: 3, switchDuration: 0.8 },
            { url: getWechat300x500(2), stayDuration: 0.5, switchDuration: 0.8 },
            { url: getWechat300x500(3), stayDuration: 3, switchDuration: 0.8 },
            { url: getWechat300x500(4), stayDuration: 0.5, switchDuration: 0.8 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — peakScale=0.3（缩更小）</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          peakScale={0.3}
          items={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — peakScale=1.8（放大更多）</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          peakScale={1.8}
          items={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — item 模式（自定义 SVG）</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 300 }}
          items={[
            { item: <svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block', backgroundColor: '#dc2626' }}><text x="150" y="160" textAnchor="middle" fill="white" fontSize="48">Red</text></svg> },
            { item: <svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block', backgroundColor: '#2563eb' }}><text x="150" y="160" textAnchor="middle" fill="white" fontSize="48">Blue</text></svg> },
            { item: <svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block', backgroundColor: '#059669' }}><text x="150" y="160" textAnchor="middle" fill="white" fontSize="48">Green</text></svg> },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — canvasBg 颜色</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          canvasBg="#1e1b4b"
          items={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — isReversedSpin（逆时针）</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          isReversedSpin
          items={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — spinCount=2（转两圈）</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          spinCount={2}
          items={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </div>
    </div>
  )
}
