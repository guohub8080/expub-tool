import { useRef, useState } from 'react'
import { Timeline } from 'expub-tool/html'
import type { TimelineItem } from 'expub-tool/html'

const box: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
}

const MONO = '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace'

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const demoRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const node = demoRef.current
    if (!node) return
    const html = node.innerHTML
    try {
      // 以纯文本写入剪贴板——拿到的是 HTML 源码字符串，可粘进代码编辑器或微信的 HTML 导入
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('复制失败：', err)
      alert('复制失败——请用 Chrome 或在 localhost/https 下打开。\n' + String(err))
    }
  }

  return (
    <section style={box}>
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: 15 }}>{title}</h3>
        <button
          onClick={handleCopy}
          style={{
            padding: '4px 10px',
            fontSize: 12,
            border: '1px solid #d1d5db',
            borderRadius: 6,
            background: copied ? '#dbeafe' : '#fff',
            color: copied ? '#1d4ed8' : '#374151',
            cursor: 'pointer',
          }}
        >
          {copied ? '已复制 ✓' : '复制代码'}
        </button>
      </section>
      {hint && (
        <p style={{ marginTop: 0, marginBottom: 12, color: '#6b7280', fontSize: 13 }}>{hint}</p>
      )}
      <section ref={demoRef}>{children}</section>
    </section>
  )
}

/** 示范：你自己实现的正文片段（Timeline 不干涉它的布局） */
function Node({ date, text }: { date: string; text: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', alignItems: 'baseline', gap: 12, lineHeight: 1.7 }}>
      <section
        style={{
          flexShrink: 0,
          width: 110,
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 700,
          color: '#1A237E',
        }}
      >
        {date}
      </section>
      <section style={{ flex: 1, fontSize: 15, color: '#2a2a2a' }}>{text}</section>
    </section>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <section
      style={{
        padding: '2px 9px',
        background: color,
        color: '#fff',
        borderRadius: 6,
        fontSize: 12,
        flexShrink: 0,
      }}
    >
      {children}
    </section>
  )
}

const baseItems: TimelineItem[] = [
  { body: <Node date="2023.04.15" text="实际开工（开工报告）" /> },
  { body: <Node date="2023.05.20" text="图纸会审，发现重大设计变更" /> },
  { body: <Node date="2023.06.01–06.15" text="连续降雨15天，停工" /> },
  { body: <Node date="2023.07.05" text="监理审批顺延10天" /> },
]

const customItems: TimelineItem[] = [
  {
    body: (
      <section style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <section style={{ fontWeight: 700, fontSize: 15 }}>6月1日 – 15日</section>
        <Tag color="#E65100">不可抗力</Tag>
        <section style={{ color: '#555', fontSize: 14 }}>连续异常降雨，监理日志确认停工15天</section>
      </section>
    ),
  },
  {
    body: (
      <section style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <section style={{ fontWeight: 700, fontSize: 15 }}>7月10日</section>
        <Tag color="#00695C">设计变更</Tag>
        <section style={{ color: '#555', fontSize: 14 }}>外墙由涂料改为幕墙</section>
      </section>
    ),
    dot: { color: '#C62828' },
  },
]

const lineColorItems: TimelineItem[] = [
  { body: <Node date="2023.04.15" text="实际开工" /> },
  { body: <Node date="2023.05.20" text="图纸会审，发现重大设计变更" />, line: { color: '#C62828' } },
  { body: <Node date="2023.06.01–06.15" text="连续降雨15天，停工" /> },
  { body: <Node date="2023.07.05" text="监理审批顺延10天" /> },
]

const sizeItems: TimelineItem[] = [
  { body: <Node date="2023.04.15" text="实际开工" /> },
  { body: <Node date="2023.05.20" text="图纸会审（关键节点）" />, dot: { size: 14 }, line: { width: 4 } },
  { body: <Node date="2023.06.01–06.15" text="连续降雨15天，停工" /> },
  { body: <Node date="2023.07.05" text="监理审批顺延10天" /> },
]

/** 示范 dot.jsx：带放大/缩小脉冲动画的 SVG 圆点（外圈扩散+实心核心，常用于"进行中"） */
function PulseDot() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ display: 'block' }}>
      <circle cx="11" cy="11" r="5" fill="#C62828" opacity="0.5">
        <animate attributeName="r" values="5;10;5" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="11" cy="11" r="4" fill="#C62828" />
    </svg>
  )
}

const customDotItems: TimelineItem[] = [
  { body: <Node date="2023.04.15" text="实际开工" /> },
  { body: <Node date="进行中" text="施工中（实时进度）" />, dot: { jsx: <PulseDot />, size: 22 } },
  { body: <Node date="2023.07.05" text="竣工备案" /> },
]

export default function TimelinePage() {
  return (
    <section>
      <h2>Timeline</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        竖向时间轴 · 纯脚手架（圆点 + 连线 + body 槽）· from <code>expub-tool/html</code>
      </p>

      <Section title="① 基础用法" hint="childItems=[{body}]；默认 defaultDot{9,#1A237E} / defaultLine{2,#e5e5e5} / defaultItemGap=20">
        <Timeline childItems={baseItems} />
      </Section>

      <Section title="② dotGap：连线两端各离圆点" hint="dotGap={8} —— 上端对本圆点、下端对下一个圆点各留 8px 缝">
        <Timeline childItems={baseItems} dotGap={8} />
      </Section>

      <Section title="③ defaultItemGap：项间距" hint="defaultItemGap={8} —— 节点更紧凑（视觉等同 margin-bottom）">
        <Timeline childItems={baseItems} defaultItemGap={8} />
      </Section>

      <Section title="④ defaultBodyMarginTop：内容上下微调" hint="自动基线（首行压到圆心）上叠加：传正值下移、负值上提；默认 0 就已对齐">
        <Timeline childItems={baseItems} defaultBodyMarginTop={4} />
      </Section>

      <Section title="⑤ 单项 dot.color + 自定义 body" hint="第二项 dot:{color} 高亮；body 任意（标签胶囊 + 文字混排）">
        <Timeline childItems={customItems} defaultItemGap={16} />
      </Section>

      <Section title="⑥ defaultLine：整体连线换色" hint="defaultLine={{color:'#1A237E'}} —— 不单项设的话，所有连线统一跟随">
        <Timeline childItems={baseItems} defaultLine={{ color: '#1A237E' }} />
      </Section>

      <Section title="⑦ 单项 line.color：高亮某一段" hint="第二项 line:{color:'#C62828'} —— 把它下方的连线（→ 停工）染红">
        <Timeline childItems={lineColorItems} />
      </Section>

      <Section title="⑧ 单项 dot.size / line.width：强调关键节点" hint="第二项 dot:{size:14} line:{width:4} —— 大圆点+粗连线（圆点再大也自动对齐）">
        <Timeline childItems={sizeItems} />
      </Section>

      <Section title="⑨ dot.jsx：自定义动画圆点" hint="第二项 dot:{jsx:<PulseDot/>, size:22} —— SVG 脉冲圆点替换默认圆点，size 作对齐高度">
        <Timeline childItems={customDotItems} />
      </Section>

      <Section title="⑩ 静态虚线（CSS）" hint="defaultLine.dash={solidLength:4,gapLength:4} —— repeating-gradient 画的静态虚线">
        <Timeline childItems={baseItems} defaultLine={{ dash: { solidLength: 4, gapLength: 4 } }} />
      </Section>

      <Section title="⑪ 疏密虚线" hint="defaultLine.dash={solidLength:2,gapLength:6} —— 调 solidLength/gapLength 控制疏密">
        <Timeline childItems={baseItems} defaultLine={{ dash: { solidLength: 2, gapLength: 6 } }} />
      </Section>
    </section>
  )
}
