import { AnySkewPush } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function AnySkewPushPage() {
  return (
    <div>
      <h2>AnySkewPush — 四方向斜切</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — T→B→T→B（上下交替）</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'T', stayDuration: 0 },
            { url: getWechat300x300(2), direction: 'B', stayDuration: 0 },
            { url: getWechat300x300(3), direction: 'T', stayDuration: 0 },
            { url: getWechat300x300(4), direction: 'B', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — L→R→L→R（左右交替）</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'L', stayDuration: 0 },
            { url: getWechat300x300(2), direction: 'R', stayDuration: 0 },
            { url: getWechat300x300(3), direction: 'L', stayDuration: 0 },
            { url: getWechat300x300(4), direction: 'R', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 顺时针 T→R→B→L</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'T', stayDuration: 0 },
            { url: getWechat300x300(2), direction: 'R', stayDuration: 0 },
            { url: getWechat300x300(3), direction: 'B', stayDuration: 0 },
            { url: getWechat300x300(4), direction: 'L', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 逆时针 T→L→B→R</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'T', stayDuration: 0 },
            { url: getWechat300x300(2), direction: 'L', stayDuration: 0 },
            { url: getWechat300x300(3), direction: 'B', stayDuration: 0 },
            { url: getWechat300x300(4), direction: 'R', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — skewAngle=30</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          skewAngle={30}
          childItems={[
            { url: getWechat300x300(1), direction: 'T', stayDuration: 0 },
            { url: getWechat300x300(2), direction: 'R', stayDuration: 0 },
            { url: getWechat300x300(3), direction: 'B', stayDuration: 0 },
            { url: getWechat300x300(4), direction: 'L', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 每图自定义 skewIn/skewOut</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), direction: 'T', skewIn: 'L', skewOut: 'R', stayDuration: 0 },
            { url: getWechat300x300(2), direction: 'R', skewIn: 'L', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(3), direction: 'B', skewIn: 'R', skewOut: 'L', stayDuration: 0 },
            { url: getWechat300x300(4), direction: 'L', skewIn: 'R', skewOut: 'R', stayDuration: 0 },
          ]}
        />
      </div>
    </div>
  )
}
