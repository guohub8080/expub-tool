import { useRef, useState } from 'react'
import { DIRECTION_8 } from 'expub-tool/svg'
import { StackCarousel } from 'expub-tool/svg'
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

export default function StackCarouselPage() {
  return (
    <div>
      <h2>StackCarousel — 两点定方向的叠层轮播</h2>

      <CopyDemo title="默认（水平）— tailChild 缺省向右延伸，4 图">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="mainChild 偏移（中心从 540,540 上移到 540,300）">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900, centerX: 540, centerY: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="斜向叠层 — tailChild 在右下 (980,900)、scale 0.2，showStackNum=5">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纵向叠层 — tailChild 在下方 (540,970)、scale 0.3，showStackNum=4">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.3, centerX: 540, centerY: 970 }}
          showStackNum={4}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="showStackNum=2 — 仅 tail + center 两层">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          showStackNum={2}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="八方向退场 (L/R/T/B/TL/TR/BL/BR)">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(2), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(3), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Top } },
            { url: getWechat300x300(4), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Bottom } },
            { url: getWechat300x300(5), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.TopLeft } },
            { url: getWechat300x300(6), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.TopRight } },
            { url: getWechat300x300(7), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.BottomLeft } },
            { url: getWechat300x300(8), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.BottomRight } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="四面八方退场 + 长短不一的停留">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 2.5, exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(2), switchDuration: 1.2, stayDuration: 0.3, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(3), switchDuration: 0.8, stayDuration: 1.5, exit: { direction: DIRECTION_8.Top } },
            { url: getWechat300x300(4), switchDuration: 0.4, stayDuration: 3,   exit: { direction: DIRECTION_8.Bottom } },
            { url: getWechat300x300(5), switchDuration: 1,   stayDuration: 0.8, exit: { direction: DIRECTION_8.Left } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="退场 skew + rotate + scale">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Left, skew: { type: "Y", angle: 15 }, scale: 0.8 } },
            { url: getWechat300x300(2), switchDuration: 0.8, stayDuration: 1, exit: { direction: DIRECTION_8.Right, rotation: { pivot: "TopRight", angle: 25 }, scale: 1.2 } },
            { url: getWechat300x300(3), switchDuration: 0.5, stayDuration: 1, exit: { direction: DIRECTION_8.Top, skew: { type: "X", angle: -10 }, rotation: { pivot: "BottomLeft", angle: -15 } } },
            { url: getWechat300x300(4), switchDuration: 1, stayDuration: 1, exit: { direction: DIRECTION_8.Bottom, skew: { type: "Y", angle: 20 }, rotation: { angle: 30 }, scale: 0.5 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="反向水平叠层 — tailChild 在左侧 (320,540)、scale 0.65，退场默认朝右">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.65, centerX: 320, centerY: 540 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 1.5, exit: { scale: 0.6 } },
            { url: getWechat300x300(2), switchDuration: 1,   stayDuration: 0.5, exit: { scale: 1.3 } },
            { url: getWechat300x300(3), switchDuration: 0.8, stayDuration: 2,   exit: { scale: 0.4 } },
            { url: getWechat300x300(4), switchDuration: 0.3, stayDuration: 3,   exit: { scale: 1.5 } },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
