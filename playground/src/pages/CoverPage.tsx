import { CoverIn, CoverOut } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const ColorBlock = ({ color, label }: { color: string; label: string }) => (
  <svg viewBox="0 0 300 300" style={{ width: '100%', display: 'block', backgroundColor: color }}>
    <text x="150" y="160" textAnchor="middle" fill="white" fontSize="32" fontFamily="system-ui">
      {label}
    </text>
  </svg>
)

const Demo = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
    <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
    {children}
  </div>
)

export default function CoverPage() {
  return (
    <div>
      <h2>CoverIn — 层层覆盖滑入</h2>

      <Demo title="3 图 — 默认方向 (B)">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </Demo>

      <Demo title="3 图 — 方向 L（从右往左滑入）">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'L' },
            { url: getWechat300x300(2), direction: 'L' },
            { url: getWechat300x300(3), direction: 'L' },
          ]}
        />
      </Demo>

      <Demo title="3 图 — 方向 T（从下往上滑入）">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'T' },
            { url: getWechat300x300(2), direction: 'T' },
            { url: getWechat300x300(3), direction: 'T' },
          ]}
        />
      </Demo>

      <Demo title="3 图 — 对角线方向 TL / TR / BL">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'TL' },
            { url: getWechat300x300(2), direction: 'TR' },
            { url: getWechat300x300(3), direction: 'BL' },
          ]}
        />
      </Demo>

      <Demo title="4 图 — 每张不同方向">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B' },
            { url: getWechat300x300(2), direction: 'TR' },
            { url: getWechat300x300(3), direction: 'L' },
            { url: getWechat300x300(4), direction: 'BL' },
          ]}
        />
      </Demo>

      <Demo title="8 图 — 8 方向轮播，快速切换">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B', switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x300(2), direction: 'TR', switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x300(3), direction: 'L', switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x300(4), direction: 'TL', switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x300(5), direction: 'T', switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x300(6), direction: 'BR', switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x300(7), direction: 'R', switchDuration: 0.4, stayDuration: 0.3 },
            { url: getWechat300x300(8), direction: 'BL', switchDuration: 0.4, stayDuration: 0.3 },
          ]}
        />
      </Demo>

      <Demo title="2 图 — 慢速 (switchDuration=1.5)">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'R', switchDuration: 1.5, stayDuration: 1 },
            { url: getWechat300x300(2), direction: 'L', switchDuration: 1.5, stayDuration: 1 },
          ]}
        />
      </Demo>

      <Demo title="5 图 — 每张不同 switchDuration / stayDuration">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.3, stayDuration: 1.0 },
            { url: getWechat300x300(2), switchDuration: 0.8, stayDuration: 0.2 },
            { url: getWechat300x300(3), switchDuration: 0.5, stayDuration: 0.5 },
            { url: getWechat300x300(4), switchDuration: 1.2, stayDuration: 0.8 },
            { url: getWechat300x300(5), switchDuration: 0.2, stayDuration: 0.3 },
          ]}
        />
      </Demo>

      <Demo title="1 图 — 自动复制">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'TR' },
          ]}
        />
      </Demo>

      <Demo title="3 图 — jsx 模式（色块）">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { jsx: <ColorBlock color="#7c3aed" label="Purple" />, direction: 'B' },
            { jsx: <ColorBlock color="#059669" label="Green" />, direction: 'L' },
            { jsx: <ColorBlock color="#dc2626" label="Red" />, direction: 'TR' },
          ]}
        />
      </Demo>

      <Demo title="3 图 — url + jsx 混用">
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B' },
            { jsx: <ColorBlock color="#2563eb" label="Blue" />, direction: 'L' },
            { url: getWechat300x300(3), direction: 'TR' },
          ]}
        />
      </Demo>

      <h2>CoverOut — 层层覆盖滑出</h2>

      <Demo title="3 图 — 默认方向 (B)">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </Demo>

      <Demo title="3 图 — 方向 L">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'L' },
            { url: getWechat300x300(2), direction: 'L' },
            { url: getWechat300x300(3), direction: 'L' },
          ]}
        />
      </Demo>

      <Demo title="3 图 — 对角线方向 TL / TR / BL">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'TL' },
            { url: getWechat300x300(2), direction: 'TR' },
            { url: getWechat300x300(3), direction: 'BL' },
          ]}
        />
      </Demo>

      <Demo title="4 图 — 每张不同方向">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B' },
            { url: getWechat300x300(2), direction: 'TR' },
            { url: getWechat300x300(3), direction: 'L' },
            { url: getWechat300x300(4), direction: 'BL' },
          ]}
        />
      </Demo>

      <Demo title="5 图 — 每张不同 switchDuration / stayDuration">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.3, stayDuration: 1.0 },
            { url: getWechat300x300(2), switchDuration: 0.8, stayDuration: 0.2 },
            { url: getWechat300x300(3), switchDuration: 0.5, stayDuration: 0.5 },
            { url: getWechat300x300(4), switchDuration: 1.2, stayDuration: 0.8 },
            { url: getWechat300x300(5), switchDuration: 0.2, stayDuration: 0.3 },
          ]}
        />
      </Demo>

      <Demo title="2 图 — 慢速 (switchDuration=1.5)">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'R', switchDuration: 1.5, stayDuration: 1 },
            { url: getWechat300x300(2), direction: 'L', switchDuration: 1.5, stayDuration: 1 },
          ]}
        />
      </Demo>

      <Demo title="1 图 — 自动复制">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'TR' },
          ]}
        />
      </Demo>

      <Demo title="3 图 — jsx 模式（色块）">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { jsx: <ColorBlock color="#7c3aed" label="Purple" />, direction: 'B' },
            { jsx: <ColorBlock color="#059669" label="Green" />, direction: 'L' },
            { jsx: <ColorBlock color="#dc2626" label="Red" />, direction: 'TR' },
          ]}
        />
      </Demo>

      <Demo title="3 图 — url + jsx 混用">
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B' },
            { jsx: <ColorBlock color="#2563eb" label="Blue" />, direction: 'L' },
            { url: getWechat300x300(3), direction: 'TR' },
          ]}
        />
      </Demo>
    </div>
  )
}
