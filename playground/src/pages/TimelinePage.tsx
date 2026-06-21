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
  return (
    <div style={box}>
      <h3 style={{ marginTop: 0, marginBottom: 4, fontSize: 15 }}>{title}</h3>
      {hint && (
        <p style={{ marginTop: 0, marginBottom: 12, color: '#6b7280', fontSize: 13 }}>{hint}</p>
      )}
      {children}
    </div>
  )
}

/** 示范：你自己实现的正文片段（Timeline 不干涉它的布局） */
function Node({ date, text }: { date: string; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, lineHeight: 1.7 }}>
      <span
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
      </span>
      <span style={{ flex: 1, fontSize: 15, color: '#2a2a2a' }}>{text}</span>
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
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
    </span>
  )
}

const baseItems: TimelineItem[] = [
  { jsx: <Node date="2023.04.15" text="实际开工（开工报告）" /> },
  { jsx: <Node date="2023.05.20" text="图纸会审，发现重大设计变更" /> },
  { jsx: <Node date="2023.06.01–06.15" text="连续降雨15天，停工" /> },
  { jsx: <Node date="2023.07.05" text="监理审批顺延10天" /> },
]

const customItems: TimelineItem[] = [
  {
    jsx: (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>6月1日 – 15日</span>
        <Tag color="#E65100">不可抗力</Tag>
        <span style={{ color: '#555', fontSize: 14 }}>连续异常降雨，监理日志确认停工15天</span>
      </div>
    ),
  },
  {
    jsx: (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>7月10日</span>
        <Tag color="#00695C">设计变更</Tag>
        <span style={{ color: '#555', fontSize: 14 }}>外墙由涂料改为幕墙</span>
      </div>
    ),
    dotColor: '#C62828',
  },
]

const lineColorItems: TimelineItem[] = [
  { jsx: <Node date="2023.04.15" text="实际开工" /> },
  { jsx: <Node date="2023.05.20" text="图纸会审，发现重大设计变更" />, lineColor: '#C62828' },
  { jsx: <Node date="2023.06.01–06.15" text="连续降雨15天，停工" /> },
  { jsx: <Node date="2023.07.05" text="监理审批顺延10天" /> },
]

const sizeItems: TimelineItem[] = [
  { jsx: <Node date="2023.04.15" text="实际开工" /> },
  { jsx: <Node date="2023.05.20" text="图纸会审（关键节点）" />, dotSize: 14, lineWidth: 4 },
  { jsx: <Node date="2023.06.01–06.15" text="连续降雨15天，停工" /> },
  { jsx: <Node date="2023.07.05" text="监理审批顺延10天" /> },
]

export default function TimelinePage() {
  return (
    <div>
      <h2>Timeline</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        竖向时间轴 · 纯脚手架（圆点 + 连线 + jsx 槽）· from <code>expub-tool/html</code>
      </p>

      <Section title="① 基础用法" hint="childItem=[{jsx}]；默认 defaultDotColor / defaultItemGap=20 / dotGap=0">
        <Timeline childItem={baseItems} />
      </Section>

      <Section title="② dotGap：连线两端各离圆点" hint="dotGap={8} —— 上端对本圆点、下端对下一个圆点各留 8px 缝">
        <Timeline childItem={baseItems} dotGap={8} />
      </Section>

      <Section title="③ defaultItemGap：项间距" hint="defaultItemGap={8} —— 节点更紧凑（视觉等同 margin-bottom）">
        <Timeline childItem={baseItems} defaultItemGap={8} />
      </Section>

      <Section title="④ defaultDotMarginTop：内容上下微调" hint="内部硬编码 -8 基线（首行压到圆心）；传正值下移、负值进一步上提">
        <Timeline childItem={baseItems} defaultDotMarginTop={4} />
      </Section>

      <Section title="⑤ 单项 dotColor + 自定义 JSX" hint="第二项 dotColor 高亮；jsx 任意（标签胶囊 + 文字混排）">
        <Timeline childItem={customItems} defaultItemGap={16} />
      </Section>

      <Section title="⑥ defaultLineColor：整体连线换色" hint="defaultLineColor=#1A237E —— 不单项设的话，所有连线统一跟随">
        <Timeline childItem={baseItems} defaultLineColor="#1A237E" />
      </Section>

      <Section title="⑦ 单项 lineColor：高亮某一段" hint="第二项 lineColor=#C62828 —— 把它下方的连线（→ 停工）染红">
        <Timeline childItem={lineColorItems} />
      </Section>

      <Section title="⑧ 单项 dotSize / lineWidth：强调关键节点" hint="第二项 dotSize=14 lineWidth=4 —— 大圆点 + 粗连线突出关键节点">
        <Timeline childItem={sizeItems} />
      </Section>
    </div>
  )
}
