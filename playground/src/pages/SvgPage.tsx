import { useRef, useState } from 'react'
import {
  SwipeViewXContainer,
  SnapSwipeViewXContainer,
  SwipeViewYContainer,
  SnapSwipeViewYContainer,
} from 'expub-tool/svg'
import { animateSoftBlink, animateHardBlink, transformBreathe, transformFloat } from 'expub-tool/behaviors'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'
import getWechat300x500 from '../api/placeHolderPic/getWechat300x500'

/** SVG + background-image 渲染图片 */
const ImgSvg = ({ url, w, h }: { url: string; w: number; h: number }) => (
  <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundImage: `url(${url})` }} />
)

/** 带 Copy HTML 按钮的演示卡片 */
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

/** 白色三角箭头 + 柔和闪烁 */
const BlinkArrowItem = ({ url }: { url: string }) => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundImage: `url(${url})` }}>
    <g transform="translate(130, 455)">
      <polygon points="20,0 0,24 40,24" fill="white" opacity="0.8">
        {animateSoftBlink()}
      </polygon>
    </g>
  </svg>
)

/** 圆形指示点 + 硬闪烁 */
const HardBlinkDotItem = ({ url }: { url: string }) => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundImage: `url(${url})` }}>
    <g transform="translate(135, 455)">
      <circle cx="15" cy="15" r="15" fill="white" opacity="1">
        {animateHardBlink()}
      </circle>
      <polygon points="15,22 5,36 25,36" fill="white" opacity="1">
        {animateHardBlink()}
      </polygon>
    </g>
  </svg>
)

/** 双箭头 + 浮动上下 */
const FloatArrowsItem = ({ url }: { url: string }) => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundImage: `url(${url})` }}>
    <g transform="translate(110, 445)">
      <polygon points="20,0 0,18 40,18" fill="white" opacity="0.7">
        {transformFloat({ floatRangeY: 10 })}
      </polygon>
      <polygon points="60,0 40,18 80,18" fill="white" opacity="0.7">
        {transformFloat({ floatRangeY: 10, begin: '0.3s' })}
      </polygon>
    </g>
  </svg>
)

/** 呼吸圆圈指示 */
const BreatheCircleItem = ({ url }: { url: string }) => (
  <svg viewBox="0 0 300 500" style={{ width: '100%', display: 'block', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundImage: `url(${url})` }}>
    <g transform="translate(135, 450)">
      <circle cx="15" cy="15" r="15" fill="white" opacity="0.6">
        {transformBreathe({ origin: [15, 15], fromScale: 1, toScale: 1.3 })}
      </circle>
    </g>
  </svg>
)

export default function SvgPage() {
  return (
    <div>
      <h2>SVG — Containers</h2>

      <CopyDemo title="SwipeViewXContainer — 横向自由滑动（peek 露出）">
        <SwipeViewXContainer exposedPercent={80} items={[
          <ImgSvg url={getWechat300x300(1)} w={300} h={300} />,
          <ImgSvg url={getWechat300x300(2)} w={300} h={300} />,
          <ImgSvg url={getWechat300x300(3)} w={300} h={300} />,
        ]} />
      </CopyDemo>

      <CopyDemo title="SnapSwipeViewXContainer — 横向吸附滑动（peek 露出）">
        <SnapSwipeViewXContainer exposedPercent={80} items={[
          <ImgSvg url={getWechat300x300(4)} w={300} h={300} />,
          <ImgSvg url={getWechat300x300(5)} w={300} h={300} />,
          <ImgSvg url={getWechat300x300(6)} w={300} h={300} />,
        ]} />
      </CopyDemo>

      <CopyDemo title="SwipeViewYContainer — 纵向自由滑动">
        <SwipeViewYContainer canvasSize={{ w: 300, h: 500 }} items={[
          <ImgSvg url={getWechat300x500(1)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(2)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(3)} w={300} h={500} />,
        ]} />
      </CopyDemo>

      <CopyDemo title="SnapSwipeViewYContainer — 纵向吸附滑动（抖音效果）">
        <SnapSwipeViewYContainer canvasSize={{ w: 300, h: 500 }} items={[
          <ImgSvg url={getWechat300x500(4)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(5)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(6)} w={300} h={500} />,
        ]} />
      </CopyDemo>

      <CopyDemo title="嵌套动画 — 背景图 + 各式指示动画">
        <SnapSwipeViewYContainer canvasSize={{ w: 300, h: 500 }} items={[
          <BlinkArrowItem url={getWechat300x500(1)} />,
          <HardBlinkDotItem url={getWechat300x500(2)} />,
          <FloatArrowsItem url={getWechat300x500(3)} />,
          <BreatheCircleItem url={getWechat300x500(4)} />,
        ]} />
      </CopyDemo>

      <CopyDemo title="isBottomUp — 底部向上滑动（180° 翻转）">
        <SwipeViewYContainer canvasSize={{ w: 300, h: 500 }} isBottomUp items={[
          <ImgSvg url={getWechat300x500(1)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(2)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(3)} w={300} h={500} />,
        ]} />
      </CopyDemo>

      <CopyDemo title="isBottomUp + snap — 底部向上吸附滑动">
        <SnapSwipeViewYContainer canvasSize={{ w: 300, h: 500 }} isBottomUp items={[
          <ImgSvg url={getWechat300x500(4)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(5)} w={300} h={500} />,
          <ImgSvg url={getWechat300x500(6)} w={300} h={500} />,
        ]} />
      </CopyDemo>
    </div>
  )
}
