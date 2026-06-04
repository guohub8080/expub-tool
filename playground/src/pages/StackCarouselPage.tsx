import { useRef, useState } from 'react'
import { DIRECTION_8 } from 'expub-tool/svg'
import { StackCarouselX, StackCarouselY } from 'expub-tool/svg'
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
      <h2>StackCarouselX — 横向叠层轮播</h2>

      <CopyDemo title="4 图 — 默认参数">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="8 图 — 八方向退场 (L/R/T/B/TL/TR/BL/BR)">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 900, h: 900 }}
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

      <CopyDemo title="5 图 — 四面八方退场 + 长短不一的停留">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 2.5, exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(2), switchDuration: 1.2, stayDuration: 0.3, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(3), switchDuration: 0.8, stayDuration: 1.5, exit: { direction: DIRECTION_8.Top } },
            { url: getWechat300x300(4), switchDuration: 0.4, stayDuration: 3,   exit: { direction: DIRECTION_8.Bottom } },
            { url: getWechat300x300(5), switchDuration: 1,   stayDuration: 0.8, exit: { direction: DIRECTION_8.Left } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="小卡牌 600×600 — 四周留白大">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 600, h: 600 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 1.5, exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(2), switchDuration: 0.8, stayDuration: 1, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(3), switchDuration: 0.6, stayDuration: 2, exit: { direction: DIRECTION_8.Top } },
            { url: getWechat300x300(4), switchDuration: 1, stayDuration: 0.5, exit: { direction: DIRECTION_8.Bottom } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="反向 + 退场缩放 + 偏移">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 900, h: 900 }}
          backOffset={200}
          isReversed
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 1.5, exit: { direction: DIRECTION_8.Left, scale: 0.6 } },
            { url: getWechat300x300(2), switchDuration: 1,   stayDuration: 0.5, exit: { direction: DIRECTION_8.Right, scale: 1.3 } },
            { url: getWechat300x300(3), switchDuration: 0.8, stayDuration: 2,   exit: { direction: DIRECTION_8.Left, scale: 0.4 } },
            { url: getWechat300x300(4), switchDuration: 0.3, stayDuration: 3,   exit: { direction: DIRECTION_8.Right, scale: 1.5 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="退场 skew + rotate + scale">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Left, skew: { type: "Y", angle: 15 }, scale: 0.8 } },
            { url: getWechat300x300(2), switchDuration: 0.8, stayDuration: 1, exit: { direction: DIRECTION_8.Right, rotation: { origin: "TopRight", angle: 25 }, scale: 1.2 } },
            { url: getWechat300x300(3), switchDuration: 0.5, stayDuration: 1, exit: { direction: DIRECTION_8.Top, skew: { type: "X", angle: -10 }, rotation: { origin: "BottomLeft", angle: -15 } } },
            { url: getWechat300x300(4), switchDuration: 1, stayDuration: 1, exit: { direction: DIRECTION_8.Bottom, skew: { type: "Y", angle: 20 }, rotation: { angle: 30 }, scale: 0.5 } },
          ]}
        />
      </CopyDemo>

      <h2 style={{ marginTop: 32 }}>StackCarouselY — 纵向叠层轮播</h2>

      <CopyDemo title="5 图纵向 — 四面八方退场 + 长短停留">
        <StackCarouselY
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 2,   exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(2), switchDuration: 1,   stayDuration: 0.5, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(3), switchDuration: 0.3, stayDuration: 3,   exit: { direction: DIRECTION_8.Top } },
            { url: getWechat300x300(4), switchDuration: 0.8, stayDuration: 1,   exit: { direction: DIRECTION_8.Bottom } },
            { url: getWechat300x300(5), switchDuration: 1.2, stayDuration: 0.2, exit: { direction: DIRECTION_8.Left } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纵向反向 + 极端时间差">
        <StackCarouselY
          canvasSize={{ w: 1080, h: 1080 }}
          mainChildItemSize={{ w: 900, h: 900 }}
          isReversed
          childItems={[
            { url: getWechat300x300(6), switchDuration: 0.2, stayDuration: 3.5, exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(7), switchDuration: 1.5, stayDuration: 0.3, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(8), switchDuration: 0.6, stayDuration: 1.5, exit: { direction: DIRECTION_8.Right } },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
