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

      <CopyDemo title="4 图 — 默认参数">
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

      <CopyDemo title="每张不同速度 — sw/stay 精细调整">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          pics={[
            { url: getWechat300x300(1), switchDuration: 0.3, stayDuration: 2 },
            { url: getWechat300x300(2), switchDuration: 1,   stayDuration: 0.5 },
            { url: getWechat300x300(3), switchDuration: 0.6, stayDuration: 1.5 },
            { url: getWechat300x300(4), switchDuration: 0.8, stayDuration: 1 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="每张不同退场方向 — exitDirection per item">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          pics={[
            { url: getWechat300x300(1), exitDirection: "L" },
            { url: getWechat300x300(2), exitDirection: "R" },
            { url: getWechat300x300(3), exitDirection: "L" },
            { url: getWechat300x300(4), exitDirection: "R" },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="反向 isReversed + 快速切换">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          isReversed
          pics={[
            { url: getWechat300x300(5), switchDuration: 0.4, stayDuration: 0.6 },
            { url: getWechat300x300(6), switchDuration: 0.4, stayDuration: 0.6 },
            { url: getWechat300x300(7), switchDuration: 0.4, stayDuration: 0.6 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="自定义缩放 + 偏移 + 每张不同时间">
        <StackCarouselX
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          scales={[0.6, 0.75, 0.9]}
          backOffset={200}
          pics={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 2 },
            { url: getWechat300x300(2), switchDuration: 1.2, stayDuration: 0.3 },
            { url: getWechat300x300(3), switchDuration: 0.8, stayDuration: 1 },
          ]}
        />
      </CopyDemo>

      <h2 style={{ marginTop: 32 }}>StackCarouselY — 纵向叠层轮播</h2>

      <CopyDemo title="4 图纵向 — 每张不同速度 + 不同退场">
        <StackCarouselY
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          pics={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 1.5, exitDirection: "R" },
            { url: getWechat300x300(2), switchDuration: 0.8, stayDuration: 0.8, exitDirection: "L" },
            { url: getWechat300x300(3), switchDuration: 0.3, stayDuration: 2,   exitDirection: "R" },
            { url: getWechat300x300(4), switchDuration: 1,   stayDuration: 0.5, exitDirection: "L" },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纵向反向 — isReversed">
        <StackCarouselY
          canvasSize={{ w: 1080, h: 1080 }}
          itemCanvasSize={{ w: 972, h: 972 }}
          isReversed
          pics={[
            { url: getWechat300x300(5), switchDuration: 0.5, stayDuration: 1 },
            { url: getWechat300x300(6), switchDuration: 0.5, stayDuration: 1 },
            { url: getWechat300x300(7), switchDuration: 0.5, stayDuration: 1 },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
