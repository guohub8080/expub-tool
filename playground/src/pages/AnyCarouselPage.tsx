import { useRef, useState } from 'react'
import { AnyCarousel } from 'expub-tool/svg'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const html = ref.current?.innerHTML
    if (html) {
      navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        <button
          onClick={handleCopy}
          style={{
            padding: '4px 12px', fontSize: 12, borderRadius: 4,
            border: '1px solid #d1d5db', background: copied ? '#10b981' : '#fff',
            color: copied ? '#fff' : '#374151', cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  )
}

export default function AnyCarouselPage() {
  return (
    <div>
      <h2>AnyCarousel — 单向轮播（四角色 + 任意角度）</h2>

      <CopyDemo title="中心放大（angle=0 → 向右流）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 700 }}
          childCanvasSize={{ w: 300, h: 500 }}
          childGap={100}
          angle={0}
          centerChildConfig={{ scale: 1.4 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="向左（angle=180 → 向左流）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 700 }}
          childCanvasSize={{ w: 300, h: 500 }}
          childGap={100}
          angle={180}
          centerChildConfig={{ scale: 1.4 }}
          childItems={[
            { url: getWechat300x500(4) },
            { url: getWechat300x500(5) },
            { url: getWechat300x500(6) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="向上（angle=90 → 向上流）">
        <AnyCarousel
          canvasSize={{ w: 500, h: 900 }}
          childCanvasSize={{ w: 300, h: 500 }}
          childGap={100}
          angle={90}
          centerChildConfig={{ scale: 1.4 }}
          childItems={[
            { url: getWechat300x500(7) },
            { url: getWechat300x500(8) },
            { url: getWechat300x500(9) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="对角线（angle=45，slots 严格沿真实 45° 排列）">
        <AnyCarousel
          canvasSize={{ w: 900, h: 900 }}
          childCanvasSize={{ w: 300, h: 500 }}
          childGap={120}
          angle={45}
          centerChildConfig={{ scale: 1.4 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="childGap 间距对比（gap = 相邻 child 沿流向的影子边到边空隙）">
        {[0, 120, 240].map((g) => (
          <div key={g} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              gap = {g}
              {g === 0 ? '（影子贴边：轴向即贴边，侧图大块露出）' : ''}
              {g === 240 ? '（侧图几乎只剩一缝）' : ''}
            </div>
            <AnyCarousel
              canvasSize={{ w: 800, h: 600 }}
              childCanvasSize={{ w: 300, h: 500 }}
              childGap={g}
              angle={0}
              centerChildConfig={{ scale: 1.2 }}
              childItems={[
                { url: getWechat300x500(1) },
                { url: getWechat300x500(2) },
                { url: getWechat300x500(3) },
              ]}
            />
          </div>
        ))}
      </CopyDemo>

      <CopyDemo title="四角色全配置（coverflow：中心放大、侧图缩小倾斜半透、屏外隐藏）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 700 }}
          childCanvasSize={{ w: 300, h: 500 }}
          childGap={60}
          angle={0}
          centerChildConfig={{ scale: 1.3, opacity: 1 }}
          nextChildConfig={{ scale: 0.7, rotate: 25, skewY: 10, opacity: 0.6 }}
          lastChildConfig={{ scale: 0.7, rotate: -25, skewY: -10, opacity: 0.6 }}
          outWindowConfig={{ scale: 0.4, opacity: 0 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
            { url: getWechat300x500(4) },
            { url: getWechat300x500(5) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="每角色 pivot（coverflow fan：next 绕 Right、last 绕 Left，全不透明看遮挡）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 700 }}
          childCanvasSize={{ w: 300, h: 500 }}
          childGap={60}
          angle={0}
          centerChildConfig={{ scale: 1.3 }}
          nextChildConfig={{ scale: { value: 0.7, childCanvasPivot: 'Right' }, rotate: { value: 25, childCanvasPivot: 'Right', keySplines: '0.42 0 0.58 1' } }}
          lastChildConfig={{ scale: { value: 0.7, childCanvasPivot: 'Left' }, rotate: { value: -25, childCanvasPivot: 'Left', keySplines: '0.42 0 0.58 1' } }}
          outWindowConfig={{ scale: 0.4 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
            { url: getWechat300x500(4) },
            { url: getWechat300x500(5) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快速切换（switchDuration=0.3, stayDuration=0.5）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 700 }}
          childCanvasSize={{ w: 300, h: 500 }}
          childGap={100}
          angle={0}
          centerChildConfig={{ scale: 1.4 }}
          childItems={[
            { url: getWechat300x500(7), switchDuration: 0.3, stayDuration: 0.5 },
            { url: getWechat300x500(8), switchDuration: 0.3, stayDuration: 0.5 },
            { url: getWechat300x500(9), switchDuration: 0.3, stayDuration: 0.5 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="拟 SkewSlide cube（skewY 绕底边 pivot + Y 交叉补偿，3 面无缝循环）">
        <AnyCarousel
          canvasSize={{ w: 300, h: 300 }}
          childCanvasSize={{ w: 80, h: 80 }}
          childGap={0}
          angle={0}
          nextChildConfig={{ skewY: { value: -15, childCanvasPivot: 'Bottom' }, translate: { y: 11 } }}
          lastChildConfig={{ skewY: { value: 15, childCanvasPivot: 'Bottom' }, translate: { y: 11 } }}
          nextOutWindowConfig={{ skewY: { value: -30, childCanvasPivot: 'Bottom' }, translate: { y: 23 }, opacity: 0 }}
          lastOutWindowConfig={{ skewY: { value: 30, childCanvasPivot: 'Bottom' }, translate: { y: 23 }, opacity: 0 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
