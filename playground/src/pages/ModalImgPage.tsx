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
        title="url 背景 + 2 个热区"
        note="canvasBg={url} → 自动渲染 svg+background-image\n点击热区 → 微信原生图片预览"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 600 }}
          canvasBg={{ url: getPlaceHolderPic1(400, 600, '1e293b', '94a3b8') }}
          childItems={[
            { hotArea: { x: 40, y: 100, w: 140, h: 180 }, imgUrl: getWechat300x300(1) },
            { hotArea: { x: 220, y: 100, w: 140, h: 180 }, imgUrl: getWechat300x300(2) },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="url 背景 + 4 个热区（错落排布）"
        note="不同 x/y/w/h 的热区，模拟参考代码的 8 热区布局（这里放 4 个）"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 800 }}
          canvasBg={{ url: getPlaceHolderPic1(400, 800, '7c2d12', 'fed7aa') }}
          childItems={[
            { hotArea: { x: 20, y: 50, w: 160, h: 200 }, imgUrl: getWechat300x300(1) },
            { hotArea: { x: 220, y: 50, w: 160, h: 200 }, imgUrl: getWechat300x300(2) },
            { hotArea: { x: 20, y: 350, w: 160, h: 200 }, imgUrl: getWechat300x300(3) },
            { hotArea: { x: 220, y: 350, w: 160, h: 200 }, imgUrl: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="jsx 背景（用户自己写整个 svg）+ 2 个热区"
        note="canvasBg={{ jsx: <svg>...</svg> }} → 整个 svg 由用户写，组件不包裹\n点击热区 → 微信原生图片预览"
      >
        <ModalImg
          canvasSize={{ w: 400, h: 400 }}
          canvasBg={{
            jsx: (
              <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
                <rect x="0" y="0" width="400" height="400" fill="#065f46" />
                <circle cx="200" cy="120" r="60" fill="#10b981" />
                <rect x="80" y="220" width="240" height="120" rx="12" fill="#047857" stroke="#34d399" strokeWidth="3" />
                <text x="200" y="290" textAnchor="middle" fill="#a7f3d0" fontSize="24" fontFamily="system-ui, sans-serif">点击下方图片</text>
              </svg>
            ),
          }}
          childItems={[
            { hotArea: { x: 100, y: 80, w: 80, h: 80 }, imgUrl: getWechat300x300(5) },
            { hotArea: { x: 220, y: 80, w: 80, h: 80 }, imgUrl: getWechat300x300(6) },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
