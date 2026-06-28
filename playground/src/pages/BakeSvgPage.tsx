import { useRef, useState, useEffect } from 'react'
import htmlToSvg from 'expub-tool/bake-svg'

const box: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={box}>
      <h3 style={{ marginTop: 0, fontSize: 15 }}>{title}</h3>
      {children}
    </div>
  )
}

/** 被渲染的 HTML 内容(原样展示在左边) */
const SOURCE_STYLE: React.CSSProperties = {
  boxSizing: 'border-box',
  width: 280,
  padding: 20,
  backgroundColor: '#1e293b',
  borderRadius: 12,
  color: '#f8fafc',
  fontFamily: 'Arial, sans-serif',
  fontSize: 18,
  fontWeight: 700,
  border: '2px solid #64748b',
}

/** 大字号对照块:用于诊断是否 hinting 差异(大字号下差异应几乎消失) */
const SOURCE_STYLE_LARGE: React.CSSProperties = {
  boxSizing: 'border-box',
  width: 280,
  padding: 20,
  backgroundColor: '#1e293b',
  borderRadius: 12,
  color: '#f8fafc',
  fontFamily: 'Arial, sans-serif',
  fontSize: 48,
  fontWeight: 700,
  border: '2px solid #64748b',
}

/** 富文本测试块:长文章 + 加粗 + border-bottom 下划线强调
 *  目的:验证 border-bottom + 可变字体(Inter)+ 中文 fallback 的混排效果 */
const RICH_STYLE: React.CSSProperties = {
  boxSizing: 'border-box',
  width: 320,
  padding: 24,
  backgroundColor: '#fefce8',
  borderRadius: 8,
  color: '#1e293b',
  // Inter 可变字体优先(英文),中文 fallback 到 Noto Sans SC
  fontFamily: 'Inter, Noto Sans SC, sans-serif',
  fontSize: 14,
  lineHeight: 1.8,
}

/** 下划线强调词样式(border-bottom 模拟下划线) */
const UNDERLINE_SPAN: React.CSSProperties = {
  borderBottom: '2px solid #dc2626',
  fontWeight: 700,
  paddingBottom: 1,
}

/** 行背景高亮样式:整段背景色 + 圆角,模拟「重点段落」标记 */
const HIGHLIGHT_BLOCK: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  borderRadius: 6,
  padding: '8px 12px',
  margin: '8px 0',
}

/** 行内高亮词样式:黄底(模拟荧光笔标记)
 *  压力测试:加 margin x/y + padding x/y,验证 inline 元素跨行时的背景渲染 */
const HIGHLIGHT_INLINE: React.CSSProperties = {
  backgroundColor: '#fde047',
  padding: '3px 6px',       // padding y=3, x=6
  margin: '0 4px',          // margin x=4
  borderRadius: 3,
  fontWeight: 700,
}

/** 段落标题样式 */
const PARA_TITLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  marginTop: 16,
  marginBottom: 8,
  color: '#7c2d12',
}

export default function BakeSvgPage() {
  const sourceRef = useRef<HTMLDivElement>(null)
  const sourceLargeRef = useRef<HTMLDivElement>(null)
  const richRef = useRef<HTMLDivElement>(null)
  const variableRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const [svgString, setSvgString] = useState<string>('')
  const [svgLargeString, setSvgLargeString] = useState<string>('')
  const [svgRichString, setSvgRichString] = useState<string>('')
  const [svgVariableString, setSvgVariableString] = useState<string>('')
  const [svgHighlightString, setSvgHighlightString] = useState<string>('')
  const [status, setStatus] = useState<string>('待渲染')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!sourceRef.current) return
      try {
        setStatus('加载字体中…')
        setError('')

        const rendererFonts = [
          // 可变字体:variable 自动探测(读 fvar 表),无需手动声明
          { family: 'Inter', url: '/fonts/Inter-Variable.ttf', weight: '400' },
          { family: 'Consolas', url: '/fonts/Consolas.ttf', weight: '400' },
          { family: 'Arial', url: '/fonts/Arial.ttf', weight: '400' },
          { family: 'Arial', url: '/fonts/Arial-Bold.ttf', weight: '700' },
          // 思源黑体可变字体:一个文件覆盖所有字重,中文 wght 轴连续可调
          { family: 'Noto Sans SC', url: '/fonts/NotoSansSC-VF.ttf', weight: '400' },
        ]
        const renderer = htmlToSvg({ fonts: rendererFonts })

        await renderer.preload()
        if (cancelled) return

        setStatus('渲染中…')
        const svg = await renderer.render(sourceRef.current!)
        if (cancelled) return
        setSvgString(svg.outerHTML)

        const svgLarge = await renderer.render(sourceLargeRef.current!)
        if (cancelled) return
        setSvgLargeString(svgLarge.outerHTML)

        const svgRich = await renderer.render(richRef.current!)
        if (cancelled) return
        setSvgRichString(svgRich.outerHTML)

        const svgVariable = await renderer.render(variableRef.current!)
        if (cancelled) return
        setSvgVariableString(svgVariable.outerHTML)

        const svgHighlight = await renderer.render(highlightRef.current!)
        if (cancelled) return
        setSvgHighlightString(svgHighlight.outerHTML)

        setStatus('✅ 渲染成功')
      } catch (e) {
        if (!cancelled) {
          setError(String(e))
          setStatus('❌ 渲染失败')
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h2>BakeSvg</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        把左边的 HTML(背景色/文字/边框/阴影)用 <code>htmlToSvg</code> 渲染成右边的矢量 SVG。
        文字按字体类型分别用 harfbuzzjs(可变字体)或 opentype.js(静态字体)转成 <code>&lt;path&gt;</code>。
        所有几何(背景/边框/字形位置)都来自浏览器测量,不做计算。
      </p>

      <Section title="对比:原图 vs 产物(18px)">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* 左:被渲染的 HTML 源 */}
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>源 HTML(18px)</div>
            <div ref={sourceRef} style={SOURCE_STYLE}>
              Hello bake-svg
            </div>
          </div>

          {/* 右:渲染出的 SVG */}
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>产物 SVG</div>
            <div
              style={{ width: 280, background: '#f9fafb', borderRadius: 12, minHeight: 80 }}
              dangerouslySetInnerHTML={svgString ? { __html: svgString } : undefined}
            />
          </div>
        </div>
      </Section>

      <Section title="大字号对照(48px)— 诊断 hinting 差异">
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          若大字号下两边几乎一致,说明小字号的差异是 opentype 未应用 hinting 的固有特性(非 bug)。
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>源 HTML(48px)</div>
            <div ref={sourceLargeRef} style={SOURCE_STYLE_LARGE}>
              Bake
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>产物 SVG</div>
            <div
              style={{ width: 280, background: '#f9fafb', borderRadius: 12, minHeight: 80 }}
              dangerouslySetInnerHTML={svgLargeString ? { __html: svgLargeString } : undefined}
            />
          </div>
        </div>
      </Section>

      <Section title="富文本长文章:border-bottom 下划线 + 加粗">
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          测试 <code>border-bottom</code> 模拟下划线:用元素自身的 <code>getClientRects()</code> 逐行测量,
          渲染成亚像素精度的 <code>&lt;rect&gt;</code>(不取整)。中英文混排下划线位置都和浏览器一致。
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>源 HTML</div>
            <div id="bake-rich-test" ref={richRef} style={RICH_STYLE}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#7c2d12', marginBottom: 12 }}>
                Bake-SVG 富文本测试
              </div>
              <p style={{ margin: '0 0 12px' }}>
                这是一段用于测试的长文章。bake-svg 会把 HTML 渲染成矢量 SVG,
                文字通过 opentype.js 转成 <strong>path 路径</strong>。
              </p>
              <div style={PARA_TITLE}>为什么需要 border-bottom?</div>
              <p style={{ margin: '0 0 12px' }}>
                因为 text-decoration:underline 在 bake-svg 中尚未实现。
                我们用 <span style={UNDERLINE_SPAN}>border-bottom 模拟下划线</span> 来强调关键词,
                这样 bake 后仍能保留下划线效果。
              </p>
              <div style={PARA_TITLE}>关键概念</div>
              <p style={{ margin: '0 0 12px' }}>
                <span style={UNDERLINE_SPAN}>矢量文字</span> 意味着放大不失真,
                适合打印和高清显示。而 <span style={UNDERLINE_SPAN}>border-bottom</span>{' '}
                是 CSS 的盒子模型属性,bake-svg 能正确转换为 SVG line。
              </p>
              <div style={PARA_TITLE}>总结</div>
              <p style={{ margin: 0 }}>
                本测试验证了 <span style={UNDERLINE_SPAN}>长文本换行</span>、
                <span style={UNDERLINE_SPAN}>加粗</span> 和
                <span style={UNDERLINE_SPAN}>下划线强调</span> 三种富文本效果。
              </p>
              {/* 可变字体字重对比(在富文本场景验证 Inter wght 轴)+ 中英文标点 */}
              <div style={PARA_TITLE}>Variable Font 字重 + 标点</div>
              <div style={{ fontSize: 13, fontWeight: 400, marginBottom: 6, color: '#475569' }}>
                Regular 400:这是一段正文,变量字体 Rich Text Test!中英文混排(括号)、「书名号」、"引号"、&amp;符号、@、#、$、%、^、*。
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#475569' }}>
                Bold 700:这是加粗文字,Variable Font!中英文混排(括号)、「书名号」、"引号"、&amp;符号、@、#、$、%、^、*。
              </div>
              <div style={{ fontSize: 13, fontWeight: 400, marginBottom: 6, color: '#475569' }}>
                正文 400 中间有<strong>加粗片段 inline bold!</strong>后面继续:逗号,句号。问号?感叹!省略号……破折号——连接号~
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>产物 SVG</div>
            <div
              style={{ width: 320, background: '#f9fafb', borderRadius: 8, minHeight: 80 }}
              dangerouslySetInnerHTML={svgRichString ? { __html: svgRichString } : undefined}
            />
          </div>
        </div>
      </Section>

      <Section title="可变字体(Variable Font):Inter 一个文件,400 vs 700 对比">
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          用 harfbuzzjs 引擎渲染 Inter 可变字体。<strong>同一个字体文件</strong>,
          左边 Regular(400)、右边 Bold(700),验证 wght 轴切换是否生效(两段文字粗细应不同)。
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>源 HTML(Inter,400 vs 700)</div>
            <div ref={variableRef} style={{ width: 360, padding: 20, backgroundColor: '#f0f9ff', borderRadius: 8, boxSizing: 'border-box' }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 400, marginBottom: 12, color: '#0c4a6e' }}>
                Variable Font Regular 400
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: '#0c4a6e' }}>
                Variable Font Bold 700
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>产物 SVG(harfbuzzjs)</div>
            <div
              style={{ width: 360, background: '#f9fafb', borderRadius: 8, padding: 8, minHeight: 80 }}
              dangerouslySetInnerHTML={svgVariableString ? { __html: svgVariableString } : undefined}
            />
          </div>
        </div>
      </Section>

      <Section title="背景高亮:整段背景色 + 行内荧光标记">
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          验证 <code>background-color</code> 的渲染:① 整段背景块(浅黄 + 圆角 + padding);
          ② 行内荧光高亮词(深黄底)。bake-svg 应把背景渲染成 SVG <code>&lt;rect&gt;</code>。
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>源 HTML(背景高亮)</div>
            <div ref={highlightRef} style={{ width: 360, padding: 20, backgroundColor: '#ffffff', borderRadius: 8, boxSizing: 'border-box', fontFamily: 'Inter, Noto Sans SC, sans-serif', fontSize: 14, lineHeight: 1.8, color: '#1e293b', textAlign: 'justify' }}>
              <div>普通段落文字,下面是重点高亮:</div>
              <div style={HIGHLIGHT_BLOCK}>
                <strong>重点段落:</strong>
                这段有浅黄色背景 + 圆角 + 内边距,模拟「引用块」或「提示框」效果。
                bake-svg 应渲染成带 fill 的 rect。
              </div>
              <div>
                这是普通文字,中间有
                <span style={HIGHLIGHT_INLINE}>荧光高亮的关键词</span>
                ,后面继续普通文字。行内高亮验证 inline 背景色。
              </div>
              <div>
                下面测试<strong>跨行高亮</strong>(带 margin + padding),背景应在每行独立绘制:
                <span style={HIGHLIGHT_INLINE}>这是一段很长的跨行荧光高亮文字用来测试当 inline 元素的内容超过一行宽度时背景是否会正确地在每一行分别绘制,包括 padding 和 margin 的处理</span>
                后续文字。
              </div>
              <div style={HIGHLIGHT_BLOCK}>
                第二个高亮块,测试多个背景块是否都正确渲染。
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>产物 SVG</div>
            <div
              style={{ width: 360, background: '#f9fafb', borderRadius: 8, padding: 8, minHeight: 80 }}
              dangerouslySetInnerHTML={svgHighlightString ? { __html: svgHighlightString } : undefined}
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
        <Section title="产物 SVG 源码">
          <pre style={{ fontSize: 11, fontFamily: 'monospace', background: '#f9fafb', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
            {svgString.slice(0, 2000)}
            {svgString.length > 2000 ? '\n…(截断)' : ''}
          </pre>
        </Section>
      )}
    </div>
  )
}
