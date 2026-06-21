import { useEffect, useState } from 'react'
import { useBake } from 'expub-tool/bakeSvg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

const NOTO_URL = 'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
const TIRRA_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/tirra/files/tirra-latin-400-normal.woff'

export default function BakePage() {
  const { ref, bake } = useBake<HTMLDivElement>({
    fontUrlMap: { NotoSansSC: NOTO_URL, Tirra: TIRRA_URL },
  })
  const [fontReady, setFontReady] = useState(false)
  const [svg, setSvg] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      new FontFace('NotoSansSC', `url(${NOTO_URL})`).load(),
      new FontFace('Tirra', `url(${TIRRA_URL})`).load(),
    ])
      .then((faces) => { faces.forEach((f) => document.fonts.add(f)); setFontReady(true) })
      .catch(() => setFontReady(true))
  }, [])

  const handleBake = async () => { const result = await bake(); setSvg(result.svg) }
  const handleCopy = () => {
    navigator.clipboard.writeText(svg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <h2>bakeSvg — 把已渲染的 DOM 烘焙成矢量 SVG</h2>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        字体状态：{fontReady ? '✅ 已加载（Noto CJK + Tirra）' : '⏳ 加载中…'}
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* 左：原始渲染（ref 挂在包裹两个卡片的 wrapper 上） */}
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>原始（浏览器渲染）</h3>
          <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Noto 中文卡 */}
            <div style={{ width: 300, backgroundColor: '#3b82f6', padding: 20, borderRadius: 12, border: '4px solid #1e40af' }}>
              <p style={{ fontFamily: 'NotoSansSC', fontSize: 36, color: '#fff', margin: 0, lineHeight: 1.2 }}>你好世界</p>
              <p style={{ fontFamily: 'NotoSansSC', fontSize: 18, color: '#dbeafe', margin: '8px 0 0' }}>烘焙测试</p>
            </div>
            {/* Tirra 拉丁卡 */}
            <div style={{ width: 300, backgroundColor: '#059669', padding: 20, borderRadius: 12 }}>
              <p style={{ fontFamily: 'Tirra', fontSize: 40, color: '#fff', margin: 0, lineHeight: 1.2 }}>Bake Test</p>
              <p style={{ fontFamily: 'Tirra', fontSize: 22, color: '#a7f3d0', margin: '6px 0 0' }}>Hello World</p>
            </div>
          </div>
        </div>

        {/* 右：烘焙结果 */}
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>烘焙 SVG（文字转曲）</h3>
          {svg ? (
            <div>
              <div style={{ width: 300, border: '1px dashed #d1d5db' }} dangerouslySetInnerHTML={{ __html: svg }} />
              <button
                onClick={handleCopy}
                style={{ marginTop: 8, padding: '6px 14px', fontSize: 13, borderRadius: 4, border: '1px solid #d1d5db', background: copied ? '#10b981' : '#fff', color: copied ? '#fff' : '#374151', cursor: 'pointer' }}
              >
                {copied ? '已复制' : '复制 SVG'}
              </button>
            </div>
          ) : (
            <div style={{ width: 300, height: 120, border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>点下方「烘焙」</div>
          )}
        </div>
      </div>

      <button
        onClick={handleBake}
        disabled={!fontReady}
        style={{ marginTop: 20, padding: '8px 20px', fontSize: 14, borderRadius: 6, border: 'none', background: fontReady ? '#3b82f6' : '#9ca3af', color: '#fff', cursor: fontReady ? 'pointer' : 'not-allowed' }}
      >
        {fontReady ? '烘焙 → SVG' : '等字体加载…'}
      </button>
    </div>
  )
}
