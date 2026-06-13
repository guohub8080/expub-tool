import { useRef, useState } from 'react'
import { AnyCarousel } from 'expub-tool/svg'
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

export default function AnyCarouselPage() {
  return (
    <div>
      <h2>AnyCarousel — 通用单向 Stack 轮播</h2>

      <CopyDemo title="水平向右（angle=0）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 600 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={60}
          childItems={[
            { url: getWechat300x500(1), scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(2), scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(3), scale: { sideValue: 0.78, centerValue: 1 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="水平向左（angle=180 / isReversed）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 600 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          isReversed
          itemGap={60}
          childItems={[
            { url: getWechat300x500(4), scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(5), scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(6), scale: { sideValue: 0.78, centerValue: 1 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="垂直向下（angle=90）">
        <AnyCarousel
          canvasSize={{ w: 400, h: 800 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={90}
          itemGap={60}
          childItems={[
            { url: getWechat300x500(7), opacity: { sideValue: 0.4, centerValue: 1 } },
            { url: getWechat300x500(8), opacity: { sideValue: 0.4, centerValue: 1 } },
            { url: getWechat300x500(9), opacity: { sideValue: 0.4, centerValue: 1 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="对角线（angle=135）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 600 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={135}
          itemGap={60}
          childItems={[
            { url: getWechat300x500(1), scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(2), scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(3), scale: { sideValue: 0.78, centerValue: 1 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="快速切换（switchDuration=0.3, stayDuration=0.5）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 600 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={60}
          childItems={[
            { url: getWechat300x500(1), switchDuration: 0.3, stayDuration: 0.5, scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(2), switchDuration: 0.3, stayDuration: 0.5, scale: { sideValue: 0.78, centerValue: 1 } },
            { url: getWechat300x500(3), switchDuration: 0.3, stayDuration: 0.5, scale: { sideValue: 0.78, centerValue: 1 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="中心浮动（translate.stay + scale 呼吸）">
        <AnyCarousel
          canvasSize={{ w: 800, h: 600 }}
          itemCanvasSize={{ w: 300, h: 500 }}
          angle={0}
          itemGap={60}
          childItems={[
            {
              url: getWechat300x500(4),
              stayDuration: 1.5,
              scale: {
                sideValue: 0.78,
                centerValue: 1,
                stay: { timeline: [{ durationSeconds: 0.6, toAbs: 1.05 }, { durationSeconds: 0.6, toAbs: 1 }] },
              },
              translate: {
                stay: { timeline: [{ durationSeconds: 0.6, toAbs: { x: 0, y: -8 } }, { durationSeconds: 0.6, toAbs: { x: 0, y: 8 } }] },
              },
            },
            {
              url: getWechat300x500(5),
              stayDuration: 1.5,
              scale: {
                sideValue: 0.78,
                centerValue: 1,
                stay: { timeline: [{ durationSeconds: 0.6, toAbs: 1.05 }, { durationSeconds: 0.6, toAbs: 1 }] },
              },
              translate: {
                stay: { timeline: [{ durationSeconds: 0.6, toAbs: { x: 0, y: -8 } }, { durationSeconds: 0.6, toAbs: { x: 0, y: 8 } }] },
              },
            },
            {
              url: getWechat300x500(6),
              stayDuration: 1.5,
              scale: {
                sideValue: 0.78,
                centerValue: 1,
                stay: { timeline: [{ durationSeconds: 0.6, toAbs: 1.05 }, { durationSeconds: 0.6, toAbs: 1 }] },
              },
              translate: {
                stay: { timeline: [{ durationSeconds: 0.6, toAbs: { x: 0, y: -8 } }, { durationSeconds: 0.6, toAbs: { x: 0, y: 8 } }] },
              },
            },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
