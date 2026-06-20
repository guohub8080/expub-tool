import { useRef, useState } from 'react'
import { ClickZoom } from 'expub-tool/svg'

const CopyDemo = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const html = ref.current?.innerHTML
    if (html) { navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        <button onClick={handleCopy} style={{
          padding: '4px 12px', fontSize: 12, borderRadius: 4, border: '1px solid #d1d5db', background: copied ? '#10b981' : '#fff', color: copied ? '#fff' : '#374151', cursor: 'pointer',
        }}>{copied ? 'Copied!' : 'Copy HTML'}</button>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  )
}

export default function ClickZoomPage() {
  return (
    <div>
      <h2>ClickZoom — 全 SVG 复杂动画（无 url）</h2>

      <CopyDemo title="动画背景 + 4 热区（呼吸/旋转/渐变 + 标注脉冲）">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          homeBg={
            <>
              {/* 深色渐变底 */}
              <defs>
                <linearGradient id="cz-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e1b4b">
                    <animate attributeName="offset" values="0%;30%;0%" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>
              <rect x={0} y={0} width={300} height={400} fill="url(#cz-bg)" />

              {/* 浮动光圈 */}
              <circle cx={150} cy={200} r={80} fill="none" stroke="#6366f1" strokeWidth={1} opacity={0.3}>
                <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="3s" repeatCount="indefinite" additive="sum" />
                <animateTransform attributeName="transform" type="translate" values="150,200" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={150} cy={200} r={120} fill="none" stroke="#8b5cf6" strokeWidth={1} opacity={0.2}>
                <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="4s" repeatCount="indefinite" additive="sum" />
                <animateTransform attributeName="transform" type="translate" values="150,200" dur="4s" repeatCount="indefinite" />
              </circle>

              {/* 标题 */}
              <text x={150} y={35} fontSize={16} fill="#c7d2fe" textAnchor="middle" fontWeight={700}>
                ✨ 点击卡片
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
              </text>

              {/* 4 个标注框（脉冲） */}
              {[
                { x: 75, y: 100, color: '#f472b6', label: 'A' },
                { x: 225, y: 100, color: '#34d399', label: 'B' },
                { x: 75, y: 250, color: '#60a5fa', label: 'C' },
                { x: 225, y: 250, color: '#fbbf24', label: 'D' },
              ].map((s, i) => (
                <g key={i}>
                  <rect
                    x={s.x - 45} y={s.y - 45} width={90} height={90} rx={16}
                    fill={s.color} opacity={0.15}>
                    <animate attributeName="opacity" values="0.1;0.25;0.1" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
                  </rect>
                  <rect
                    x={s.x - 45} y={s.y - 45} width={90} height={90} rx={16}
                    fill="none" stroke={s.color} strokeWidth={2} />
                  <text x={s.x} y={s.y + 5} fontSize={20} fill={s.color} textAnchor="middle" fontWeight={900}>
                    {s.label}
                  </text>
                </g>
              ))}
            </>
          }
          childItems={[
            {
              thumbnail: { x: 30, y: 55, w: 90, h: 90 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#1e1b4b" />
                  <defs>
                    <radialGradient id="cz-a" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#1e1b4b" />
                    </radialGradient>
                  </defs>
                  <circle cx={150} cy={180} r={100} fill="url(#cz-a)">
                    <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="2s" repeatCount="indefinite" additive="sum" />
                    <animateTransform attributeName="transform" type="translate" values="150,180" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={150} y={190} fontSize={32} fill="#fff" textAnchor="middle" fontWeight={900}>A</text>
                  <text x={150} y={340} fontSize={13} fill="#f472b6" textAnchor="middle">粉色脉冲球</text>
                </>
              ),
            },
            {
              thumbnail: { x: 180, y: 55, w: 90, h: 90 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#022c22" />
                  {/* 旋转方块 */}
                  <g>
                    <animateTransform attributeName="transform" type="rotate" from="0 150 180" to="360 150 180" dur="6s" repeatCount="indefinite" />
                    <rect x={100} y={130} width={100} height={100} rx={12} fill="none" stroke="#34d399" strokeWidth={3} />
                    <rect x={110} y={140} width={80} height={80} rx={8} fill="#10b981" opacity={0.3} />
                  </g>
                  <text x={150} y={190} fontSize={32} fill="#34d399" textAnchor="middle" fontWeight={900}>B</text>
                  <text x={150} y={340} fontSize={13} fill="#34d399" textAnchor="middle">绿色旋转方块</text>
                </>
              ),
            },
            {
              thumbnail: { x: 30, y: 205, w: 90, h: 90 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#0c1929" />
                  {/* 波纹 */}
                  {[0, 1, 2].map(r => (
                    <circle key={r} cx={150} cy={200} r={30} fill="none" stroke="#60a5fa" strokeWidth={2}>
                      <animate attributeName="r" values="30;120;30" dur="3s" begin={`${r}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" begin={`${r}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                  <text x={150} y={210} fontSize={32} fill="#60a5fa" textAnchor="middle" fontWeight={900}>C</text>
                  <text x={150} y={350} fontSize={13} fill="#60a5fa" textAnchor="middle">蓝色波纹扩散</text>
                </>
              ),
            },
            {
              thumbnail: { x: 180, y: 205, w: 90, h: 90 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#27272a" />
                  {/* 跳动条 */}
                  {[0, 1, 2, 3, 4].map(b => (
                    <rect key={b} x={100 + b * 22} y={120} width={14} height={120} rx={4} fill="#fbbf24">
                      <animate attributeName="height" values="120;30;120" dur="1s" begin={`${b * 0.15}s`} repeatCount="indefinite" />
                      <animate attributeName="y" values="120;195;120" dur="1s" begin={`${b * 0.15}s`} repeatCount="indefinite" />
                    </rect>
                  ))}
                  <text x={150} y={300} fontSize={32} fill="#fbbf24" textAnchor="middle" fontWeight={900}>D</text>
                  <text x={150} y={350} fontSize={13} fill="#fbbf24" textAnchor="middle">黄色跳动条</text>
                </>
              ),
            },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="全 SVG 动画 + homeBg 跟着放大">
        <ClickZoom
          canvasSize={{ w: 300, h: 300 }}
          homeBg={
            <>
              {/* 渐变背景 */}
              <defs>
                <linearGradient id="cz-bg2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1a1a2e">
                    <animate attributeName="stop-color" values="#1a1a2e;#16213e;#1a1a2e" dur="5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#0f3460" />
                </linearGradient>
              </defs>
              <rect x={0} y={0} width={300} height={300} fill="url(#cz-bg2)" />

              {/* 网格 */}
              {[60, 120, 180, 240].map(p => (
                <g key={p}>
                  <line x1={p} y1={0} x2={p} y2={300} stroke="#ffffff" opacity={0.05} />
                  <line x1={0} y1={p} x2={300} y2={p} stroke="#ffffff" opacity={0.05} />
                </g>
              ))}

              {/* 浮动光点 */}
              {[
                { x: 75, y: 75, c: '#e94560', d: '3s' },
                { x: 225, y: 225, c: '#0f3460', d: '4s' },
              ].map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={40} fill={s.c} opacity={0.4}>
                  <animate attributeName="r" values="35;45;35" dur={s.d} repeatCount="indefinite" />
                </circle>
              ))}

              <text x={75} y={82} fontSize={24} fill="#e94560" textAnchor="middle" fontWeight={900}>◆</text>
              <text x={225} y={232} fontSize={24} fill="#533483" textAnchor="middle" fontWeight={900}>●</text>
            </>
          }
          childItems={[
            {
              thumbnail: { x: 25, y: 25, w: 100, h: 100 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={300} fill="#0f0e17" />
                  <circle cx={150} cy={150} r={70} fill="#e94560">
                    <animate attributeName="r" values="60;80;60" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={150} cy={150} r={90} fill="none" stroke="#e94560" strokeWidth={2} opacity={0.5}>
                    <animate attributeName="r" values="80;110;80" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={150} y={160} fontSize={28} fill="#fff" textAnchor="middle" fontWeight={900}>脉冲</text>
                </>
              ),
              scale: { inKeySplines: "0 0 0.2 1", outKeySplines: "0.8 0 1 1" },
            },
            {
              thumbnail: { x: 175, y: 175, w: 100, h: 100 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={300} fill="#0f0e17" />
                  <g>
                    <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="8s" repeatCount="indefinite" />
                    {[0, 1, 2, 3, 4, 5].map(i => {
                      const angle = (i * 60) * Math.PI / 180
                      return (
                        <circle key={i} cx={150 + Math.cos(angle) * 70} cy={150 + Math.sin(angle) * 70} r={12} fill="#533483" opacity={0.8} />
                      )
                    })}
                    <circle cx={150} cy={150} r={30} fill="#a78bfa" />
                  </g>
                  <text x={150} y={240} fontSize={16} fill="#a78bfa" textAnchor="middle" fontWeight={700}>轨道</text>
                </>
              ),
            },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
