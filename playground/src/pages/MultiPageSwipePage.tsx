import { useRef, useState } from 'react'
import { MultiPageSwipe } from 'expub-tool/svg'
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

/** 预览面板：照片 + 标题 + 副标题（jsx）。clearRight>0 时右侧留透明条，下层把手可透出 */
const PreviewPanel = ({ bg, img, title, sub, opacity = 1, clearRight = 0 }: {
  bg: string
  img?: string
  title: string
  sub: string
  opacity?: number
  clearRight?: number
}) => {
  const contentWidth = 1080 - clearRight
  return (
    <svg viewBox="0 0 1080 1680" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block', opacity }}>
      <rect x="0" y="0" width={contentWidth} height="1680" fill={bg} />
      {img && (
        <image href={img} x={(contentWidth - 760) / 2} y="180" width="760" height="760" preserveAspectRatio="xMidYMid slice" />
      )}
      <text x={contentWidth / 2} y="1140" textAnchor="middle" fill="#fff" fontSize="92" fontWeight="700" fontFamily="system-ui, sans-serif">{title}</text>
      <text x={contentWidth / 2} y="1250" textAnchor="middle" fill="#e5e7eb" fontSize="42" fontFamily="system-ui, sans-serif">{sub}</text>
      <text x={contentWidth / 2} y="1520" textAnchor="middle" fill="#fff" opacity="0.55" fontSize="32" fontFamily="system-ui, sans-serif">← 抽拉看下一张 →</text>
    </svg>
  )
}

/** 预览把手：圆角色块 + 标签（jsx） */
const PreviewHandle = ({ bg, label, w, h }: { bg: string; label: string; w: number; h: number }) => (
  <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
    <rect x="0" y="0" width={w} height={h} rx="16" fill={bg} />
    <text x={w / 2} y={h / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={Math.min(w, h) * 0.42} fontWeight="700" fontFamily="system-ui, sans-serif">{label}</text>
  </svg>
)

/** 预览背景：浅底 + 横纹（jsx） */
const PreviewBg = () => (
  <svg viewBox="0 0 1080 1680" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
    <rect x="0" y="0" width="1080" height="1680" fill="#f3f4f6" />
    {Array.from({ length: 14 }).map((_, i) => (
      <line key={i} x1="0" y1={i * 120 + 60} x2="1080" y2={i * 120 + 60} stroke="#e5e7eb" strokeWidth="2" />
    ))}
  </svg>
)

export default function MultiPageSwipePage() {
  return (
    <div>
      <h2>MultiPageSwipe — 多卡视差抽拉 + 右侧手动把手</h2>

      <CopyDemo
        title="单卡：右侧把手 + 横向抽拉 3 屏（jsx 内容）"
        note="拽右侧把手往左滑 → 抽出 content 面板\n把手 w200×h400、y=640，x 自动靠右"
      >
        <MultiPageSwipe
          canvasSize={{ w: 1080, h: 1680 }}
          childItems={[{
            tagHandle: { jsx: <PreviewHandle bg="#ef4444" label="拽" w={200} h={400} />, w: 200, h: 400, y: 640 },
            content: [
              { jsx: <PreviewPanel bg="#3b82f6" img={getWechat300x300(1)} title="产品图册" sub="第 1 / 3 屏" /> },
              { jsx: <PreviewPanel bg="#3b82f6" img={getWechat300x300(2)} title="产品图册" sub="第 2 / 3 屏" /> },
              { jsx: <PreviewPanel bg="#3b82f6" img={getWechat300x300(3)} title="产品图册" sub="第 3 / 3 屏" /> },
            ],
          }]}
        />
      </CopyDemo>

      <CopyDemo
        title="4 卡级联：把手 y=0/420/840/1260 错落（content 右侧留透明条，把手透出）"
        note="clearRight=200：每张 content 右侧 200 宽保持透明 → 下层把手不被遮，4 个标签扇形露出\n这就是参考那种「靠 PNG 透明让标签透出」的代码等价做法"
      >
        <MultiPageSwipe
          canvasSize={{ w: 1080, h: 1680 }}
          childItems={[
            { tagHandle: { jsx: <PreviewHandle bg="#ef4444" label="1" w={200} h={400} />, w: 200, h: 400, y: 0 }, content: [
              { jsx: <PreviewPanel bg="#3b82f6" img={getWechat300x300(1)} title="第一章" sub="第 1 / 2 屏 · 引言" clearRight={200} /> },
              { jsx: <PreviewPanel bg="#3b82f6" img={getWechat300x300(2)} title="第一章" sub="第 2 / 2 屏 · 引言" clearRight={200} /> },
            ] },
            { tagHandle: { jsx: <PreviewHandle bg="#10b981" label="2" w={200} h={400} />, w: 200, h: 400, y: 420 }, content: [
              { jsx: <PreviewPanel bg="#8b5cf6" img={getWechat300x300(3)} title="第二章" sub="第 1 / 2 屏 · 入门" clearRight={200} /> },
              { jsx: <PreviewPanel bg="#8b5cf6" img={getWechat300x300(4)} title="第二章" sub="第 2 / 2 屏 · 入门" clearRight={200} /> },
            ] },
            { tagHandle: { jsx: <PreviewHandle bg="#f59e0b" label="3" w={200} h={400} />, w: 200, h: 400, y: 840 }, content: [
              { jsx: <PreviewPanel bg="#ec4899" img={getWechat300x300(5)} title="第三章" sub="第 1 / 2 屏 · 进阶" clearRight={200} /> },
              { jsx: <PreviewPanel bg="#ec4899" img={getWechat300x300(6)} title="第三章" sub="第 2 / 2 屏 · 进阶" clearRight={200} /> },
            ] },
            { tagHandle: { jsx: <PreviewHandle bg="#6366f1" label="4" w={200} h={400} />, w: 200, h: 400, y: 1260 }, content: [
              { jsx: <PreviewPanel bg="#14b8a6" img={getWechat300x300(7)} title="第四章" sub="第 1 / 2 屏 · 实战" clearRight={200} /> },
              { jsx: <PreviewPanel bg="#14b8a6" img={getWechat300x300(8)} title="第四章" sub="第 2 / 2 屏 · 实战" clearRight={200} /> },
            ] },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="任意 w/h/y 把手 + 半透 content + 背景层（全 jsx）"
        note="3 把手大小/位置各异：A(150×300,y100) / B(250×500,y500) / C(180×350,y1100)\ncanvasBg 用 jsx 横纹底；content opacity=0.88 半透，背景透出"
      >
        <MultiPageSwipe
          canvasSize={{ w: 1080, h: 1680 }}
          canvasBg={{ jsx: <PreviewBg /> }}
          childItems={[
            { tagHandle: { jsx: <PreviewHandle bg="#ef4444" label="A" w={150} h={300} />, w: 150, h: 300, y: 100 }, content: [
              { jsx: <PreviewPanel bg="#3b82f6" img={getWechat300x300(2)} title="Card A" sub="窄把手 · 1/2" opacity={0.88} /> },
              { jsx: <PreviewPanel bg="#3b82f6" img={getWechat300x300(3)} title="Card A" sub="窄把手 · 2/2" opacity={0.88} /> },
            ] },
            { tagHandle: { jsx: <PreviewHandle bg="#10b981" label="B" w={250} h={500} />, w: 250, h: 500, y: 500 }, content: [
              { jsx: <PreviewPanel bg="#8b5cf6" img={getWechat300x300(4)} title="Card B" sub="宽把手 · 1/2" opacity={0.88} /> },
              { jsx: <PreviewPanel bg="#8b5cf6" img={getWechat300x300(5)} title="Card B" sub="宽把手 · 2/2" opacity={0.88} /> },
            ] },
            { tagHandle: { jsx: <PreviewHandle bg="#f59e0b" label="C" w={180} h={350} />, w: 180, h: 350, y: 1100 }, content: [
              { jsx: <PreviewPanel bg="#ec4899" img={getWechat300x300(6)} title="Card C" sub="中把手 · 1/2" opacity={0.88} /> },
              { jsx: <PreviewPanel bg="#ec4899" img={getWechat300x300(7)} title="Card C" sub="中把手 · 2/2" opacity={0.88} /> },
            ] },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
