import { AnySkewPush } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function AnySkewPushPage() {
  return (
    <div>
      <h2>AnySkewPush — 四方向斜切推入</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — T→B→T→B（上下交替，无 skew）</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T' }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'B' }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'T' }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'B' }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — T→B→T→B，entry skewX 15°</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', skew: { type: 'X', angle: 15 } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'B', skew: { type: 'X', angle: -15 } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'T', skew: { type: 'X', angle: 15 } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'B', skew: { type: 'X', angle: -15 } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 顺时针 T→R→B→L，entry + exit skew</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', skew: { type: 'X', angle: 15 } }, exit: { skew: { type: 'X', angle: -15 } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'R', skew: { type: 'Y', angle: 15 } }, exit: { skew: { type: 'Y', angle: -15 } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'B', skew: { type: 'X', angle: -15 } }, exit: { skew: { type: 'X', angle: 15 } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'L', skew: { type: 'Y', angle: -15 } }, exit: { skew: { type: 'Y', angle: 15 } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — rotation 360° Center</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', rotation: { angle: 360 } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'B', rotation: { angle: -360 } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'T', rotation: { angle: 360 } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'B', rotation: { angle: -360 } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — rotation 360° TopLeft</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', rotation: { angle: 360, origin: 'TopLeft' } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'B', rotation: { angle: -360, origin: 'TopLeft' } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'T', rotation: { angle: 360, origin: 'TopLeft' } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'B', rotation: { angle: -360, origin: 'TopLeft' } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — rotation 360° BottomRight</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', rotation: { angle: 360, origin: 'BottomRight' } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'B', rotation: { angle: -360, origin: 'BottomRight' } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'T', rotation: { angle: 360, origin: 'BottomRight' } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'B', rotation: { angle: -360, origin: 'BottomRight' } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>{'4 图 — rotation 360° 自定义坐标 { cx: 50, cy: -50 }'}</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', rotation: { angle: 360, origin: { cx: 50, cy: -50 } } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'B', rotation: { angle: -360, origin: { cx: 50, cy: -50 } } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'T', rotation: { angle: 360, origin: { cx: 50, cy: -50 } } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'B', rotation: { angle: -360, origin: { cx: 50, cy: -50 } } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — L→R→L→R，skewY 30°</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'L', skew: { type: 'Y', angle: 30 } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'R', skew: { type: 'Y', angle: -30 } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'L', skew: { type: 'Y', angle: 30 } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'R', skew: { type: 'Y', angle: -30 } }, stayDuration: 0 },
          ]}
        />
      </div>
    </div>
  )
}
