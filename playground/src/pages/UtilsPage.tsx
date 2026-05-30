import {
  svgURL,
  validateWechatSvg,
  assertNonEmptyArray,
  isNonEmptyArray,
} from 'expub-tool/utils'

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

export default function UtilsPage() {
  const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#3b82f6" width="100" height="100"/></svg>`
  const url = svgURL(testSvg)
  const result = validateWechatSvg(testSvg)

  return (
    <div>
      <h2>Utils</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        All utilities below import from <code>expub-tool/utils</code> via built dist.
      </p>

      <Section title="svgURL">
        <p style={{ fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all' }}>
          svgURL(svg) → {url.slice(0, 80)}...
        </p>
      </Section>

      <Section title="validateWechatSvg">
        <p style={{ fontSize: 13 }}>Valid SVG result:</p>
        <pre style={{ fontSize: 12, fontFamily: 'monospace', background: '#f9fafb', padding: 8, borderRadius: 4 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </Section>

      <Section title="assertNonEmptyArray / isNonEmptyArray">
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          isNonEmptyArray([1,2,3]) → {JSON.stringify(isNonEmptyArray([1, 2, 3]))}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          isNonEmptyArray([]) → {JSON.stringify(isNonEmptyArray([]))}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          assertNonEmptyArray([1,2,3]) → no error
        </p>
      </Section>
    </div>
  )
}
