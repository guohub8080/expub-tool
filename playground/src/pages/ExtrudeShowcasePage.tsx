import { ExtrudeShowcase, ClickCascade, ClickFlipOnce, ClickFlipInfinity, ClickPopup } from 'expub-tool/svg'
import getWechat300x300 from '../api/placeHolderPic/getWechat300x300'

export default function ExtrudeShowcasePage() {
  return (
    <div>
      <h2>ExtrudeShowcase — 点击展开</h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>
        Before 层放点击交互组件，完成后点击穿透触发 extrude 展开，露出 After 内容。
      </p>

      {/* ── Demo 1: ClickCascade ✅ 能自毁 ── */}
      <DemoCard title="ClickCascade → 展开" note="✅ 能自毁：最后一张无热区，点击穿透到 extrude">
        <ExtrudeShowcase
          canvasSize={{ w: 300, h: 300 }}
          totalHeight={600}
          durationSeconds={1}
        >
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
              🎉 ClickCascade 展开后
            </div>
          </ExtrudeShowcase.After>
          <ExtrudeShowcase.Before>
            <ClickCascade
              canvasSize={{ w: 300, h: 300 }}
              childItems={[
                { url: getWechat300x300(1) },
                { url: getWechat300x300(2) },
                { url: getWechat300x300(3) },
              ]}
            />
          </ExtrudeShowcase.Before>
        </ExtrudeShowcase>
      </DemoCard>

      {/* ── Demo 2: ClickFlipOnce ✅ 能自毁 ── */}
      <DemoCard title="ClickFlipOnce → 展开" note="✅ 能自毁：翻转后 visibility:hidden，点击穿透到 extrude">
        <ExtrudeShowcase
          canvasSize={{ w: 300, h: 300 }}
          totalHeight={600}
          durationSeconds={1}
        >
          <ExtrudeShowcase.After>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 600,
            }}>
              🎉 FlipOnce 展开后
            </div>
          </ExtrudeShowcase.After>
          <ExtrudeShowcase.Before>
            <ClickFlipOnce
              canvasSize={{ w: 300, h: 300 }}
              frontSide={{ url: getWechat300x300(4) }}
              backSide={{ url: getWechat300x300(5) }}
            />
          </ExtrudeShowcase.Before>
        </ExtrudeShowcase>
      </DemoCard>

      {/* ── Demo 3: ClickFlipInfinity ❌ 不能自毁 ── */}
      <DemoCard title="ClickFlipInfinity → 展开" note="❌ 不能自毁：restart='always'，永远拦住点击，extrude 无法触发">
        <ExtrudeShowcase
          canvasSize={{ w: 300, h: 300 }}
          totalHeight={600}
          durationSeconds={1}
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
              🎉 FlipInfinity 展开后
            </div>
          </ExtrudeShowcase.After>
          <ExtrudeShowcase.Before>
            <ClickFlipInfinity
              canvasSize={{ w: 300, h: 300 }}
              frontSide={{ url: getWechat300x300(6) }}
              backSide={{ url: getWechat300x300(7) }}
            />
          </ExtrudeShowcase.Before>
        </ExtrudeShowcase>
      </DemoCard>

      {/* ── Demo 4: ClickPopup ❌ 不能自毁 ── */}
      <DemoCard title="ClickPopup → 展开" note="❌ 不能自毁：restart='always'，永远拦住点击，extrude 无法触发">
        <ExtrudeShowcase
          canvasSize={{ w: 300, h: 300 }}
          totalHeight={600}
          durationSeconds={1}
        >
          <ExtrudeShowcase.After>
            <div style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 600,
            }}>
              🎉 Popup 展开后
            </div>
          </ExtrudeShowcase.After>
          <ExtrudeShowcase.Before>
            <ClickPopup
              canvasSize={{ w: 300, h: 300 }}
              cover={{ url: getWechat300x300(8) }}
              popup={{ url: getWechat300x300(9) }}
            />
          </ExtrudeShowcase.Before>
        </ExtrudeShowcase>
      </DemoCard>

      {/* ── Demo 5: 无 Before，直接点击展开 ── */}
      <DemoCard title="无 Before，直接点击展开" note="直接点击 SVG 触发展开">
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
      </DemoCard>
    </div>
  )
}

function DemoCard({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, fontSize: 15 }}>{title}</h3>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>{note}</p>
      {children}
    </div>
  )
}
