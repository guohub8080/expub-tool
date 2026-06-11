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
      <h2>AnyCarousel — 通用轨道轮播</h2>

      <CopyDemo title="水平 CoverFlow（angle=0, scale.centerValue=1.4）">
        <AnyCarousel
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={100}
          childItems={[
            { url: getWechat300x500(1), scale: { centerValue: 1.4 } },
            { url: getWechat300x500(2), scale: { centerValue: 1.4 } },
            { url: getWechat300x500(3), scale: { centerValue: 1.4 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="垂直轮播（angle=90, scale.centerValue=1.4）">
        <AnyCarousel
          canvasSize={{ w: 600, h: 1000 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={90}
          itemGap={100}
          childItems={[
            { url: getWechat300x500(4), scale: { centerValue: 1.4 } },
            { url: getWechat300x500(5), scale: { centerValue: 1.4 } },
            { url: getWechat300x500(6), scale: { centerValue: 1.4 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="对角线（angle=45, scale + opacity）">
        <AnyCarousel
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={45}
          itemGap={80}
          childItems={[
            { url: getWechat300x500(7), scale: { centerValue: 1.3 }, opacity: { centerValue: 1, sideValue: 0.5 } },
            { url: getWechat300x500(8), scale: { centerValue: 1.3 }, opacity: { centerValue: 1, sideValue: 0.5 } },
            { url: getWechat300x500(9), scale: { centerValue: 1.3 }, opacity: { centerValue: 1, sideValue: 0.5 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="反向水平（angle=180, scale.centerValue=1.3）">
        <AnyCarousel
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={180}
          itemGap={80}
          childItems={[
            { url: getWechat300x500(1), scale: { centerValue: 1.3 } },
            { url: getWechat300x500(2), scale: { centerValue: 1.3 } },
            { url: getWechat300x500(3), scale: { centerValue: 1.3 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纯透明度（无缩放，angle=0）">
        <AnyCarousel
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={40}
          childItems={[
            { url: getWechat300x500(4), opacity: { centerValue: 1, sideValue: 0.2 } },
            { url: getWechat300x500(5), opacity: { centerValue: 1, sideValue: 0.2 } },
            { url: getWechat300x500(6), opacity: { centerValue: 1, sideValue: 0.2 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="旋转入场（rotation.sideValue=15）">
        <AnyCarousel
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={60}
          childItems={[
            { url: getWechat300x500(7), rotation: { sideValue: 15, centerValue: 0 }, scale: { centerValue: 1.2 } },
            { url: getWechat300x500(8), rotation: { sideValue: 15, centerValue: 0 }, scale: { centerValue: 1.2 } },
            { url: getWechat300x500(9), rotation: { sideValue: 15, centerValue: 0 }, scale: { centerValue: 1.2 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快速切换（switchDuration=0.3, stayDuration=0.5）">
        <AnyCarousel
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={80}
          childItems={[
            { url: getWechat300x500(1), switchDuration: 0.3, stayDuration: 0.5, scale: { centerValue: 1.4 } },
            { url: getWechat300x500(2), switchDuration: 0.3, stayDuration: 0.5, scale: { centerValue: 1.4 } },
            { url: getWechat300x500(3), switchDuration: 0.3, stayDuration: 0.5, scale: { centerValue: 1.4 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="4 图混搭（不同 scale/opacity/keySplines）">
        <AnyCarousel
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={80}
          childItems={[
            { url: getWechat300x500(4), scale: { centerValue: 1.5 }, opacity: { centerValue: 1, sideValue: 0.3 } },
            { url: getWechat300x500(5), scale: { centerValue: 1.3 }, opacity: { centerValue: 1, sideValue: 0.5 }, switchDuration: 0.3 },
            { url: getWechat300x500(6), scale: { centerValue: 1.4 }, opacity: { centerValue: 1, sideValue: 0.4 } },
            { url: getWechat300x500(7), scale: { centerValue: 1.2 }, opacity: { centerValue: 1, sideValue: 0.6 }, switchDuration: 0.8 },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
