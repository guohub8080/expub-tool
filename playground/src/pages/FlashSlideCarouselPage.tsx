import { FlashSlideCarousel } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 400 }}>
    <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{title}</h3>
    {children}
  </div>
)

export default function FlashSlideCarouselPage() {
  return (
    <div>
      <h2>FlashSlideCarousel — 拍照快闪轮播</h2>

      <CopyDemo title="默认（5 图方图，5s 周期，抖动 0.75↔1.5）">
        <FlashSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="竖图（300×500）">
        <FlashSlideCarousel
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
            { url: getWechat300x500(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="轻抖（flashShrink=0.9, flashScale=1.2）">
        <FlashSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          flashShrink={0.9}
          flashScale={1.2}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快节奏（duration=3s，3 图）">
        <FlashSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          duration={3}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="长切换（transFrac=0.6，淡化重叠更多）">
        <FlashSlideCarousel
          canvasSize={{ w: 300, h: 300 }}
          transFrac={0.6}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
