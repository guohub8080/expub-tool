import { AnyLoopDisplay, ORIGIN } from 'expub-tool/svg'
import { getEaseBezier } from 'expub-tool/smil'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function AnyLoopDisplayPage() {
  return (
    <div>
      <h2>AnyLoopDisplay — 任意循环展示</h2>

      {/* ── 基础方向 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>8 方向全展示 — childCanvas 居中 + canvasBg</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#f3f4f6" }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'T' } },  stayDuration: 1 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'TR' } }, stayDuration: 1 },
            { url: getWechat300x300(3), entry: { translate: { direction: 'R' } },  stayDuration: 1 },
            { url: getWechat300x300(4), entry: { translate: { direction: 'BR' } }, stayDuration: 1 },
            { url: getWechat300x300(5), entry: { translate: { direction: 'B' } },  stayDuration: 1 },
            { url: getWechat300x300(6), entry: { translate: { direction: 'BL' } }, stayDuration: 1 },
            { url: getWechat300x300(7), entry: { translate: { direction: 'L' } },  stayDuration: 1 },
            { url: getWechat300x300(8), entry: { translate: { direction: 'TL' } }, stayDuration: 1 },
          ]}
        />
      </div>

      {/* ── translate timeline：entry 过冲回弹 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — translate 过冲回弹（entry timeline：左→过冲→回弹）</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#dbeafe" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: {
                translate: {
                  initValue: { x: -500, y: 0 },
                  timeline: [
                    { durationSeconds: 1.5, toAbs: { x: 30, y: 0 }, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 }, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              exit: { translate: { direction: 'R' } },
              stayDuration: 1.5, switchDuration: 2,
            },
            {
              url: getWechat300x300(2),
              entry: {
                translate: {
                  initValue: { x: 500, y: 0 },
                  timeline: [
                    { durationSeconds: 1.5, toAbs: { x: -30, y: 0 }, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 }, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              exit: { translate: { direction: 'L' } },
              stayDuration: 1.5, switchDuration: 2,
            },
          ]}
        />
      </div>

      {/* ── translate timeline：entry 弧线进入 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — translate 弧线进入（多段 timeline 模拟弧线）</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#fce7f3" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: {
                translate: {
                  initValue: { x: -500, y: -300 },
                  timeline: [
                    { durationSeconds: 1, toAbs: { x: -100, y: 60 } },
                    { durationSeconds: 0.5, toAbs: { x: 20, y: -10 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 } },
                  ],
                },
              },
              exit: { translate: { direction: 'R' } },
              stayDuration: 1.5, switchDuration: 2,
            },
            {
              url: getWechat300x300(2),
              entry: {
                translate: {
                  initValue: { x: 500, y: -300 },
                  timeline: [
                    { durationSeconds: 1, toAbs: { x: 100, y: 60 } },
                    { durationSeconds: 0.5, toAbs: { x: -20, y: -10 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 } },
                  ],
                },
              },
              exit: { translate: { direction: 'L' } },
              stayDuration: 1.5, switchDuration: 2,
            },
          ]}
        />
      </div>

      {/* ── translate timeline：entry + stay 浮动 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — entry 过冲 + stay 浮动（entry + stay translate timeline）</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#ecfdf5" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: {
                translate: {
                  direction: 'T',
                  keySplines: getEaseBezier({ isOut: true }),
                },
              },
              stay: {
                translate: {
                  timeline: [
                    { durationSeconds: 0.5, toAbs: { x: 0, y: -8 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 8 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: -4 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 } },
                  ],
                },
              },
              exit: { translate: { direction: 'B' } },
              stayDuration: 2, switchDuration: 1.5,
            },
            {
              url: getWechat300x300(2),
              entry: {
                translate: {
                  direction: 'B',
                  keySplines: getEaseBezier({ isOut: true }),
                },
              },
              stay: {
                translate: {
                  timeline: [
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 8 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: -8 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 4 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 } },
                  ],
                },
              },
              exit: { translate: { direction: 'T' } },
              stayDuration: 2, switchDuration: 1.5,
            },
          ]}
        />
      </div>

      {/* ── translate timeline：entry + stay 横向漂移 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — entry L/R + stay 横向漂移 + exit R/L</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#fef9c3" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: { translate: { direction: 'L' } },
              stay: {
                translate: {
                  timeline: [
                    { durationSeconds: 0.75, toAbs: { x: 15, y: 0 } },
                    { durationSeconds: 0.75, toAbs: { x: -15, y: 0 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 } },
                  ],
                },
              },
              exit: { translate: { direction: 'R' } },
              stayDuration: 2, switchDuration: 1.5,
            },
            {
              url: getWechat300x300(2),
              entry: { translate: { direction: 'R' } },
              stay: {
                translate: {
                  timeline: [
                    { durationSeconds: 0.75, toAbs: { x: -15, y: 0 } },
                    { durationSeconds: 0.75, toAbs: { x: 15, y: 0 } },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 } },
                  ],
                },
              },
              exit: { translate: { direction: 'L' } },
              stayDuration: 2, switchDuration: 1.5,
            },
          ]}
        />
      </div>

      {/* ── translate timeline：entry + exit 都用 timeline ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — entry + exit 都用 timeline（完全自定义路径）</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#ede9fe" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: {
                translate: {
                  initValue: { x: 0, y: -500 },
                  timeline: [
                    { durationSeconds: 1.5, toAbs: { x: 0, y: 20 }, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 }, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              exit: {
                translate: {
                  initValue: { x: 0, y: 0 },
                  timeline: [
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 15 } },
                    { durationSeconds: 1.5, toAbs: { x: 0, y: -500 }, keySplines: getEaseBezier({ isIn: true }) },
                  ],
                },
              },
              stayDuration: 1.5, switchDuration: 2,
            },
            {
              url: getWechat300x300(2),
              entry: {
                translate: {
                  initValue: { x: 0, y: 500 },
                  timeline: [
                    { durationSeconds: 1.5, toAbs: { x: 0, y: -20 }, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.5, toAbs: { x: 0, y: 0 }, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              exit: {
                translate: {
                  initValue: { x: 0, y: 0 },
                  timeline: [
                    { durationSeconds: 0.5, toAbs: { x: 0, y: -15 } },
                    { durationSeconds: 1.5, toAbs: { x: 0, y: 500 }, keySplines: getEaseBezier({ isIn: true }) },
                  ],
                },
              },
              stayDuration: 1.5, switchDuration: 2,
            },
          ]}
        />
      </div>

      {/* ── translate + rotation + scale 组合 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — translate timeline + rotation 360° + scale 0→1 组合</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#fef3c7" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: {
                translate: {
                  initValue: { x: -500, y: 0 },
                  timeline: [
                    { durationSeconds: 1.8, toAbs: { x: 20, y: 0 }, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.7, toAbs: { x: 0, y: 0 }, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
                rotation: { angle: 360 },
                scale: { childCanvasOrigin: ORIGIN.Center, from: 0.3 },
              },
              exit: { translate: { direction: 'R' }, rotation: { angle: -360 }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0.3 } },
              stayDuration: 1.5, switchDuration: 2.5,
            },
            {
              url: getWechat300x300(2),
              entry: {
                translate: {
                  initValue: { x: 500, y: 0 },
                  timeline: [
                    { durationSeconds: 1.8, toAbs: { x: -20, y: 0 }, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.7, toAbs: { x: 0, y: 0 }, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
                rotation: { angle: -360 },
                scale: { childCanvasOrigin: ORIGIN.Center, from: 0.3 },
              },
              exit: { translate: { direction: 'L' }, rotation: { angle: 360 }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0.3 } },
              stayDuration: 1.5, switchDuration: 2.5,
            },
          ]}
        />
      </div>

      {/* ── translate distance 自定义 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — translate distance 自定义（近距推入）</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'L', distance: 0.5 } }, exit: { translate: { direction: 'R', distance: 0.5 } }, stayDuration: 1.5 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'R', distance: 0.5 } }, exit: { translate: { direction: 'L', distance: 0.5 } }, stayDuration: 1.5 },
          ]}
        />
      </div>

      {/* ── skewX ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — TL↔BR，skewY 30° + entry/exit skew</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#fef3c7" }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'TL' }, skewY: { from: 30 } }, exit: { skewY: { from: -30 } }, stayDuration: 1.5 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'BR' }, skewY: { from: -30 } }, exit: { skewY: { from: 30 } }, stayDuration: 1.5 },
          ]}
        />
      </div>

      {/* ── scale ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — scale 0→1 入场，1→0 出场，origin Center</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'T' }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, exit: { scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'R' }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, exit: { scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(3), entry: { translate: { direction: 'B' }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, exit: { scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(4), entry: { translate: { direction: 'L' }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, exit: { scale: { childCanvasOrigin: ORIGIN.Center, from: 0 } }, stayDuration: 1.5, switchDuration: 2.5 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — scale 0.1→1 入场，1→3 放大退场，origin TopLeft</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'T' }, scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 0.1 } }, exit: { scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'B' }, scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 0.1 } }, exit: { scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(3), entry: { translate: { direction: 'T' }, scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 0.1 } }, exit: { scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
            { url: getWechat300x300(4), entry: { translate: { direction: 'B' }, scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 0.1 } }, exit: { scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 3 } }, stayDuration: 1.5, switchDuration: 2.5 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — scale 弹跳入场（高级 timeline）0.1→1.3→1</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#ecfdf5" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: {
                translate: { direction: 'T' },
                scale: {
                  childCanvasOrigin: ORIGIN.Center,
                  initValue: 0.1,
                  timeline: [
                    { durationSeconds: 1.8, toAbs: 1.3, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.7, toAbs: 1, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              stayDuration: 1.5, switchDuration: 2.5,
            },
            {
              url: getWechat300x300(2),
              entry: {
                translate: { direction: 'B' },
                scale: {
                  childCanvasOrigin: ORIGIN.Center,
                  initValue: 0.1,
                  timeline: [
                    { durationSeconds: 1.8, toAbs: 1.3, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 0.7, toAbs: 1, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              stayDuration: 1.5, switchDuration: 2.5,
            },
          ]}
        />
      </div>

      {/* ── scale + skewX + rotation 组合 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — scale + skewX + rotation 组合</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#ede9fe" }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'TL' }, skewX: { from: 30 }, scale: { childCanvasOrigin: ORIGIN.BottomRight, from: 0.1 }, rotation: { angle: 180 } }, stayDuration: 2, switchDuration: 2.5 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'BR' }, skewX: { from: -30 }, scale: { childCanvasOrigin: ORIGIN.TopLeft, from: 0.1 }, rotation: { angle: -180 } }, stayDuration: 2, switchDuration: 2.5 },
          ]}
        />
      </div>

      {/* ── stayDuration=0 快速切换 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — stayDuration=0，skewX 快速切换</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'T' }, skewX: { from: 15 } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'B' }, skewX: { from: -15 } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { translate: { direction: 'T' }, skewX: { from: 15 } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { translate: { direction: 'B' }, skewX: { from: -15 } }, stayDuration: 0 },
          ]}
        />
      </div>

      {/* ── rotation ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — rotation 360° Center</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'T' }, rotation: { angle: 360 } }, stayDuration: 0 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'B' }, rotation: { angle: -360 } }, stayDuration: 0 },
            { url: getWechat300x300(3), entry: { translate: { direction: 'T' }, rotation: { angle: 360 } }, stayDuration: 0 },
            { url: getWechat300x300(4), entry: { translate: { direction: 'B' }, rotation: { angle: -360 } }, stayDuration: 0 },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — rotation 弹性旋转入场（高级 timeline）720°→-180°→0°</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#fef9c3" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: {
                translate: { direction: 'T' },
                rotation: {
                  childCanvasOrigin: ORIGIN.Center,
                  initValue: 720,
                  timeline: [
                    { durationSeconds: 1.5, toAbs: -180, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 1, toAbs: 0, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              stayDuration: 1.5, switchDuration: 2.5,
            },
            {
              url: getWechat300x300(2),
              entry: {
                translate: { direction: 'B' },
                rotation: {
                  childCanvasOrigin: ORIGIN.Center,
                  initValue: -720,
                  timeline: [
                    { durationSeconds: 1.5, toAbs: 180, keySplines: getEaseBezier({ isOut: true }) },
                    { durationSeconds: 1, toAbs: 0, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                  ],
                },
              },
              stayDuration: 1.5, switchDuration: 2.5,
            },
          ]}
        />
      </div>

      {/* ── opacity ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — opacity 0→1 淡入，1→0 淡出</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { direction: 'T' }, opacity: { from: 0 } }, exit: { opacity: { from: 0 } }, stayDuration: 1.5 },
            { url: getWechat300x300(2), entry: { translate: { direction: 'R' }, opacity: { from: 0 } }, exit: { opacity: { from: 0 } }, stayDuration: 1.5 },
            { url: getWechat300x300(3), entry: { translate: { direction: 'B' }, opacity: { from: 0 } }, exit: { opacity: { from: 0 } }, stayDuration: 1.5 },
            { url: getWechat300x300(4), entry: { translate: { direction: 'L' }, opacity: { from: 0 } }, exit: { opacity: { from: 0 } }, stayDuration: 1.5 },
          ]}
        />
      </div>

      {/* ── stay 固定值 + timeline ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — stay 固定值：rotation 45° + scale 1.1</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#fef9c3" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: { translate: { direction: 'T' }, rotation: { angle: 360 }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0.5 } },
              stay: { rotation: 45, scale: 1.1 },
              exit: { rotation: { angle: -360 }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0.5 } },
              stayDuration: 3, switchDuration: 2,
            },
            {
              url: getWechat300x300(2),
              entry: { translate: { direction: 'B' }, rotation: { angle: -360 }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0.5 } },
              stay: { rotation: -45, scale: 1.1 },
              exit: { rotation: { angle: 360 }, scale: { childCanvasOrigin: ORIGIN.Center, from: 0.5 } },
              stayDuration: 3, switchDuration: 2,
            },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — stay timeline：scale 呼吸动画 1↔1.15</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#ecfdf5" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: { translate: { direction: 'T' } },
              stay: {
                scale: { timeline: [
                  { durationSeconds: 1, toAbs: 1.15, keySplines: getEaseBezier({ isOut: true }) },
                  { durationSeconds: 1, toAbs: 1, keySplines: getEaseBezier({ isIn: true }) },
                  { durationSeconds: 1, toAbs: 1.15, keySplines: getEaseBezier({ isOut: true }) },
                ] },
              },
              stayDuration: 3, switchDuration: 2,
            },
            {
              url: getWechat300x300(2),
              entry: { translate: { direction: 'B' } },
              stay: {
                scale: { timeline: [
                  { durationSeconds: 1, toAbs: 1.15, keySplines: getEaseBezier({ isOut: true }) },
                  { durationSeconds: 1, toAbs: 1, keySplines: getEaseBezier({ isIn: true }) },
                  { durationSeconds: 1, toAbs: 1.15, keySplines: getEaseBezier({ isOut: true }) },
                ] },
              },
              stayDuration: 3, switchDuration: 2,
            },
          ]}
        />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>2 图 — stay timeline：opacity 呼吸 + rotation 摇摆</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          childCanvas={{ x: 30, y: 30, w: 240, h: 240 }}
          canvasBg={{ color: "#fce7f3" }}
          childItems={[
            {
              url: getWechat300x300(1),
              entry: { translate: { direction: 'T' } },
              stay: {
                opacity: { timeline: [
                  { durationSeconds: 1, toAbs: 0.6 },
                  { durationSeconds: 1, toAbs: 1 },
                ] },
                rotation: { timeline: [
                  { durationSeconds: 0.75, toAbs: 5 },
                  { durationSeconds: 0.75, toAbs: -5 },
                  { durationSeconds: 0.75, toAbs: 5 },
                  { durationSeconds: 0.75, toAbs: 0 },
                ] },
              },
              stayDuration: 3, switchDuration: 2,
            },
            {
              url: getWechat300x300(2),
              entry: { translate: { direction: 'B' } },
              stay: {
                opacity: { timeline: [
                  { durationSeconds: 1, toAbs: 0.6 },
                  { durationSeconds: 1, toAbs: 1 },
                ] },
                rotation: { timeline: [
                  { durationSeconds: 0.75, toAbs: -5 },
                  { durationSeconds: 0.75, toAbs: 5 },
                  { durationSeconds: 0.75, toAbs: -5 },
                  { durationSeconds: 0.75, toAbs: 0 },
                ] },
              },
              stayDuration: 3, switchDuration: 2,
            },
          ]}
        />
      </div>
      {/* ── 底部推入 + scale 过冲 + stay 缩小 + exit 不退出 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>4 图 — 底部推入 + scale 过冲 + stay 缩小 + exit 不移动 + hold opacity 归零</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          canvasBg={{ color: "#f0fdf4" }}
          childItems={[1, 2, 3, 4].map(n => ({
            url: getWechat300x300(n),
            entry: {
              translate: { direction: 'B' },
              scale: {
                childCanvasOrigin: ORIGIN.Center,
                initValue: 0.3,
                timeline: [
                  { durationSeconds: 1.2, toAbs: 1.2, keySplines: getEaseBezier({ isOut: true }) },
                  { durationSeconds: 0.8, toAbs: 1, keySplines: getEaseBezier({ isIn: true, isOut: true }) },
                ],
              },
            },
            stay: { scale: 0.8 },
            exit: {
              translate: {
                initValue: { x: 0, y: 0 },
                timeline: [{ durationSeconds: 2, toAbs: { x: 0, y: 0 } }],
              },
            },
            hold: {
              opacity: { timeline: [{ durationSeconds: 0.01, toAbs: 0 }] },
            },
            stayDuration: 2,
            switchDuration: 2,
          }))}
        />
      </div>

      {/* ── Skew Cube 效果（模拟 SkewSlideCarouselX）── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>3 图 — Skew Cube（origin=Bottom + Y 补偿 + hold opacity=0）</h3>
        <AnyLoopDisplay
          canvasSize={{ w: 300, h: 300 }}
          canvasBg={{ color: "#fef3c7" }}
          childItems={[
            { url: getWechat300x300(1), entry: { translate: { initValue: { x: 300, y: -40 }, timeline: [{ durationSeconds: 2, toAbs: { x: 0, y: 0 }, keySplines: "0.42 0 0.58 1" }] }, skewY: { from: -15, childCanvasOrigin: ORIGIN.Bottom } }, exit: { translate: { timeline: [{ durationSeconds: 2, toAbs: { x: -300, y: -40 }, keySplines: "0.42 0 0.58 1" }] }, skewY: { from: 15, childCanvasOrigin: ORIGIN.Bottom } }, hold: { opacity: { timeline: [{ durationSeconds: 0.01, toAbs: 0 }] } }, stayDuration: 0, switchDuration: 2 },
            { url: getWechat300x300(2), entry: { translate: { initValue: { x: 300, y: -40 }, timeline: [{ durationSeconds: 2, toAbs: { x: 0, y: 0 }, keySplines: "0.42 0 0.58 1" }] }, skewY: { from: -15, childCanvasOrigin: ORIGIN.Bottom } }, exit: { translate: { timeline: [{ durationSeconds: 2, toAbs: { x: -300, y: -40 }, keySplines: "0.42 0 0.58 1" }] }, skewY: { from: 15, childCanvasOrigin: ORIGIN.Bottom } }, hold: { opacity: { timeline: [{ durationSeconds: 0.01, toAbs: 0 }] } }, stayDuration: 0, switchDuration: 2 },
            { url: getWechat300x300(3), entry: { translate: { initValue: { x: 300, y: -40 }, timeline: [{ durationSeconds: 2, toAbs: { x: 0, y: 0 }, keySplines: "0.42 0 0.58 1" }] }, skewY: { from: -15, childCanvasOrigin: ORIGIN.Bottom } }, exit: { translate: { timeline: [{ durationSeconds: 2, toAbs: { x: -300, y: -40 }, keySplines: "0.42 0 0.58 1" }] }, skewY: { from: 15, childCanvasOrigin: ORIGIN.Bottom } }, hold: { opacity: { timeline: [{ durationSeconds: 0.01, toAbs: 0 }] } }, stayDuration: 0, switchDuration: 2 },
          ]}
        />
      </div>
    </div>
  )
}
