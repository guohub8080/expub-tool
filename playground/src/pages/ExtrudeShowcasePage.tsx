import { ExtrudeShowcase } from 'expub-tool/svg'
import { ClickCascade } from 'expub-tool/svg'
import { SectionEx } from 'expub-tool/html'
import { transformBreathe } from 'expub-tool/behaviors'

export default function ExtrudeShowcasePage() {
  return (
    <div>
      <h2>ExtrudeShowcase — 点击展开</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        点击轮播切换图片，最后点击触发展开，露出下方内容。
      </p>

      {/* Demo 1: ClickCascade 作为 Before，展开后露出新内容 */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>ClickCascade → 展开露出内容</h3>
        <ExtrudeShowcase
          canvasSize={{ w: 300, h: 300 }}
          totalHeight={600}
          durationSeconds={1}
        >
          {/* 展开后露出的内容 */}
          <ExtrudeShowcase.After>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 600,
            }}>
              🎉 展开后露出的内容
            </div>
          </ExtrudeShowcase.After>

          {/* Before: 点击切换，最后一张无 rect → 点击穿透到 Extrude */}
          <ExtrudeShowcase.Before>
            <ClickCascade
              canvasSize={{ w: 300, h: 300 }}
              childItems={[
                { url: 'https://picsum.photos/300/300?random=1' },
                { url: 'https://picsum.photos/300/300?random=2' },
                { url: 'https://picsum.photos/300/300?random=3', jsx: (
                  <svg viewBox="0 0 300 300" style={{ width: '100%' }}>
                    <rect width={300} height={300} fill="#8b5cf6" />
                    <text x={150} y={160} textAnchor="middle" fill="#fff" fontSize={20}>
                      点击展开 ↓
                    </text>
                  </svg>
                )},
              ]}
            />
          </ExtrudeShowcase.Before>
        </ExtrudeShowcase>
      </div>

      {/* Demo 2: 无 Before，直接点击展开 */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>无 Before，直接点击展开</h3>
        <ExtrudeShowcase
          canvasSize={{ w: 300, h: 300 }}
          totalHeight={600}
          durationSeconds={0.8}
        >
          <ExtrudeShowcase.After>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 600,
            }}>
              直接展开的内容
            </div>
          </ExtrudeShowcase.After>
        </ExtrudeShowcase>
      </div>
    </div>
  )
}
