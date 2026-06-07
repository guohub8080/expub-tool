import { CamaraStage } from 'expub-tool/svg'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

export default function CamaraStagePage() {
  return (
    <div>
      <h2>CamaraStage — 导演式 Layer World</h2>

      {/* Prompt 中的最小校验样例 */}
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

      {/* 两图后撤穿越 */}
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
              url: getWechat300x500(1),
              worldX: 0, worldY: 0, worldZ: 300,
            },
            {
              id: 'B',
              url: getWechat300x500(2),
              worldX: 0, worldY: 0, worldZ: -300,
              role: 'entering',
            },
          ]}
          sampleRate={30}
        />
      </div>
    </div>
  )
}
