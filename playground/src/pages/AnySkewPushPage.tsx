import { AnySkewPush } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function AnySkewPushPage() {
  return (
    <div>
      <h2>AnySkewPush — 四方向斜切</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — T→B→T→B（上下交替，无 skew）</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entryDirection: 'T', stayDuration: 0 },
            { url: getWechat300x300(2), entryDirection: 'B', stayDuration: 0 },
            { url: getWechat300x300(3), entryDirection: 'T', stayDuration: 0 },
            { url: getWechat300x300(4), entryDirection: 'B', stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — T→B→T→B，entrySkew skewX 15°</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entryDirection: 'T', stayDuration: 0, entrySkew: { type: 'X', angle: 15 } },
            { url: getWechat300x300(2), entryDirection: 'B', stayDuration: 0, entrySkew: { type: 'X', angle: -15 } },
            { url: getWechat300x300(3), entryDirection: 'T', stayDuration: 0, entrySkew: { type: 'X', angle: 15 } },
            { url: getWechat300x300(4), entryDirection: 'B', stayDuration: 0, entrySkew: { type: 'X', angle: -15 } },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 顺时针 T→R→B→L，entrySkew + exitSkew</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entryDirection: 'T', stayDuration: 0, entrySkew: { type: 'X', angle: 15 }, exitSkew: { type: 'X', angle: -15 } },
            { url: getWechat300x300(2), entryDirection: 'R', stayDuration: 0, entrySkew: { type: 'Y', angle: 15 }, exitSkew: { type: 'Y', angle: -15 } },
            { url: getWechat300x300(3), entryDirection: 'B', stayDuration: 0, entrySkew: { type: 'X', angle: -15 }, exitSkew: { type: 'X', angle: 15 } },
            { url: getWechat300x300(4), entryDirection: 'L', stayDuration: 0, entrySkew: { type: 'Y', angle: -15 }, exitSkew: { type: 'Y', angle: 15 } },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — T→B→T→B，entryRotation 360°</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entryDirection: 'T', stayDuration: 0, entryRotation: 360 },
            { url: getWechat300x300(2), entryDirection: 'B', stayDuration: 0, entryRotation: -360 },
            { url: getWechat300x300(3), entryDirection: 'T', stayDuration: 0, entryRotation: 360 },
            { url: getWechat300x300(4), entryDirection: 'B', stayDuration: 0, entryRotation: -360 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — L→R→L→R，skewY 30°</h3>
        <AnySkewPush
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entryDirection: 'L', stayDuration: 0, entrySkew: { type: 'Y', angle: 30 } },
            { url: getWechat300x300(2), entryDirection: 'R', stayDuration: 0, entrySkew: { type: 'Y', angle: -30 } },
            { url: getWechat300x300(3), entryDirection: 'L', stayDuration: 0, entrySkew: { type: 'Y', angle: 30 } },
            { url: getWechat300x300(4), entryDirection: 'R', stayDuration: 0, entrySkew: { type: 'Y', angle: -30 } },
          ]}
        />
      </div>
    </div>
  )
}
