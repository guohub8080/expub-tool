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
          padding: '4px 12px', fontSize: 12, borderRadius: 4,
          border: '1px solid #d1d5db', background: copied ? '#10b981' : '#fff', color: copied ? '#fff' : '#374151', cursor: 'pointer',
        }}>{copied ? 'Copied!' : 'Copy HTML'}</button>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  )
}

export default function ClickZoomPage() {
  return (
    <div>
      <h2>ClickZoom — 全 SVG 动画（无 url、无 id）</h2>

      <CopyDemo title="动画 homeBg（呼吸光圈 + 色变 + 浮动粒子）+ 4 热区详情">
        <ClickZoom
          canvasSize={{ w: 300, h: 400 }}
          homeBg={
            <>
              {/* 底色（opacity 呼吸） */}
              <rect x={0} y={0} width={300} height={400} fill="#1a1a2e">
                <animate attributeName="opacity" values="1;0.7;1" dur="4s" repeatCount="indefinite" />
              </rect>

              {/* 呼吸光圈 1 */}
              <circle cx={150} cy={200} r={90} fill="none" stroke="#6366f1" strokeWidth={2} opacity={0.3}>
                <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="3s" repeatCount="indefinite" additive="sum" />
                <animateTransform attributeName="transform" type="translate" values="150,200" dur="3s" repeatCount="indefinite" />
              </circle>

              {/* 呼吸光圈 2 */}
              <circle cx={150} cy={200} r={130} fill="none" stroke="#8b5cf6" strokeWidth={1} opacity={0.2}>
                <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="4s" repeatCount="indefinite" additive="sum" />
                <animateTransform attributeName="transform" type="translate" values="150,200" dur="4s" repeatCount="indefinite" />
              </circle>

              {/* 标题脉冲 */}
              <text x={150} y={35} fontSize={15} fill="#a5b4fc" textAnchor="middle" fontWeight={700}>
                点击卡片查看
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </text>

              {/* 4 标注 + 脉冲 */}
              {[
                { x: 75, y: 100, c: '#f472b6', l: 'A' },
                { x: 225, y: 100, c: '#34d399', l: 'B' },
                { x: 75, y: 250, c: '#60a5fa', l: 'C' },
                { x: 225, y: 250, c: '#fbbf24', l: 'D' },
              ].map((s, i) => (
                <g key={i}>
                  <rect x={s.x - 42} y={s.y - 42} width={84} height={84} rx={14} fill={s.c} opacity={0.15}>
                    <animate attributeName="opacity" values="0.08;0.25;0.08" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
                  </rect>
                  <rect x={s.x - 42} y={s.y - 42} width={84} height={84} rx={14} fill="none" stroke={s.c} strokeWidth={2} />
                  <text x={s.x} y={s.y + 6} fontSize={22} fill={s.c} textAnchor="middle" fontWeight={900}>{s.l}</text>
                </g>
              ))}
            </>
          }
          childItems={[
            {
              thumbnail: { x: 33, y: 58, w: 84, h: 84 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#1a103a" />
                  {/* 粉色脉冲球 */}
                  <circle cx={150} cy={170} r={60} fill="#f472b6">
                    <animate attributeName="r" values="55;70;55" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={150} cy={170} r={75} fill="none" stroke="#f472b6" strokeWidth={2} opacity={0.4}>
                    <animate attributeName="r" values="70;95;70" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={150} y={310} fontSize={16} fill="#f472b6" textAnchor="middle" fontWeight={700}>粉色脉冲球</text>
                </>
              ),
            },
            {
              thumbnail: { x: 183, y: 58, w: 84, h: 84 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#022c22" />
                  {/* 旋转方块 */}
                  <g>
                    <animateTransform attributeName="transform" type="rotate" from="0 150 170" to="360 150 170" dur="6s" repeatCount="indefinite" />
                    <rect x={100} y={120} width={100} height={100} rx={12} fill="none" stroke="#34d399" strokeWidth={3} />
                    <rect x={110} y={130} width={80} height={80} rx={8} fill="#10b981" opacity={0.3} />
                  </g>
                  <text x={150} y={310} fontSize={16} fill="#34d399" textAnchor="middle" fontWeight={700}>绿色旋转方块</text>
                </>
              ),
            },
            {
              thumbnail: { x: 33, y: 208, w: 84, h: 84 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#0c1929" />
                  {/* 波纹扩散 */}
                  {[0, 1, 2].map(r => (
                    <circle key={r} cx={150} cy={190} r={30} fill="none" stroke="#60a5fa" strokeWidth={2}>
                      <animate attributeName="r" values="25;110;25" dur="3s" begin={`${r}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" begin={`${r}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                  <circle cx={150} cy={190} r={20} fill="#60a5fa" />
                  <text x={150} y={340} fontSize={16} fill="#60a5fa" textAnchor="middle" fontWeight={700}>蓝色波纹</text>
                </>
              ),
            },
            {
              thumbnail: { x: 183, y: 208, w: 84, h: 84 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={400} fill="#2a1a00" />
                  {/* 跳动条 */}
                  {[0, 1, 2, 3, 4].map(b => (
                    <rect key={b} x={98 + b * 22} y={120} width={14} height={120} rx={4} fill="#fbbf24">
                      <animate attributeName="height" values="120;30;120" dur="1s" begin={`${b * 0.15}s`} repeatCount="indefinite" />
                      <animate attributeName="y" values="120;195;120" dur="1s" begin={`${b * 0.15}s`} repeatCount="indefinite" />
                    </rect>
                  ))}
                  <text x={150} y={310} fontSize={16} fill="#fbbf24" textAnchor="middle" fontWeight={700}>黄色跳动条</text>
                </>
              ),
            },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="渐变效果用色变模拟 + 轨道粒子 + 脉冲圆">
        <ClickZoom
          canvasSize={{ w: 300, h: 300 }}
          homeBg={
            <>
              {/* 两层色块交叉色变模拟渐变 */}
              <rect x={0} y={0} width={300} height={300} fill="#1a1a2e" />
              <rect x={0} y={0} width={300} height={150} fill="#16213e">
                <animate attributeName="height" values="120;180;120" dur="6s" repeatCount="indefinite" />
              </rect>

              {/* 网格线 */}
              {[60, 120, 180, 240].map(p => (
                <g key={p}>
                  <line x1={p} y1={0} x2={p} y2={300} stroke="#ffffff" opacity={0.04} />
                  <line x1={0} y1={p} x2={300} y2={p} stroke="#ffffff" opacity={0.04} />
                </g>
              ))}

              {/* 浮动光点 */}
              <circle cx={75} cy={75} r={35} fill="#e94560" opacity={0.3}>
                <animate attributeName="r" values="30;42;30" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={225} cy={225} r={35} fill="#533483" opacity={0.3}>
                <animate attributeName="r" values="30;42;30" dur="4s" repeatCount="indefinite" />
              </circle>

              <text x={75} y={82} fontSize={20} fill="#e94560" textAnchor="middle" fontWeight={900}>◆</text>
              <text x={225} y={232} fontSize={20} fill="#a78bfa" textAnchor="middle" fontWeight={900}>●</text>
            </>
          }
          childItems={[
            {
              thumbnail: { x: 20, y: 20, w: 110, h: 110 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={300} fill="#0f0e17" />
                  <circle cx={150} cy={150} r={60} fill="#e94560">
                    <animate attributeName="r" values="55;75;55" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={150} cy={150} r={80} fill="none" stroke="#e94560" strokeWidth={2} opacity={0.5}>
                    <animate attributeName="r" values="75;105;75" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={150} y={158} fontSize={24} fill="#fff" textAnchor="middle" fontWeight={900}>脉冲</text>
                </>
              ),
              scale: { inKeySplines: "0 0 0.2 1", outKeySplines: "0.8 0 1 1" },
            },
            {
              thumbnail: { x: 170, y: 170, w: 110, h: 110 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={300} fill="#0f0e17" />
                  {/* 旋转轨道粒子 */}
                  <g>
                    <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="8s" repeatCount="indefinite" />
                    {[0, 1, 2, 3, 4, 5].map(i => {
                      const angle = (i * 60) * Math.PI / 180
                      return (
                        <circle key={i} cx={150 + Math.cos(angle) * 70} cy={150 + Math.sin(angle) * 70} r={10} fill="#a78bfa" opacity={0.8} />
                      )
                    })}
                    <circle cx={150} cy={150} r={25} fill="#7c3aed" />
                  </g>
                  <text x={150} y={240} fontSize={14} fill="#a78bfa" textAnchor="middle" fontWeight={700}>轨道粒子</text>
                </>
              ),
            },
          ]}
        />
      </CopyDemo>

      <CopyDemo title="zoomScale=1（原地弹窗，不放大，只淡入淡出）">
        <ClickZoom
          canvasSize={{ w: 300, h: 300 }}
          homeBg={
            <>
              <rect x={0} y={0} width={300} height={300} fill="#0f172a" />
              <rect x={60} y={60} width={80} height={80} rx={16} fill="#3b82f6" opacity={0.3} />
              <rect x={60} y={60} width={80} height={80} rx={16} fill="none" stroke="#3b82f6" strokeWidth={2} />
              <text x={100} y={108} fontSize={28} fill="#60a5fa" textAnchor="middle" fontWeight={900}>1</text>
              <rect x={160} y={160} width={80} height={80} rx={16} fill="#ef4444" opacity={0.3} />
              <rect x={160} y={160} width={80} height={80} rx={16} fill="none" stroke="#ef4444" strokeWidth={2} />
              <text x={200} y={208} fontSize={28} fill="#f87171" textAnchor="middle" fontWeight={900}>2</text>
            </>
          }
          zoomScale={1}
          childItems={[
            {
              thumbnail: { x: 60, y: 60, w: 80, h: 80 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={300} fill="#1e293b" />
                  <rect x={40} y={40} width={220} height={220} rx={20} fill="#3b82f6" opacity={0.2} />
                  <rect x={40} y={40} width={220} height={220} rx={20} fill="none" stroke="#60a5fa" strokeWidth={2} />
                  <text x={150} y={160} fontSize={36} fill="#60a5fa" textAnchor="middle" fontWeight={900}>弹窗 1</text>
                  <text x={150} y={240} fontSize={13} fill="#93c5fd" textAnchor="middle">点击别处关闭</text>
                </>
              ),
            },
            {
              thumbnail: { x: 160, y: 160, w: 80, h: 80 },
              modalContent: (
                <>
                  <rect x={0} y={0} width={300} height={300} fill="#450a0a" />
                  <rect x={40} y={40} width={220} height={220} rx={20} fill="#ef4444" opacity={0.2} />
                  <rect x={40} y={40} width={220} height={220} rx={20} fill="none" stroke="#f87171" strokeWidth={2} />
                  <text x={150} y={160} fontSize={36} fill="#f87171" textAnchor="middle" fontWeight={900}>弹窗 2</text>
                  <text x={150} y={240} fontSize={13} fill="#fca5a5" textAnchor="middle">点击别处关闭</text>
                </>
              ),
            },
          ]}
        />
      </CopyDemo>
    </div>
  )
}
