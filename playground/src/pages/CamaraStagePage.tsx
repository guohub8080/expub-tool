import { useRef, useState } from 'react'
import { CamaraStage } from 'expub-tool/svg'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const html = ref.current?.innerHTML
    if (html) {
      navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        <button
          onClick={handleCopy}
          style={{
            padding: '4px 12px', fontSize: 12, borderRadius: 4,
            border: '1px solid #d1d5db', background: copied ? '#10b981' : '#fff',
            color: copied ? '#fff' : '#374151', cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  )
}

/** 色块 scene 内容 */
const ColorScene = ({ color, label }: { color: string; label: string }) => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundColor: color }}>
    <text x="150" y="260" textAnchor="middle" fill="white" fontSize="48" fontFamily="system-ui">
      {label}
    </text>
  </svg>
)

export default function CamaraStagePage() {
  return (
    <div>
      <h2>CamaraStage — 导演式镜头动画</h2>

      <CopyDemo title="最小示例 — camera 后撤穿越两个 scene">
        {/*
          sceneA: world z=300（camera 前方）
          sceneB: world z=-300（camera 后方）
          camera 从 z=0 后撤到 z=-600

          效果：
          - sceneA 逐渐退远（rz 从 300 增大到 900）
          - sceneB 从后方穿越到前方（rz 从 -300 变为 300）
        */}
        <CamaraStage
          viewport={{ width: 300, height: 500, f: 300 }}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 5, toAbs: { x: 0, y: 0, z: -600 } },
            ],
          }}
          scenes={[
            {
              id: "sceneA",
              world: { x: 0, y: 0, z: 300 },
              kind: "world",
              objects: [
                { id: "objA1", local: { x: 200 }, url: getWechat300x500(1) },
              ],
            },
            {
              id: "sceneB",
              world: { x: 0, y: 0, z: -300 },
              kind: "passThrough",
              objects: [
                { id: "objB1", local: { x: -200 }, url: getWechat300x500(2) },
              ],
            },
          ]}
          sampleRate={30}
        />
      </CopyDemo>

      <CopyDemo title="三层穿越 — camera 后撤穿过 3 个 scene">
        {/*
          sceneA: z=600  前景层（world）
          sceneB: z=0    中间层（passThrough，会被穿越）
          sceneC: z=-300 远景层（passThrough，穿越后成为新前景）

          camera 从 z=-100 后撤到 z=-800
        */}
        <CamaraStage
          viewport={{ width: 300, height: 500, f: 300 }}
          camera={{
            initial: { x: 0, y: 0, z: -100 },
            timeline: [
              { durationSeconds: 8, toAbs: { x: 0, y: 0, z: -800 } },
            ],
          }}
          scenes={[
            {
              id: "sceneA",
              world: { x: 0, y: 0, z: 600 },
              kind: "world",
              objects: [
                { id: "objA1", local: {}, jsx: <ColorScene color="#1a1a2e" label="A (600)" /> },
              ],
            },
            {
              id: "sceneB",
              world: { x: 0, y: 0, z: 200 },
              kind: "passThrough",
              objects: [
                { id: "objB1", local: {}, jsx: <ColorScene color="#16213e" label="B (200)" /> },
              ],
            },
            {
              id: "sceneC",
              world: { x: 0, y: 0, z: -300 },
              kind: "passThrough",
              objects: [
                { id: "objC1", local: {}, jsx: <ColorScene color="#0f3460" label="C (-300)" /> },
              ],
            },
          ]}
          sampleRate={30}
        />
      </CopyDemo>

      <CopyDemo title="推进 + 折返 — camera 先推进再退回">
        {/*
          camera 从 z=0 推进到 z=400（靠近 sceneA），
          然后折返退到 z=-400（穿越 sceneB）
        */}
        <CamaraStage
          viewport={{ width: 300, height: 500, f: 300 }}
          camera={{
            initial: { x: 0, y: 0, z: 0 },
            timeline: [
              { durationSeconds: 4, toAbs: { x: 0, y: 0, z: 400 } },
              { durationSeconds: 6, toAbs: { x: 0, y: 0, z: -400 } },
            ],
          }}
          scenes={[
            {
              id: "sceneA",
              world: { x: 0, y: 0, z: 300 },
              kind: "world",
              objects: [
                { id: "objA1", local: {}, url: getWechat300x500(3) },
              ],
            },
            {
              id: "sceneB",
              world: { x: 0, y: 0, z: -200 },
              kind: "passThrough",
              objects: [
                { id: "objB1", local: {}, url: getWechat300x500(4) },
              ],
            },
          ]}
          sampleRate={30}
        />
      </CopyDemo>
    </div>
  )
}
