import { SkewPushY } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function SkewPushYPage() {
  return (
    <div>
      <h2>SkewPushY — 交叉斜切</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 默认</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — isReversed</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          isReversed
          items={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 每图自定义 skewIn/skewOut</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          items={[
            { url: getWechat300x300(1), skewIn: 'L', skewOut: 'R' },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'L' },
            { url: getWechat300x300(3), skewIn: 'L', skewOut: 'L' },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 每图自定义 stay/switch</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          items={[
            { url: getWechat300x300(1), stayDuration: 3, switchDuration: 1 },
            { url: getWechat300x300(2), stayDuration: 1, switchDuration: 3 },
            { url: getWechat300x300(3), stayDuration: 2, switchDuration: 2 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — skewAngle=30</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          skewAngle={30}
          items={[
            { url: getWechat300x300(1), skewIn: 'L', skewOut: 'R' },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'L' },
            { url: getWechat300x300(3), skewIn: 'L', skewOut: 'L' },
          ]}
        />
      </div>
    </div>
  )
}
