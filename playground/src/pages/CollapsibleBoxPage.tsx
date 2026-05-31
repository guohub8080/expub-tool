import { useRef, useState } from 'react'
import { CollapsibleBox, PlaceHolder } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

const ImgSvg = ({ url, w, h }: { url: string; w: number; h: number }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundImage: `url(${url})` }} />
)

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
            padding: '4px 12px',
            fontSize: 12,
            borderRadius: 4,
            border: '1px solid #d1d5db',
            background: copied ? '#10b981' : '#fff',
            color: copied ? '#fff' : '#374151',
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  )
}

export default function CollapsibleBoxPage() {
  return (
    <div>
      <h2>CollapsibleBox — 坍塌盒子</h2>

      <CopyDemo title="纯坍塌消失（300×300）">
        <CollapsibleBox
          canvasSize={{ w: 300, h: 300 }}
          hotArea={{ x: 0, y: 0, w: 300, h: 300 }}
        >
          <ImgSvg url={getWechat300x300(1)} w={300} h={300} />
        </CollapsibleBox>
      </CopyDemo>

      <CopyDemo title="纯坍塌消失（300×500）">
        <CollapsibleBox
          canvasSize={{ w: 300, h: 500 }}
          hotArea={{ x: 0, y: 0, w: 300, h: 500 }}
        >
          <ImgSvg url={getWechat300x500(1)} w={300} h={500} />
        </CollapsibleBox>
      </CopyDemo>

      <CopyDemo title="坍塌 + 替换内容（300×300）">
        <CollapsibleBox
          canvasSize={{ w: 300, h: 300 }}
          hotArea={{ x: 0, y: 0, w: 300, h: 300 }}
          afterContent={<ImgSvg url={getWechat300x300(2)} w={300} h={300} />}
        >
          <ImgSvg url={getWechat300x300(3)} w={300} h={300} />
        </CollapsibleBox>
      </CopyDemo>

      <CopyDemo title="坍塌 + 下方占位撑高（300×300）">
        <CollapsibleBox
          canvasSize={{ w: 300, h: 300 }}
          hotArea={{ x: 0, y: 0, w: 300, h: 300 }}
        >
          <ImgSvg url={getWechat300x300(1)} w={300} h={300} />
        </CollapsibleBox>
        <PlaceHolder canvasSize={{ w: 300, h: 300 }} color="#f0f0f0" />
      </CopyDemo>

      <CopyDemo title="坍塌 + 替换内容（300×500）">
        <CollapsibleBox
          canvasSize={{ w: 300, h: 500 }}
          hotArea={{ x: 0, y: 0, w: 300, h: 500 }}
          afterContent={<ImgSvg url={getWechat300x500(2)} w={300} h={500} />}
        >
          <ImgSvg url={getWechat300x500(3)} w={300} h={500} />
        </CollapsibleBox>
      </CopyDemo>

      <CopyDemo title="局部热区 + 延迟坍塌淡入（300×500）">
        <CollapsibleBox
          canvasSize={{ w: 300, h: 500 }}
          hotArea={{ x: 100, y: 200, w: 100, h: 100 }}
          collapseDelay={1}
          afterContent={<ImgSvg url={getWechat300x500(4)} w={300} h={500} />}
        >
          <ImgSvg url={getWechat300x500(5)} w={300} h={500} />
        </CollapsibleBox>
      </CopyDemo>
    </div>
  )
}
