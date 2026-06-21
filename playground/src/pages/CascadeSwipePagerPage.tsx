import { useRef, useState } from 'react'
import { CascadeSwipePager } from 'expub-tool/svg'
import getPlaceHolderPic1 from '../api/placeHolderPic/getPlaceHolderPic1'

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

/** 横向面板（540×840 → 铺满 1080×1680）；transparency<255 半透，下层把手可透出 */
const panel = (color: string, label: string, transparency = 255) => ({
  url: getPlaceHolderPic1(540, 840, color, label, transparency),
})

/** 右侧把手：内容 + 手动 w/h/y（x 自动靠右） */
const handle = (color: string, label: string, w: number, h: number, y: number) => ({
  url: getPlaceHolderPic1(w, h, color, label, 255),
  w, h, y,
})

export default function CascadeSwipePagerPage() {
  return (
    <div>
      <h2>CascadeSwipePager — 多卡视差抽拉 + 右侧手动把手</h2>

      <CopyDemo
        title="单卡：右侧把手 + 横向抽拉 3 面板"
        note="拽右侧把手往左滑 → 抽出 content 面板（像横向卷轴）\n把手 w200×h400、y=600，x 自动靠右"
      >
        <CascadeSwipePager
          canvasSize={{ w: 1080, h: 1680 }}
          childItems={[{
            tagHandle: handle('EF4444', 'PULL', 200, 400, 600),
            content: [panel('3B82F6', 'C1-a'), panel('3B82F6', 'C1-b'), panel('3B82F6', 'C1-c')],
          }]}
        />
      </CopyDemo>

      <CopyDemo
        title="4 卡级联：把手按 y=0/420/840/1260 错落（各 1/4 高）"
        note="多卡零高视差叠加 → 只有最上层完全可见；这里 content 用 transparency=120 半透，下层把手才透得出来\n真用时要靠 PNG 透明（content 在右侧把手那一条透明）"
      >
        <CascadeSwipePager
          canvasSize={{ w: 1080, h: 1680 }}
          childItems={[
            { tagHandle: handle('EF4444', '1', 200, 400, 0), content: [panel('3B82F6', 'C1', 120), panel('3B82F6', 'C1+', 120)] },
            { tagHandle: handle('10B981', '2', 200, 400, 420), content: [panel('8B5CF6', 'C2', 120), panel('8B5CF6', 'C2+', 120)] },
            { tagHandle: handle('F59E0B', '3', 200, 400, 840), content: [panel('EC4899', 'C3', 120), panel('EC4899', 'C3+', 120)] },
            { tagHandle: handle('6366F1', '4', 200, 400, 1260), content: [panel('14B8A6', 'C4', 120), panel('14B8A6', 'C4+', 120)] },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="把手任意 w/h/y（手动几何，不必均分）"
        note="3 个把手大小/位置各异：A(150×300,y100) / B(250×500,y500) / C(180×350,y1100)"
      >
        <CascadeSwipePager
          canvasSize={{ w: 1080, h: 1680 }}
          canvasBg={{ url: getPlaceHolderPic1(540, 840, 'F3F4F6', 'BG', 255) }}
          childItems={[
            { tagHandle: handle('EF4444', 'A', 150, 300, 100), content: [panel('3B82F6', 'A', 120)] },
            { tagHandle: handle('10B981', 'B', 250, 500, 500), content: [panel('8B5CF6', 'B', 120)] },
            { tagHandle: handle('F59E0B', 'C', 180, 350, 1100), content: [panel('EC4899', 'C', 120)] },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
