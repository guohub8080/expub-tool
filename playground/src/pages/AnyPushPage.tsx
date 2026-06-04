import { useRef, useState } from 'react'
import { DIRECTION_8 } from 'expub-tool/svg'
import { AnyPush } from 'expub-tool/svg'
import { transformBreathe } from 'expub-tool/behaviors'
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

/** 色块 item */
const ColorBlockItem = ({ color, label }: { color: string; label: string }) => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundColor: color }}>
    <text x="150" y="260" textAnchor="middle" fill="white" fontSize="32" fontFamily="system-ui">
      {label}
    </text>
  </svg>
)

export default function AnyPushPage() {
  return (
    <div>
      <h2>AnyPush — 推入切换</h2>

      <CopyDemo title="基础推入切换 — 2 张图，默认方向 (Left)">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="3 张图 — 四方向混合 (Right / Bottom / Left)">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(3), direction: DIRECTION_8.Right },
            { url: getWechat300x500(4), direction: DIRECTION_8.Bottom },
            { url: getWechat300x500(5), direction: DIRECTION_8.Left },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="对角线方向 — 4 图各占一角 (TopLeft / TopRight / BottomLeft / BottomRight)">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1), direction: DIRECTION_8.TopLeft },
            { url: getWechat300x500(2), direction: DIRECTION_8.TopRight },
            { url: getWechat300x500(3), direction: DIRECTION_8.BottomLeft },
            { url: getWechat300x500(4), direction: DIRECTION_8.BottomRight },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="8 方向轮播 — 每张图不同方向">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1), direction: DIRECTION_8.Left, switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x500(2), direction: DIRECTION_8.TopRight, switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x500(3), direction: DIRECTION_8.Bottom, switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x500(4), direction: DIRECTION_8.TopLeft, switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x500(5), direction: DIRECTION_8.Right, switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x500(6), direction: DIRECTION_8.BottomRight, switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x500(7), direction: DIRECTION_8.Top, switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x500(8), direction: DIRECTION_8.BottomLeft, switchDuration: 0.4, stayDuration: 0.3 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快速切换 — switchDuration=0.3, stayDuration=0.2">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(6), switchDuration: 0.3, stayDuration: 0.2 },
            { url: getWechat300x500(7), switchDuration: 0.3, stayDuration: 0.2 },
            { url: getWechat300x500(8), switchDuration: 0.3, stayDuration: 0.2 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="跑马灯 — stayDuration=0, 线性匀速">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1), direction: DIRECTION_8.Right, switchDuration: 0.8, stayDuration: 0, keySplines: "0 0 1 1" },
            { url: getWechat300x500(2), direction: DIRECTION_8.Right, switchDuration: 0.8, stayDuration: 0, keySplines: "0 0 1 1" },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="上下交替">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(6), direction: DIRECTION_8.Top },
            { url: getWechat300x500(7), direction: DIRECTION_8.Bottom },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="背景色 canvasBg">
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <AnyPush
              canvasSize={{ w: 300, h: 500 }}
              canvasBg="#0f172a"
              childItems={[
                { url: getWechat300x500(1), direction: DIRECTION_8.Right },
                { url: getWechat300x500(2), direction: DIRECTION_8.Left },
              ]}
            />
          </div>
          <div style={{ flex: 1 }}>
            <AnyPush
              canvasSize={{ w: 300, h: 500 }}
              canvasBg="#fef3c7"
              childItems={[
                { url: getWechat300x500(3), direction: DIRECTION_8.Top },
                { url: getWechat300x500(4), direction: DIRECTION_8.BottomLeft },
              ]}
            />
          </div>
        </div>
      </CopyDemo>

      <CopyDemo title="Item 模式 — 自定义 SVG 内容">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { item: <ColorBlockItem color="#7c3aed" label="Purple" />, direction: DIRECTION_8.Right },
            { item: <ColorBlockItem color="#059669" label="Green" />, direction: DIRECTION_8.TopLeft },
            { item: <ColorBlockItem color="#dc2626" label="Red" />, direction: DIRECTION_8.BottomRight },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="混合模式 — url + item 混用">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1), direction: DIRECTION_8.Right },
            { item: <ColorBlockItem color="#dc2626" label="Red" />, direction: DIRECTION_8.TopLeft },
            { url: getWechat300x500(3), direction: DIRECTION_8.Bottom },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="单图自动复制">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(9) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
