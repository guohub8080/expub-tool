import { useRef, useState } from 'react'
import { CoverFlowX, CoverFlowY } from 'expub-tool/svg'
import { getPowerBezier } from 'expub-tool/smil'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const power3 = getPowerBezier({ power: 3, isIn: false, isOut: true })

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

const ColorBlockItem = ({ color, label }: { color: string; label: string }) => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundColor: color }}>
    <text x="150" y="260" textAnchor="middle" fill="white" fontSize="32" fontFamily="system-ui">
      {label}
    </text>
  </svg>
)

export default function CoverFlowPage() {
  return (
    <div>
      <h2>CoverFlowX — 横向轮播</h2>

      <CopyDemo title="3 图轮播 — 默认参数">
        <CoverFlowX
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 400, h: 600 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="3 图 — itemScale=1.4, itemGap=100">
        <CoverFlowX
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          itemScale={1.4}
          itemGap={100}
          childItems={[
            { url: getWechat300x500(3), keySplines: power3 },
            { url: getWechat300x500(4), keySplines: power3 },
            { url: getWechat300x500(5), keySplines: power3 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="反向 — reverse">
        <CoverFlowX
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          itemScale={1.4}
          itemGap={100}
          isReversed
          childItems={[
            { url: getWechat300x500(3), keySplines: power3 },
            { url: getWechat300x500(4), keySplines: power3 },
            { url: getWechat300x500(5), keySplines: power3 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快速切换 — switchDuration=0.3, stayDuration=0.5">
        <CoverFlowX
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(3), switchDuration: 0.3, stayDuration: 0.5 },
            { url: getWechat300x500(4), switchDuration: 0.3, stayDuration: 0.5 },
            { url: getWechat300x500(5), switchDuration: 0.3, stayDuration: 0.5 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="上对齐 — itemAlign=top">
        <CoverFlowX
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          itemAlign="top"
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="下对齐 — itemAlign=bottom">
        <CoverFlowX
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          itemAlign="bottom"
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
            { url: getWechat300x500(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="Item 模式 — 自定义 SVG">
        <CoverFlowX
          canvasSize={{ w: 1000, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          itemGap={80}
          itemScale={1.3}
          childItems={[
            { item: <ColorBlockItem color="#dc2626" label="Red" /> },
            { item: <ColorBlockItem color="#2563eb" label="Blue" /> },
            { item: <ColorBlockItem color="#059669" label="Green" /> },
          ]}
        />
      </CopyDemo>

      <h2 style={{ marginTop: 32 }}>CoverFlowY — 纵向轮播</h2>

      <CopyDemo title="3 图纵向 — 默认参数">
        <CoverFlowY
          canvasSize={{ w: 600, h: 1000 }}
          itemCanvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纵向 — 反向">
        <CoverFlowY
          canvasSize={{ w: 600, h: 1000 }}
          itemCanvasSize={{ w: 300, h: 300 }}
          isReversed
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纵向 — 左对齐 itemAlign=left">
        <CoverFlowY
          canvasSize={{ w: 600, h: 1000 }}
          itemCanvasSize={{ w: 300, h: 300 }}
          itemAlign="left"
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纵向 — 右对齐 itemAlign=right">
        <CoverFlowY
          canvasSize={{ w: 600, h: 1000 }}
          itemCanvasSize={{ w: 300, h: 300 }}
          itemAlign="right"
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}