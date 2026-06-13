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
      <h2>AnyCarousel — 单向 CoverFlow 轮播（CoverFlow 基座）</h2>

      <CopyDemo title="基础（正向，右进左出）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          itemCanvasSize={{ w: 300, h: 400 }}
          itemGap={100}
          itemScale={1.4}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="反向（isReversed）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          itemCanvasSize={{ w: 300, h: 400 }}
          itemGap={100}
          itemScale={1.4}
          isReversed
          childItems={[
            { url: getWechat300x500(4) },
            { url: getWechat300x500(5) },
            { url: getWechat300x500(6) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快速切换（switchDuration=0.3, stayDuration=0.5）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          itemCanvasSize={{ w: 300, h: 400 }}
          itemGap={100}
          itemScale={1.4}
          childItems={[
            { url: getWechat300x500(7), switchDuration: 0.3, stayDuration: 0.5 },
            { url: getWechat300x500(8), switchDuration: 0.3, stayDuration: 0.5 },
            { url: getWechat300x500(9), switchDuration: 0.3, stayDuration: 0.5 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="顶部对齐（itemAlign=top）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 500 }}
          itemCanvasSize={{ w: 300, h: 400 }}
          itemGap={100}
          itemScale={1.4}
          itemAlign="top"
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
