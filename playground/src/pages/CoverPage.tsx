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
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 方向 L</h3>
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'L' },
            { url: getWechat300x300(2), direction: 'L' },
            { url: getWechat300x300(3), direction: 'L' },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 混合方向</h3>
        <CoverIn
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B', coverDuration: 0.6 },
            { url: getWechat300x300(2), direction: 'R', coverDuration: 0.4 },
            { url: getWechat300x300(3), direction: 'T', coverDuration: 0.5 },
            { url: getWechat300x300(4), direction: 'L', coverDuration: 0.3 },
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
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 方向 L</h3>
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'L' },
            { url: getWechat300x300(2), direction: 'L' },
            { url: getWechat300x300(3), direction: 'L' },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 混合方向</h3>
        <CoverOut
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'B', coverDuration: 0.6 },
            { url: getWechat300x300(2), direction: 'R', coverDuration: 0.4 },
            { url: getWechat300x300(3), direction: 'T', coverDuration: 0.5 },
            { url: getWechat300x300(4), direction: 'L', coverDuration: 0.3 },
          ]}
        />
      </div>
    </div>
  )
}
