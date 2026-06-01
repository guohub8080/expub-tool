import { SkewPushY } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function SkewPushYPage() {
  return (
    <div>
      <h2>SkewPushY — 交叉斜切</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 默认（stay=0）</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), stayDuration: 0 },
            { url: getWechat300x300(2), stayDuration: 0 },
            { url: getWechat300x300(3), stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 全部 R→L（stay=0）</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), skewIn: 'R', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(3), skewIn: 'R', skewOut: 'L', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — L→R, R→L, L→L（stay=0）</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), skewIn: 'L', skewOut: 'R', stayDuration: 0 },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(3), skewIn: 'L', skewOut: 'L', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — R→R, L→R, R→L（stay=0）</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), skewIn: 'R', skewOut: 'R', stayDuration: 0 },
            { url: getWechat300x300(2), skewIn: 'L', skewOut: 'R', stayDuration: 0 },
            { url: getWechat300x300(3), skewIn: 'R', skewOut: 'L', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 全部 L→L（stay=0）</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), skewIn: 'L', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(2), skewIn: 'L', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(3), skewIn: 'L', skewOut: 'L', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — 全部 R→R（stay=0）</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), skewIn: 'R', skewOut: 'R', stayDuration: 0 },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'R', stayDuration: 0 },
            { url: getWechat300x300(3), skewIn: 'R', skewOut: 'R', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — skewAngle=30, stay=0</h3>
        <SkewPushY
          canvasSize={{ w: 300, h: 300 }}
          skewAngle={30}
          childItems={[
            { url: getWechat300x300(1), skewIn: 'L', skewOut: 'R', stayDuration: 0 },
            { url: getWechat300x300(2), skewIn: 'R', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(3), skewIn: 'L', skewOut: 'L', stayDuration: 0 },
          ]}
        />
      </div>
    </div>
  )
}
