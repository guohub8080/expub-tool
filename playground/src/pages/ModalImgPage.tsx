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

/** 原理图：用 HTML 画一个层级分解图 */
function PrincipleDiagram() {
  const layerStyle: React.CSSProperties = {
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: 'ui-monospace, monospace',
  }

  return (
    <div style={{ marginBottom: 24, padding: 20, background: '#0f172a', borderRadius: 12 }}>
      <h3 style={{ color: '#e2e8f0', margin: '0 0 16px', fontSize: 16 }}>ModalImg 原理：层级分解</h3>

      {/* z-order 示意 */}
      <div style={{ position: 'relative', height: 200, marginBottom: 16 }}>
        {/* 背景层（顶层，pe:none） */}
        <div style={{
          ...layerStyle,
          position: 'absolute', top: 0, left: 40, right: 0, height: 160,
          background: '#1e40af', color: '#bfdbfe', zIndex: 3,
          border: '2px solid #3b82f6',
        }}>
          <strong>② 背景层（DOM 后 = 画在上面）</strong><br />
          pe:none（点击穿透）<br />
          用户看到的是这层（报纸/动画暗示）
        </div>

        {/* img 热区（底层，pe:painted） */}
        <div style={{
          ...layerStyle,
          position: 'absolute', bottom: 0, left: 0, right: 60, height: 160,
          background: '#7f1d1d', color: '#fecaca', zIndex: 1,
          border: '2px solid #ef4444',
        }}>
          <strong>① img 热区层（DOM 先 = 画在下面）</strong><br />
          pe:painted（接住点击）<br />
          被背景盖住，用户看不到
        </div>

        {/* 点击穿透箭头 */}
        <div style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
          color: '#fbbf24', fontSize: 24, zIndex: 4,
        }}>
          ↑ 点击穿透 pe:none ↑
        </div>
      </div>

      {/* 步骤说明 */}
      <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 2 }}>
        <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>点击流程：</div>
        <div>1. 📱 手指碰到 <span style={{ color: '#93c5fd' }}>背景层</span>（pe:none → 不拦截，穿透）</div>
        <div>2. ⬇️ 穿透后碰到 <span style={{ color: '#fca5a5' }}>img</span>（pe:painted → 有像素，接住）</div>
        <div>3. 🖼️ 微信检测到 &lt;img&gt; 被点击 → <span style={{ color: '#86efac' }}>弹出原生全屏预览</span></div>
      </div>

      {/* 对比传统热区 */}
      <div style={{ marginTop: 20, padding: 12, background: '#1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 12, lineHeight: 1.8 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 6 }}>和传统热区的区别：</div>
        <div>传统：&lt;rect pe:visible&gt; → 点击 → <span style={{ color: '#fbbf24' }}>SMIL 动画</span>（你写的）</div>
        <div>ModalImg：&lt;img pe:painted&gt; → 点击 → <span style={{ color: '#86efac' }}>微信原生预览</span>（平台内置）</div>
        <div style={{ marginTop: 4, color: '#f87171' }}>⚠️ 不能用 &lt;rect&gt; 替代——微信只认 &lt;img&gt; 点击</div>
      </div>

      {/* 为什么 scale */}
      <div style={{ marginTop: 16, padding: 12, background: '#1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 12, lineHeight: 1.8 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 6 }}>为什么 img 要 scale 压缩？</div>
        <div>img 必须 painted（有可见像素）→ 不能 opacity:0 → 用户能看到</div>
        <div>长图自然高 3000px → painted 3000px → 整条都能点（热区不精确）</div>
        <div>scale 压到 150px → painted 150px → <span style={{ color: '#86efac' }}>热区精确 = hotArea</span></div>
        <div>再用背景盖住 → 用户看不到压缩后的丑图 → 只看到背景</div>
      </div>

      {/* 为什么 99999 */}
      <div style={{ marginTop: 16, padding: 12, background: '#1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 12, lineHeight: 1.8 }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 6 }}>为什么容器 height:99999px？</div>
        <div>img 在零高容器（height:0）里 → 有些渲染器用父的 height:0 压制子元素</div>
        <div>99999px 告诉渲染器「别管父多矮，我有空间」→ img 正常渲染</div>
        <div>参考用 40404，你用 99999，效果一样——够大就行</div>
      </div>
    </div>
  )
}

export default function ModalImgPage() {
  return (
    <div>
      <h2>ModalImg — 热区点击弹出图片（微信原生预览）</h2>

      {/* 原理图 */}
      <PrincipleDiagram />

      <CopyDemo
        title="jsx 背景 + SMIL 动画暗示 + 2 个热区"
        note="背景用 jsx 画脉冲圈标记热区位置（SMIL animate）\n点击脉冲区域 → 穿透背景 → 打到 img → 微信原生图片预览"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 500 }}
          canvasBg={{
            jsx: (
              <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
                <rect x="0" y="0" width="400" height="500" fill="#0f172a" />
                <text x="200" y="40" textAnchor="middle" fill="#64748b" fontSize="16" fontFamily="system-ui, sans-serif">点击查看详情</text>

                <circle cx="100" cy="180" r="50" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.6">
                  <animate attributeName="r" values="40;55;40" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="180" r="35" fill="#38bdf8" opacity="0.15">
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
                </circle>

                <circle cx="300" cy="180" r="50" fill="none" stroke="#f472b6" strokeWidth="3" opacity="0.6">
                  <animate attributeName="r" values="40;55;40" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="180" r="35" fill="#f472b6" opacity="0.15">
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                </circle>

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
        title="jsx 背景 + 4 个热区（交替闪烁）"
        note="4 个热区，每个有交替闪烁边框暗示"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 600 }}
          canvasBg={{
            jsx: (
              <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
                <rect x="0" y="0" width="400" height="600" fill="#1a1a2e" />
                <rect x="20" y="40" width="160" height="200" rx="8" fill="#16213e" stroke="#e94560" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                </rect>
                <text x="100" y="140" textAnchor="middle" fill="#e94560" fontSize="18" fontFamily="system-ui, sans-serif">产品 A</text>
                <rect x="220" y="40" width="160" height="200" rx="8" fill="#16213e" stroke="#0f3460" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="1;0.2;1" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </rect>
                <text x="300" y="140" textAnchor="middle" fill="#53a8e6" fontSize="18" fontFamily="system-ui, sans-serif">产品 B</text>
                <rect x="20" y="300" width="160" height="200" rx="8" fill="#16213e" stroke="#16c79a" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="1;0.2;1" dur="2s" begin="1s" repeatCount="indefinite" />
                </rect>
                <text x="100" y="400" textAnchor="middle" fill="#16c79a" fontSize="18" fontFamily="system-ui, sans-serif">产品 C</text>
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
        note="canvasBg={url} → 自动 svg + background-image\n无动画暗示，适合图片本身就有指引的场景"
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
