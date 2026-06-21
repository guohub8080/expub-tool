import { useRef, useState } from 'react'
import { ModalImg } from 'expub-tool/svg'
import getPlaceHolderPic1 from '../api/placeHolderPic/getPlaceHolderPic1'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const CopyDemo = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => {
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
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
          {note && (
            <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280', fontFamily: 'ui-monospace, SFMono-Regular, monospace', whiteSpace: 'pre-wrap' }}>
              {note}
            </div>
          )}
        </div>
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
      <div ref={ref} style={{ maxWidth: 400, margin: '0 auto' }}>{children}</div>
    </div>
  )
}

export default function ModalImgPage() {
  return (
    <div>
      <h2>ModalImg — 热区点击弹出图片（微信原生预览）</h2>

      <CopyDemo
        title="jsx 背景 + SMIL 动画暗示 + 2 个热区"
        note="背景用 jsx 画脉冲圈标记热区位置（SMIL animate）\n点击脉冲区域 → 微信原生图片预览"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 500 }}
          canvasBg={{
            jsx: (
              <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
                <rect x="0" y="0" width="400" height="500" fill="#0f172a" />
                <text x="200" y="40" textAnchor="middle" fill="#64748b" fontSize="16" fontFamily="system-ui, sans-serif">点击查看详情</text>

                {/* 热区 1 位置的脉冲圈 */}
                <circle cx="100" cy="180" r="50" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.6">
                  <animate attributeName="r" values="40;55;40" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="180" r="35" fill="#38bdf8" opacity="0.15">
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
                </circle>

                {/* 热区 2 位置的脉冲圈 */}
                <circle cx="300" cy="180" r="50" fill="none" stroke="#f472b6" strokeWidth="3" opacity="0.6">
                  <animate attributeName="r" values="40;55;40" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="180" r="35" fill="#f472b6" opacity="0.15">
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                </circle>

                {/* 底部提示文字 + 箭头闪烁 */}
                <text x="200" y="340" textAnchor="middle" fill="#94a3b8" fontSize="14" fontFamily="system-ui, sans-serif">
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                  👆 点击发光区域查看
                </text>
              </svg>
            ),
          }}
          childItems={[
            { hotArea: { x: 50, y: 130, w: 100, h: 100 }, imgUrl: getWechat300x300(1) },
            { hotArea: { x: 250, y: 130, w: 100, h: 100 }, imgUrl: getWechat300x300(2) },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="jsx 背景 + 4 个热区（错落 + 交替闪烁）"
        note="4 个热区，每个有交替闪烁的边框暗示"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 600 }}
          canvasBg={{
            jsx: (
              <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
                <rect x="0" y="0" width="400" height="600" fill="#1a1a2e" />

                {/* 热区 1 */}
                <rect x="20" y="40" width="160" height="200" rx="8" fill="#16213e" stroke="#e94560" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                </rect>
                <text x="100" y="140" textAnchor="middle" fill="#e94560" fontSize="18" fontFamily="system-ui, sans-serif">产品 A</text>

                {/* 热区 2 */}
                <rect x="220" y="40" width="160" height="200" rx="8" fill="#16213e" stroke="#0f3460" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="1;0.2;1" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </rect>
                <text x="300" y="140" textAnchor="middle" fill="#53a8e6" fontSize="18" fontFamily="system-ui, sans-serif">产品 B</text>

                {/* 热区 3 */}
                <rect x="20" y="300" width="160" height="200" rx="8" fill="#16213e" stroke="#16c79a" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="1;0.2;1" dur="2s" begin="1s" repeatCount="indefinite" />
                </rect>
                <text x="100" y="400" textAnchor="middle" fill="#16c79a" fontSize="18" fontFamily="system-ui, sans-serif">产品 C</text>

                {/* 热区 4 */}
                <rect x="220" y="300" width="160" height="200" rx="8" fill="#16213e" stroke="#f5a623" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="1;0.2;1" dur="2s" begin="1.5s" repeatCount="indefinite" />
                </rect>
                <text x="300" y="400" textAnchor="middle" fill="#f5a623" fontSize="18" fontFamily="system-ui, sans-serif">产品 D</text>

                <text x="200" y="560" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="system-ui, sans-serif">
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                  点击闪烁区域查看详情
                </text>
              </svg>
            ),
          }}
          childItems={[
            { hotArea: { x: 20, y: 40, w: 160, h: 200 }, imgUrl: getWechat300x300(1) },
            { hotArea: { x: 220, y: 40, w: 160, h: 200 }, imgUrl: getWechat300x300(2) },
            { hotArea: { x: 20, y: 300, w: 160, h: 200 }, imgUrl: getWechat300x300(3) },
            { hotArea: { x: 220, y: 300, w: 160, h: 200 }, imgUrl: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="url 背景 + 2 个热区（最简）"
        note="canvasBg={url} → 自动 svg + background-image\n无动画暗示，适合图片本身就是指引的场景"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 400 }}
          canvasBg={{ url: getPlaceHolderPic1(400, 400, '1e293b', '64748b') }}
          childItems={[
            { hotArea: { x: 40, y: 80, w: 140, h: 140 }, imgUrl: getWechat300x300(5) },
            { hotArea: { x: 220, y: 80, w: 140, h: 140 }, imgUrl: getWechat300x300(6) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
