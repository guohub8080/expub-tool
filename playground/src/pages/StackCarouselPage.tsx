import { useRef, useState } from 'react'
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

      <CopyDemo title="4 图 — 默认参数（参考卡牌轮播-135）">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          pics={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3), link: "www.baidu.com" },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快速切换 — switchDuration=0.5, stayDuration=0.5">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          pics={[
            { url: getWechat300x300(5), switchDuration: 0.5, stayDuration: 0.5 },
            { url: getWechat300x300(6), switchDuration: 0.5, stayDuration: 0.5 },
            { url: getWechat300x300(7), switchDuration: 0.5, stayDuration: 0.5 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="自定义缩放 — scales=[0.6, 0.75, 0.9], backOffset=200">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          scales={[0.6, 0.75, 0.9]}
          backOffset={200}
          pics={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </CopyDemo>

      <h2 style={{ marginTop: 32 }}>StackCarouselY — 纵向叠层轮播</h2>

      <CopyDemo title="4 图纵向 — 默认参数">
        <StackCarouselY
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          pics={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3), link: "www.baidu.com" },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
