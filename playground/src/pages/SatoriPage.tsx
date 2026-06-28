import { useState, useEffect, type ReactNode } from 'react'
import satori from 'satori'

const box: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={box}>
      <h3 style={{ marginTop: 0, fontSize: 15 }}>{title}</h3>
      {children}
    </div>
  )
}

/** 加载字体为 ArrayBuffer(Satori 需要) */
async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  return res.arrayBuffer()
}

/** 共享的样式:用于「原始 HTML 预览」和「Satori 输入」两边,保证对比公平。
 *  关键:fontFamily 写成 'Arial, Noto Sans SC' —— 英文优先用 Arial,中文 fallback 到 Noto。 */
const CONTENT_STYLE = {
  fontFamily: 'Arial, Noto Sans SC, sans-serif',
  fontSize: 14,
  lineHeight: 1.8,
  color: '#1e293b',
} as const

const TITLE_COLOR = '#7c2d12'
const UNDERLINE_COLOR = '#dc2626'
const BG_COLOR = '#fefce8'

/** 富文本内容组件 —— 同时用于「原始 HTML 预览」和「Satori 输入」。
 *  通过 prop 控制是否加 display:flex(Satori 需要,浏览器预览不需要)。
 *  固定 400×560 尺寸,确保左右对比两边完全对齐。 */
function RichContent({ forSatori = false }: { forSatori?: boolean }) {
  // Satori 要求每个多子节点元素显式 display:flex;浏览器预览则用普通 block 布局
  const flex = forSatori ? { display: 'flex' } : {}
  const flexCol = forSatori ? { display: 'flex', flexDirection: 'column' as const } : {}

  return (
    <div style={{
      ...flexCol,
      width: 400, height: 560,
      padding: 24, backgroundColor: BG_COLOR,
      boxSizing: 'border-box',
      ...CONTENT_STYLE,
    }}>
      <div style={{ ...flex, fontSize: 20, fontWeight: 700, color: TITLE_COLOR, marginBottom: 12 }}>
        Satori 富文本测试 Rich Text
      </div>

      <div style={{ ...flex, marginBottom: 12 }}>
        这是一段用于测试的长文章(a long paragraph for testing)。Satori 会把 React 渲染成矢量 SVG,
        文字转成 path 路径。英文用 Arial,中文用 Noto Sans SC。
      </div>

      <div style={{ ...flex, fontSize: 16, fontWeight: 700, color: TITLE_COLOR, marginTop: 16, marginBottom: 8 }}>
        为什么需要 border-bottom?
      </div>
      <div style={{ ...flex, marginBottom: 12 }}>
        因为 text-decoration:underline 在 Satori 中支持有限。我们用 border-bottom 模拟下划线,
        强调关键词,这样导出后仍能保留下划线效果。
      </div>

      <div style={{ ...flex, fontSize: 16, fontWeight: 700, color: TITLE_COLOR, marginTop: 16, marginBottom: 8 }}>
        关键概念 Key Concepts
      </div>
      {/* 行内混排:用 display: contents 包裹层,让内部文字和带样式 span 流入父级行,
          实现真正的 inline 文字流(不重叠、正确换行)。
          display: contents = 该元素不产生盒子,子元素直接参与父级布局。
          这是 Satori 里实现"同一段话中间加粗/下划线"的正确方式。 */}
      <div style={{ ...flex, marginBottom: 12 }}>
        <span style={{ display: 'contents' }}>
          <span>矢量文字意味着</span>
          <span style={{
            fontWeight: 700,
            textDecoration: 'underline',
            textDecorationColor: UNDERLINE_COLOR,
          }}>
            放大不失真 Vector Text
          </span>
          <span>,适合打印和高清显示。这是后续文字继续排列测试混排效果。</span>
        </span>
      </div>

      <div style={{ ...flex, fontSize: 16, fontWeight: 700, color: TITLE_COLOR, marginTop: 16, marginBottom: 8 }}>
        总结 Summary
      </div>
      <div style={{ ...flex }}>
        本测试验证了 long text wrapping(长文本换行)、bold(加粗)和 underline emphasis(下划线强调)三种效果。
      </div>
    </div>
  )
}

export default function SatoriPage() {
  const [svgString, setSvgString] = useState<string>('')
  const [status, setStatus] = useState<string>('待渲染')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setStatus('加载字体中…')
        setError('')

        // 加载 4 个字体:Arial(英文 Regular+Bold)+ Noto Sans SC(中文 Regular+Bold)
        const [arialReg, arialBold, notoReg, notoBold] = await Promise.all([
          loadFont('/fonts/Arial.ttf'),
          loadFont('/fonts/Arial-Bold.ttf'),
          loadFont('/fonts/NotoSansSC-Regular.woff'),
          loadFont('/fonts/NotoSansSC-Bold.woff'),
        ])
        if (cancelled) return

        setStatus('渲染中…')
        // RichContent 自身已是 400×560 固定尺寸,直接作为根元素传给 Satori
        const element = <RichContent forSatori />

        const svg = await satori(element, {
          width: 400,
          height: 560,
          fonts: [
            { name: 'Arial', data: arialReg, weight: 400, style: 'normal' as const },
            { name: 'Arial', data: arialBold, weight: 700, style: 'normal' as const },
            { name: 'Noto Sans SC', data: notoReg, weight: 400, style: 'normal' as const },
            { name: 'Noto Sans SC', data: notoBold, weight: 700, style: 'normal' as const },
          ],
        })
        if (cancelled) return

        setSvgString(svg)
        const pathCount = (svg.match(/<path/g) || []).length
        setStatus(`✅ 渲染成功(${pathCount} 个 <path>,${svg.length} 字符)`)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
          setStatus('❌ 渲染失败')
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h2>Satori</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        Vercel Satori 把 React 渲染成矢量 SVG。文字转 <code>&lt;path&gt;</code>(无 opentype.js NaN bug)。
        <strong> 英文优先 Arial,中文 fallback 到 Noto Sans SC</strong>(标准 CSS font-family 行为)。
      </p>

      <Section title="对比:原始 HTML vs Satori 产物">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* 左:原始 HTML(浏览器渲染,固定 400×560,和右边对齐) */}
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
              原始 HTML(浏览器渲染)
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', width: 400 }}>
              <RichContent />
            </div>
          </div>

          {/* 右:Satori 产物(同样 400×560) */}
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
              Satori 产物 SVG
            </div>
            <div
              style={{ width: 400, background: '#f9fafb', borderRadius: 8, padding: 8, minHeight: 100 }}
              dangerouslySetInnerHTML={svgString ? { __html: svgString } : undefined}
            />
          </div>
        </div>
      </Section>

      <Section title="状态">
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>{status}</p>
        {error && (
          <pre style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: 8, borderRadius: 4, whiteSpace: 'pre-wrap' }}>
            {error}
          </pre>
        )}
      </Section>

      {svgString && (
        <Section title="产物 SVG 源码(d 已折叠)">
          <pre style={{ fontSize: 11, fontFamily: 'monospace', background: '#f9fafb', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
            {svgString.replace(/d="[^"]{30,}"/g, 'd="(path data)"').slice(0, 3000)}
            {svgString.length > 3000 ? '\n…(截断)' : ''}
          </pre>
        </Section>
      )}
    </div>
  )
}
