import { CamaraStage } from 'expub-tool/svg'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function CamaraStagePage() {
  return (
    <div>
      <h2>CamaraStage — 导演式 Layer World</h2>

      {/* ── 1. Prompt 校验样例：三图后撤 + 入场 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>校验样例 — A(0,0,300) B(180,0,-150) C(-160,0,-450)</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>
          camera z:0→-700 + y 微摆。A 主图在前方退远，B 从右侧穿入，C 从左侧穿入。
        </p>
        <CamaraStage
          viewport={{ width: 300, height: 500, f: 300 }}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 15, toAbs: { x: 0, y: 20, z: -700 } },
            ],
          }}
          layers={[
            {
              id: 'A',
              url: getWechat300x500(1),
              worldX: 0, worldY: 0, worldZ: 300,
              role: 'base',
            },
            {
              id: 'B',
              url: getWechat300x500(2),
              worldX: 180, worldY: 0, worldZ: -150,
              role: 'entering',
            },
            {
              id: 'C',
              url: getWechat300x500(3),
              worldX: -160, worldY: 0, worldZ: -450,
              role: 'entering',
            },
          ]}
          sampleRate={30}
        />
      </div>

      {/* ── 2. 两图后撤穿越 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>两图后撤 — A(0,0,300) B(0,0,-300)</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>
          camera z:0→-600。A 前方退远缩小，B 从后方穿越到前方。
        </p>
        <CamaraStage
          viewport={{ width: 300, height: 500, f: 300 }}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 10, toAbs: { x: 0, y: 0, z: -600 } },
            ],
          }}
          layers={[
            {
              id: 'A',
              url: getWechat300x500(4),
              worldX: 0, worldY: 0, worldZ: 300,
            },
            {
              id: 'B',
              url: getWechat300x500(5),
              worldX: 0, worldY: 0, worldZ: -300,
              role: 'entering',
            },
          ]}
          sampleRate={30}
        />
      </div>

      {/* ── 3. 镜头摆动 + 视差 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>镜头左右摆动 — 三层视差</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>
          camera 左右摆动 x:-80→+80，三层不同深度产生视差。近层动得多，远层动得少。
        </p>
        <CamaraStage
          viewport={{ width: 300, height: 500, f: 300 }}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 3, toAbs: { x: -80, y: 0, z: 0 } },
              { durationSeconds: 3, toAbs: { x: 80, y: 0, z: 0 } },
              { durationSeconds: 3, toAbs: { x: -80, y: 0, z: 0 } },
              { durationSeconds: 3, toAbs: { x: 0, y: 0, z: 0 } },
            ],
          }}
          layers={[
            {
              id: 'near',
              url: getWechat300x300(1),
              worldX: 0, worldY: 0, worldZ: 300,
            },
            {
              id: 'mid',
              url: getWechat300x300(2),
              worldX: 0, worldY: 0, worldZ: 600,
            },
            {
              id: 'far',
              url: getWechat300x300(3),
              worldX: 0, worldY: 0, worldZ: 1200,
            },
          ]}
          sampleRate={30}
        />
      </div>

      {/* ── 4. 推进 + 后退 + 摆动组合 ── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 600 }}>
        <h3 style={{ margin: '0 0 8px' }}>组合运动 — 推进→停顿→后退摆动</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>
          camera 先推进 z:-400，停顿，再后退 z:+200 并左右摆。两层观察深度变化 + 入场效果。
        </p>
        <CamaraStage
          viewport={{ width: 300, height: 500, f: 300 }}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 5, toAbs: { x: 0, y: 0, z: -400 } },
              { durationSeconds: 2, toAbs: { x: 0, y: 0, z: -400 } },
              { durationSeconds: 8, toAbs: { x: 40, y: -10, z: 200 } },
            ],
          }}
          layers={[
            {
              id: 'bg',
              url: getWechat300x500(6),
              worldX: 0, worldY: 0, worldZ: 800,
            },
            {
              id: 'mid',
              url: getWechat300x500(7),
              worldX: 0, worldY: 0, worldZ: 400,
            },
            {
              id: 'enter-right',
              url: getWechat300x500(8),
              worldX: 150, worldY: 0, worldZ: -200,
              role: 'entering',
            },
          ]}
          sampleRate={30}
        />
      </div>
    </div>
  )
}
