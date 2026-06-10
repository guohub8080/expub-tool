import { CoverIn, CoverOut } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function CoverPage() {
  return (
    <div>
      <h2>CoverIn — 层层覆盖滑入</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 默认方向 (B)</h3>
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 8 方向混合</h3>
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B' },
            { url: getWechat300x300(2), direction: 'TR' },
            { url: getWechat300x300(3), direction: 'L' },
            { url: getWechat300x300(4), direction: 'BL' },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>8 图 — 每张不同方向</h3>
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
      </div>

      <h2>CoverOut — 层层覆盖滑出</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 默认方向 (B)</h3>
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 8 方向混合</h3>
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B' },
            { url: getWechat300x300(2), direction: 'TR' },
            { url: getWechat300x300(3), direction: 'L' },
            { url: getWechat300x300(4), direction: 'BL' },
          ]}
        />
      </div>
    </div>
  )
}
