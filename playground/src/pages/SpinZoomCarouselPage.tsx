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
          pics={[
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
          pics={[
            { url: getWechat300x500(1), stayDuration: 3, switchDuration: 0.8 },
            { url: getWechat300x500(2), stayDuration: 0.5, switchDuration: 0.8 },
            { url: getWechat300x500(3), stayDuration: 3, switchDuration: 0.8 },
            { url: getWechat300x500(4), stayDuration: 0.5, switchDuration: 0.8 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — minScale=0.3</h3>
        <SpinZoomCarousel
          canvasSize={{ w: 300, h: 500 }}
          minScale={0.3}
          pics={[
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
          pics={[
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
          pics={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </div>
    </div>
  )
}
