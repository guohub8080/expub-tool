import {
  spacing,
  SPACING_ZERO,
  SPACING_ZERO_CSS,
  px,
  py,
  mx,
  my,
  borderX,
  borderY,
  roundedT,
  roundedR,
  roundedB,
  roundedL,
  googleColors,
  tailwindColors,
} from 'expub-tool/css'

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

export default function CssPage() {
  return (
    <div>
      <h2>CSS Utilities</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        All functions below import from <code>expub-tool/css</code> via built dist.
      </p>

      <Section title="spacing functions">
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>spacing(10) → {JSON.stringify(spacing(10))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>SPACING_ZERO → {JSON.stringify(SPACING_ZERO)}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>SPACING_ZERO_CSS → {JSON.stringify(SPACING_ZERO_CSS)}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>px(10) → {JSON.stringify(px(10))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>py(10) → {JSON.stringify(py(10))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>mx(10) → {JSON.stringify(mx(10))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>my(10) → {JSON.stringify(my(10))}</p>
      </Section>

      <Section title="border functions">
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>borderX(1, '#333') → {JSON.stringify(borderX(1, '#333'))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>borderY(1, '#333') → {JSON.stringify(borderY(1, '#333'))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>roundedT(8) → {JSON.stringify(roundedT(8))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>roundedR(8) → {JSON.stringify(roundedR(8))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>roundedB(8) → {JSON.stringify(roundedB(8))}</p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>roundedL(8) → {JSON.stringify(roundedL(8))}</p>
      </Section>

      <Section title="googleColors — sample">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Object.entries(googleColors).slice(0, 12).map(([name, color]) => (
            <div key={name} title={name} style={{
              width: 32, height: 32, borderRadius: 4,
              background: color as string, border: '1px solid #e5e7eb',
            }} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          {Object.keys(googleColors).length} colors total
        </p>
      </Section>

      <Section title="tailwindColors — sample">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Object.entries(tailwindColors).slice(0, 12).map(([name, color]) => (
            <div key={name} title={name} style={{
              width: 32, height: 32, borderRadius: 4,
              background: color as string, border: '1px solid #e5e7eb',
            }} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          {Object.keys(tailwindColors).length} colors total
        </p>
      </Section>
    </div>
  )
}
