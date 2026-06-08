import {
  animateSoftBlink,
  animateHardBlink,
  transformBreathe,
  transformFloat,
  genAnimateExtrude,
} from 'expub-tool/behaviors'
import { SectionEx } from 'expub-tool/html'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SectionEx style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, fontSize: 15 }}>{title}</h3>
      {children}
    </SectionEx>
  )
}

export default function BehaviorsPage() {
  return (
    <div>
      <h2>Behaviors — Reusable Animation Combinations</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        All animations below import from <code>expub-tool/behaviors</code> via built dist.
      </p>

      {/* animateSoftBlink */}
      <Section title="animateSoftBlink">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={10} width={100} height={100} rx={8} fill="#3b82f6">
            {animateSoftBlink({ loopCount: 'indefinite' })}
          </rect>
        </svg>
      </Section>

      {/* animateHardBlink */}
      <Section title="animateHardBlink">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={10} width={100} height={100} rx={8} fill="#ef4444">
            {animateHardBlink({ loopCount: 'indefinite' })}
          </rect>
        </svg>
      </Section>

      {/* transformBreathe */}
      <Section title="transformBreathe">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={10} width={100} height={100} rx={8} fill="#10b981">
            {transformBreathe({
              origin: [60, 60],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* transformFloat */}
      <Section title="transformFloat">
        <svg width={200} height={120} viewBox="0 0 200 120">
          <rect x={60} y={20} width={80} height={80} rx={12} fill="#8b5cf6">
            {transformFloat({ loopCount: 'indefinite' })}
          </rect>
        </svg>
      </Section>

      {/* genAnimateExtrude */}
      <Section title="genAnimateExtrude — click the gray area">
        {/*
          挤出动画原理：
          1. SVG viewBox="0 0 300 100"，width 从 100% → 300%（由于 viewBox 宽高比，高度从 100px → 300px）
          2. 外层 div overflow:hidden + width:300 横向裁住 SVG，只让纵向增长可见
          3. 内容放在 SVG 下方正常流中，SVG 增长时把内容推下去
          4. 内部 rect (opacity:0, pointer-events:painted) 是点击热区，点击后自毁 (height→0)，
             后续点击穿透到下方内容
        */}
        <div style={{ width: 300, overflow: 'hidden', borderRadius: 8 }}>
          {/* SVG 区域 — 点击灰色区域触发挤出 */}
          <div style={{ width: 300, overflow: 'hidden', background: '#e5e7eb' }}>
            {genAnimateExtrude({
              canvasWidth: 300,
              initHeight: 100,
              timeline: [
                { toHeight: 300, durationSeconds: 1 },
              ],
              begin: 'click',
            })}
          </div>
          {/* 内容 — 被 SVG 增长推下去 */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
          }}>
            被推出的内容
          </div>
        </div>
      </Section>
    </div>
  )
}
