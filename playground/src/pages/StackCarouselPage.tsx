import { useRef, useState } from 'react'
import { DIRECTION_8 } from 'expub-tool/svg'
import { StackCarousel } from 'expub-tool/svg'
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
      <div ref={ref}>{children}</div>
    </div>
  )
}

export default function StackCarouselPage() {
  const layerImages = [1, 2, 3, 4, 5].map(i => ({ url: getWechat300x300(i) }))

  return (
    <div>
      <h2>StackCarousel — 两点定方向的叠层轮播</h2>

      <CopyDemo title="默认（水平）— tailChild 缺省向右延伸，4 图">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="mainChild 偏移（中心从 540,540 上移到 540,300）">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900, centerX: 540, centerY: 300 }}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="斜向叠层 — tailChild 在右下 (980,900)、scale 0.2，showStackNum=5">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
            { url: getWechat300x300(5) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="纵向叠层 — tailChild 在下方 (540,970)、scale 0.3，showStackNum=4">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.3, centerX: 540, centerY: 970 }}
          showStackNum={4}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="showStackNum=2 — 仅 tail + center 两层">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          showStackNum={2}
          childItems={[
            { url: getWechat300x300(1) },
            { url: getWechat300x300(2) },
            { url: getWechat300x300(3) },
            { url: getWechat300x300(4) },
          ]}
        />
      </CopyDemo>

      {/* —— depthLaw 教学：一个数字控制 scale + 位置的深度曲线 —— */}

      {/* —— depthLaw 教学：一个数字控制 scale + 位置的深度曲线 —— */}

      <CopyDemo
        title="depthLaw · A 基准（=1 线性，露边相等）"
        note={`depthLaw={1}   ← 默认，scale 和位置都线性，每张卡露边相等`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          depthLaw={1}
          childItems={layerImages}
        />
      </CopyDemo>

      <CopyDemo
        title="B · depthLaw={2}（平方，tail 侧压缩 = 透视感）"
        note={`depthLaw={2}   ← tail 侧 scale 小、间距密，远处叠在一起`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          depthLaw={2}
          childItems={layerImages}
        />
      </CopyDemo>

      <CopyDemo
        title="C · depthLaw={0.8}（tail 侧温和拉开）"
        note={`depthLaw={0.8}   ← tail 侧拉开，比 1 略松（与 B 压缩反向）`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          depthLaw={0.8}
          childItems={layerImages}
        />
      </CopyDemo>

      <CopyDemo
        title="D · depthLaw={3}（立方，tail 极致压缩）"
        note={`depthLaw={3}   ← tail 几乎一样小且贴紧，靠近 center 才骤大`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          depthLaw={3}
          childItems={layerImages}
        />
      </CopyDemo>

      <CopyDemo
        title="G · rotate 扇形展开（tail 侧转得狠，center 不转，pivot 默认中心）"
        note={`showStackConfig rotate = [25, 15, 8, 3, 0]   ← tail→center，pivot 默认 "Center"（绕卡片中心自转）`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          showStackConfig={[
            { rotate: 25 },
            { rotate: 15 },
            { rotate: 8 },
            { rotate: 3 },
            { rotate: 0 },
          ]}
          childItems={layerImages}
        />
      </CopyDemo>

      <CopyDemo
        title="H · rotate + 自定义 pivot（绕右下角扇形展开）"
        note={`rotate = [30, 18, 9, 3, 0]  +  stackRotatePivot: "BottomRight"   ← 绕 card 右下角自转`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          stackRotatePivot="BottomRight"
          showStackConfig={[
            { rotate: 30 },
            { rotate: 18 },
            { rotate: 9 },
            { rotate: 3 },
            { rotate: 0 },
          ]}
          childItems={layerImages}
        />
      </CopyDemo>

      <CopyDemo
        title="I · stayRotate — 每张卡 center 位旋转不同（per-item，非全局）"
        note={`childItems[i].stayRotate = [-6, 4, -3, 8, 0]   ← 每张卡到 center 时各自倾斜`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          showStackNum={5}
          childItems={[
            { url: getWechat300x300(1), stayRotate: -6 },
            { url: getWechat300x300(2), stayRotate: 4 },
            { url: getWechat300x300(3), stayRotate: -3 },
            { url: getWechat300x300(4), stayRotate: 8 },
            { url: getWechat300x300(5), stayRotate: 0 },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="J · stayRotate + stackRotatePivot（绕右下角倾斜）"
        note={`stackRotatePivot: "BottomRight"  +  stayRotate = [12, -10, 6, -8, 0]   ← 绕右下角倾斜`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 700, h: 700, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.2, centerX: 980, centerY: 900 }}
          stackRotatePivot="BottomRight"
          showStackNum={5}
          childItems={[
            { url: getWechat300x300(1), stayRotate: 12 },
            { url: getWechat300x300(2), stayRotate: -10 },
            { url: getWechat300x300(3), stayRotate: 6 },
            { url: getWechat300x300(4), stayRotate: -8 },
            { url: getWechat300x300(5), stayRotate: 0 },
          ]}
        />
      </CopyDemo>

      <CopyDemo
        title="K · mainChild 偏移右上 + 退场距离自动补偿（卡牌不残留画布）"
        note={`mainChild.center = (880, 200) 偏右上，tail 在左下 → 退场朝右上飞，距离自动算够移出 viewBox`}
      >
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 600, h: 600, centerX: 880, centerY: 200 }}
          tailChild={{ scale: 0.25, centerX: 200, centerY: 880 }}
          showStackNum={4}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.6, stayDuration: 1 },
            { url: getWechat300x300(2), switchDuration: 0.6, stayDuration: 1 },
            { url: getWechat300x300(3), switchDuration: 0.6, stayDuration: 1 },
            { url: getWechat300x300(4), switchDuration: 0.6, stayDuration: 1 },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="八方向退场 (L/R/T/B/TL/TR/BL/BR)">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(2), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(3), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Top } },
            { url: getWechat300x300(4), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Bottom } },
            { url: getWechat300x300(5), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.TopLeft } },
            { url: getWechat300x300(6), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.TopRight } },
            { url: getWechat300x300(7), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.BottomLeft } },
            { url: getWechat300x300(8), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.BottomRight } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="四面八方退场 + 长短不一的停留">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 2.5, exit: { direction: DIRECTION_8.Left } },
            { url: getWechat300x300(2), switchDuration: 1.2, stayDuration: 0.3, exit: { direction: DIRECTION_8.Right } },
            { url: getWechat300x300(3), switchDuration: 0.8, stayDuration: 1.5, exit: { direction: DIRECTION_8.Top } },
            { url: getWechat300x300(4), switchDuration: 0.4, stayDuration: 3,   exit: { direction: DIRECTION_8.Bottom } },
            { url: getWechat300x300(5), switchDuration: 1,   stayDuration: 0.8, exit: { direction: DIRECTION_8.Left } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="退场 skew + rotate + scale">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.6, stayDuration: 1, exit: { direction: DIRECTION_8.Left, skew: { type: "Y", angle: 15 }, scale: 0.8 } },
            { url: getWechat300x300(2), switchDuration: 0.8, stayDuration: 1, exit: { direction: DIRECTION_8.Right, rotation: { pivot: "TopRight", angle: 25 }, scale: 1.2 } },
            { url: getWechat300x300(3), switchDuration: 0.5, stayDuration: 1, exit: { direction: DIRECTION_8.Top, skew: { type: "X", angle: -10 }, rotation: { pivot: "BottomLeft", angle: -15 } } },
            { url: getWechat300x300(4), switchDuration: 1, stayDuration: 1, exit: { direction: DIRECTION_8.Bottom, skew: { type: "Y", angle: 20 }, rotation: { angle: 30 }, scale: 0.5 } },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="反向水平叠层 — tailChild 在左侧 (320,540)、scale 0.65，退场默认朝右">
        <StackCarousel
          canvasSize={{ w: 1080, h: 1080 }}
          mainChild={{ w: 900, h: 900, centerX: 540, centerY: 540 }}
          tailChild={{ scale: 0.65, centerX: 320, centerY: 540 }}
          childItems={[
            { url: getWechat300x300(1), switchDuration: 0.5, stayDuration: 1.5, exit: { scale: 0.6 } },
            { url: getWechat300x300(2), switchDuration: 1,   stayDuration: 0.5, exit: { scale: 1.3 } },
            { url: getWechat300x300(3), switchDuration: 0.8, stayDuration: 2,   exit: { scale: 0.4 } },
            { url: getWechat300x300(4), switchDuration: 0.3, stayDuration: 3,   exit: { scale: 1.5 } },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
