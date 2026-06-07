import { CamaraStage } from 'expub-tool/svg'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

const PLACEHOLDER_300x500 = '/300x500.png'

export default function CamaraStagePage() {
  return (
    <div>
      <h2>CamaraStage — 导演式 Layer World</h2>

      {/* ── 校验案例：镜头后撤穿越 ── */}
      <h3 style={{ fontSize: 14, color: '#374151', marginTop: 16 }}>
        校验案例：镜头后撤穿越
      </h3>
      <p style={{ fontSize: 12, color: '#6b7280' }}>
        sceneA (z=300, world) + sceneB (z=-300, passThrough)，camera z: 0 → -600
      </p>
      <div style={{ width: 300, margin: '0 auto' }}>
        <CamaraStage
          viewport={{ width: 300, height: 500 }}
          loopCount={0}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 1.5, toAbs: { z: -600 } },
            ],
          }}
          scenes={[
            {
              id: 'sceneA',
              world: { x: 0, y: 0, z: 300 },
              kind: 'world',
              objects: [
                { id: 'objA', local: { x: 0, y: 0, z: 0 }, asset: PLACEHOLDER_300x500 },
              ],
            },
            {
              id: 'sceneB',
              world: { x: 0, y: 0, z: -300 },
              kind: 'passThrough',
              entrance: { triggerDistance: 200, opacity: { from: 0, to: 1 } },
              objects: [
                { id: 'objB', local: { x: 0, y: 0, z: 0 }, asset: getWechat300x500(1) },
              ],
            },
          ]}
        />
      </div>

      {/* ── 横移视差 ── */}
      <h3 style={{ fontSize: 14, color: '#374151', marginTop: 32 }}>
        横移视差（近快远慢）
      </h3>
      <p style={{ fontSize: 12, color: '#6b7280' }}>
        三层不同深度，camera x: 0 → 100 → -100 → 0，近处偏移更大
      </p>
      <div style={{ width: 300, margin: '0 auto' }}>
        <CamaraStage
          viewport={{ width: 300, height: 300 }}
          focalLength={600}
          loopCount={0}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 1.2, toAbs: { x: 100 } },
              { durationSeconds: 1.2, toAbs: { x: -100 } },
              { durationSeconds: 1.2, toAbs: { x: 0 } },
            ],
          }}
          scenes={[
            {
              id: 'near',
              world: { x: 0, y: 0, z: 300 },
              kind: 'world',
              objects: [
                { id: 'nearObj', local: { x: 0, y: 0, z: 0 }, asset: PLACEHOLDER_300x500, size: { w: 160, h: 160 } },
              ],
            },
            {
              id: 'mid',
              world: { x: 0, y: 0, z: 600 },
              kind: 'world',
              objects: [
                { id: 'midObj', local: { x: 0, y: 0, z: 0 }, asset: PLACEHOLDER_300x500, size: { w: 160, h: 160 } },
              ],
            },
            {
              id: 'far',
              world: { x: 0, y: 0, z: 1200 },
              kind: 'world',
              objects: [
                { id: 'farObj', local: { x: 0, y: 0, z: 0 }, asset: PLACEHOLDER_300x500, size: { w: 160, h: 160 } },
              ],
            },
          ]}
        />
      </div>
    </div>
  )
}
