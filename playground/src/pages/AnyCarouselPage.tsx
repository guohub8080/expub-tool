import { useRef, useState } from 'react'
import { AnyCarousel } from 'expub-tool/svg'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

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

      <CopyDemo title="中心放大（angle=0，centerChildConfig.scale=1.4）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          childCanvasSize={{ w: 300, h: 400 }}
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

      <CopyDemo title="向左（angle=180）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          childCanvasSize={{ w: 300, h: 400 }}
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

      <CopyDemo title="向上（angle=90）">
        <AnyCarousel
          canvasSize={{ w: 400, h: 700 }}
          childCanvasSize={{ w: 300, h: 400 }}
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

      <CopyDemo title="对角线（angle=45）">
        <AnyCarousel
          canvasSize={{ w: 700, h: 500 }}
          childCanvasSize={{ w: 300, h: 400 }}
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

      <CopyDemo title="四角色全配置（coverflow：中心放大、侧图缩小倾斜半透、屏外隐藏）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          childCanvasSize={{ w: 300, h: 400 }}
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

      <CopyDemo title="快速切换（switchDuration=0.3, stayDuration=0.5）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          childCanvasSize={{ w: 300, h: 400 }}
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
    </div>
  )
}
