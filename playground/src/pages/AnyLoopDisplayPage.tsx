import { AnyLoopDisplay } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function AnyLoopDisplayPage() {
  return (
    <div>
      <h2>AnyLoopDisplay — 任意循环展示</h2>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>8 方向全展示 — 每图不同方向，childItemSize + canvasBg</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItemSize={{ w: 240, h: 240 }}
          canvasBg="#f3f4f6"
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T' },  stayDuration: 1 },
            { url: getWechat300x300(2), entry: { direction: 'TR' }, stayDuration: 1 },
            { url: getWechat300x300(3), entry: { direction: 'R' },  stayDuration: 1 },
            { url: getWechat300x300(4), entry: { direction: 'BR' }, stayDuration: 1 },
            { url: getWechat300x300(5), entry: { direction: 'B' },  stayDuration: 1 },
            { url: getWechat300x300(6), entry: { direction: 'BL' }, stayDuration: 1 },
            { url: getWechat300x300(7), entry: { direction: 'L' },  stayDuration: 1 },
            { url: getWechat300x300(8), entry: { direction: 'TL' }, stayDuration: 1 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — 对角线 TL↔BR，skewY 30° + entry/exit skew</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItemSize={{ w: 240, h: 240 }}
          canvasBg="#fef3c7"
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'TL', skew: { type: 'Y', angle: 30 } }, exit: { skew: { type: 'Y', angle: -30 } }, stayDuration: 1.5 },
            { url: getWechat300x300(2), entry: { direction: 'BR', skew: { type: 'Y', angle: -30 } }, exit: { skew: { type: 'Y', angle: 30 } }, stayDuration: 1.5 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — scale 0→1 入场，1→0 出场，origin Center</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', scale: { origin: 'Center', scale: 0 } }, exit: { scale: { origin: 'Center', scale: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(2), entry: { direction: 'R', scale: { origin: 'Center', scale: 0 } }, exit: { scale: { origin: 'Center', scale: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(3), entry: { direction: 'B', scale: { origin: 'Center', scale: 0 } }, exit: { scale: { origin: 'Center', scale: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(4), entry: { direction: 'L', scale: { origin: 'Center', scale: 0 } }, exit: { scale: { origin: 'Center', scale: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — scale 0.1→1 入场，1→3 放大退场，origin TopLeft</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', scale: { origin: 'TopLeft', scale: 0.1 } }, exit: { scale: { origin: 'TopLeft', scale: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(2), entry: { direction: 'B', scale: { origin: 'TopLeft', scale: 0.1 } }, exit: { scale: { origin: 'TopLeft', scale: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(3), entry: { direction: 'T', scale: { origin: 'TopLeft', scale: 0.1 } }, exit: { scale: { origin: 'TopLeft', scale: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(4), entry: { direction: 'B', scale: { origin: 'TopLeft', scale: 0.1 } }, exit: { scale: { origin: 'TopLeft', scale: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — scale + skew + rotation 组合</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItemSize={{ w: 240, h: 240 }}
          canvasBg="#ede9fe"
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'TL', skew: { type: 'X', angle: 30 }, scale: { origin: 'BottomRight', scale: 0.1 }, rotation: { angle: 180 } }, stayDuration: 2, switchDuration: 2.5 },
            { url: getWechat300x300(2), entry: { direction: 'BR', skew: { type: 'X', angle: -30 }, scale: { origin: 'TopLeft', scale: 0.1 }, rotation: { angle: -180 } }, stayDuration: 2, switchDuration: 2.5 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <AnyLoopDisplay
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
        <AnyLoopDisplay
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
        <AnyLoopDisplay
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
        <AnyLoopDisplay
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
        <AnyLoopDisplay
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
        <h3 style={{ margin: '0 0 8px' }}>{'4 图 — rotation 360° 自定义坐标 { x: 50, y: -50 }'}</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { direction: 'T', rotation: { angle: 360, origin: { x: 50, y: -50 } } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { direction: 'B', rotation: { angle: -360, origin: { x: 50, y: -50 } } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { direction: 'T', rotation: { angle: 360, origin: { x: 50, y: -50 } } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { direction: 'B', rotation: { angle: -360, origin: { x: 50, y: -50 } } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — L→R→L→R，skewY 30°</h3>
        <AnyLoopDisplay
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
