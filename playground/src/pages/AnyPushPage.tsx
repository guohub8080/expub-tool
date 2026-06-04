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

/** 带呼吸圆圈的自定义 SVG item */
const BreatheCircleItem = () => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundColor: '#1e293b' }}>
    <rect x="50" y="100" width="200" height="300" rx="16" fill="#334155" />
    <g transform="translate(120, 430)">
      <circle cx="30" cy="15" r="15" fill="#60a5fa" opacity="0.8">
        {transformBreathe({ origin: [30, 15], fromScale: 1, toScale: 1.4 })}
      </circle>
    </g>
    <text x="150" y="250" textAnchor="middle" fill="#f1f5f9" fontSize="24" fontFamily="system-ui">
      Item 模式
    </text>
  </svg>
)

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

      <CopyDemo title="基础推入切换 — 2 张图，默认方向">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1) },
            { url: getWechat300x500(2) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="3 张图 — 混合方向">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(3), direction: DIRECTION_8.Right },
            { url: getWechat300x500(4), direction: DIRECTION_8.Top },
            { url: getWechat300x500(5), direction: DIRECTION_8.Left },
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

      <CopyDemo title="单方向连续滚动 — 全部从右侧进入">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(3), direction: DIRECTION_8.Right, switchDuration: 0.6, stayDuration: 0.4 },
            { url: getWechat300x500(4), direction: DIRECTION_8.Right, switchDuration: 0.6, stayDuration: 0.4 },
            { url: getWechat300x500(5), direction: DIRECTION_8.Right, switchDuration: 0.6, stayDuration: 0.4 },
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

      <CopyDemo title="Item 模式 — 自定义 SVG 内容">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { item: <BreatheCircleItem />, direction: DIRECTION_8.Right },
            { item: <ColorBlockItem color="#7c3aed" label="Purple" />, direction: DIRECTION_8.Left },
            { item: <ColorBlockItem color="#059669" label="Green" />, direction: DIRECTION_8.Top },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="混合模式 — url + item 混用">
        <AnyPush
          canvasSize={{ w: 300, h: 500 }}
          childItems={[
            { url: getWechat300x500(1), direction: DIRECTION_8.Right },
            { item: <ColorBlockItem color="#dc2626" label="Red" />, direction: DIRECTION_8.Left },
            { url: getWechat300x500(3), direction: DIRECTION_8.Top },
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
