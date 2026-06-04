import {
  animateOpacity,
  transformScale,
  transformScaleRaw,
  transformRotate,
  transformTranslate,
  transformSkewX,
  animatePathStroke,
  animateMotion,
  setVisibility,
  animateHeight,
  animateWidth,
  animateX,
  animateY,
  animateFill,
  animateStroke,
  animateR,
  animateRx,
  animateRy,
  animateCx,
  animateCy,
  animateD,
  animateStrokeWidth,
  setOpacity,
  setDisplay,
  setFill,
  setX,
  setY,
  setWidth,
  setHeight,
  setR,
  setRx,
  setRy,
  setCx,
  setCy,
  setHref,
  setStroke,
  setStrokeWidth,
  getEaseBezier,
  getLinearBezier,
  getSineBezier,
  getExpoBezier,
  buildTimeline,
} from 'expub-tool/smil'

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

const EASE_IN = getEaseBezier({ isIn: true })
const EASE_OUT = getEaseBezier({ isOut: true })
const EASE_IN_OUT = getEaseBezier({ isIn: true, isOut: true })
const EXPO_OUT = getExpoBezier({ isOut: true })
const EXPO_IN = getExpoBezier({ isIn: true })

export default function SmilPage() {
  return (
    <div>
      <h2>SMIL — Atomic Animation Functions</h2>
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        All animations below import from <code>expub-tool/smil</code> via built dist.
      </p>

      {/* animateOpacity */}
      <Section title="animateOpacity — loop fade">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={10} width={100} height={100} rx={8} fill="#3b82f6">
            {animateOpacity({
              initValue: 1,
              timeline: [
                { to: 0.2, durationSeconds: 1, keySpline: EASE_OUT },
                { to: 1, durationSeconds: 1, keySpline: EASE_IN },
              ],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* transformScale */}
      <Section title="transformScale — pulse with origin">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={10} width={100} height={100} rx={8} fill="#10b981">
            {transformScale({
              initValue: 1,
              timeline: [
                { to: 1.2, durationSeconds: 0.6, keySpline: EASE_OUT },
                { to: 1, durationSeconds: 0.6, keySpline: EASE_IN },
              ],
              origin: [60, 60],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* transformScaleRaw */}
      <Section title="transformScaleRaw — bare scale (no origin)">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={10} width={100} height={100} rx={8} fill="#f59e0b">
            {transformScaleRaw({
              initValue: 1,
              timeline: [
                { to: 0.5, durationSeconds: 1 },
                { to: 1, durationSeconds: 1 },
              ],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* transformRotate */}
      <Section title="transformRotate — continuous spin">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={25} y={25} width={70} height={70} rx={4} fill="#8b5cf6">
            {transformRotate({
              initValue: 0,
              timeline: [
                { to: 360, durationSeconds: 3 },
              ],
              origin: [60, 60],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* transformTranslate */}
      <Section title="transformTranslate — slide loop">
        <svg width={200} height={80} viewBox="0 0 200 80">
          <circle cx={40} cy={40} r={20} fill="#ef4444">
            {transformTranslate({
              initValue: { x: 0, y: 0 },
              timeline: [
                { to: { x: 120, y: 0 }, durationSeconds: 1.5, keySpline: EASE_IN_OUT },
                { to: { x: 0, y: 0 }, durationSeconds: 1.5, keySpline: EASE_IN_OUT },
              ],
              loopCount: 'indefinite',
            })}
          </circle>
        </svg>
      </Section>

      {/* transformSkewX */}
      <Section title="transformSkewX">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={20} y={20} width={80} height={80} rx={4} fill="#06b6d4">
            {transformSkewX({
              initValue: 0,
              timeline: [
                { to: 20, durationSeconds: 1 },
                { to: 0, durationSeconds: 1 },
              ],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* animatePathStroke */}
      <Section title="animatePathStroke — drawing path">
        <svg width={200} height={60} viewBox="0 0 200 60">
          <path
            d="M10 30 Q50 0 100 30 Q150 60 190 30"
            stroke="#ec4899"
            strokeWidth={3}
            fill="none"
            strokeDasharray={200}
          >
            {animatePathStroke({
              pathLength: 200,
              timeline: [
                { to: 0, durationSeconds: 2, keySpline: EASE_OUT },
              ],
              loopCount: 'indefinite',
            })}
          </path>
        </svg>
      </Section>

      {/* animateMotion */}
      <Section title="animateMotion — circle along path">
        <svg width={200} height={80} viewBox="0 0 200 80">
          <circle r={8} fill="#f97316">
            {animateMotion({
              path: 'M20 40 Q60 0 100 40 Q140 80 180 40',
              durationSeconds: 3,
              loopCount: 'indefinite',
            })}
          </circle>
        </svg>
      </Section>

      {/* setVisibility */}
      <Section title="setVisibility — click to hide">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={10} width={100} height={100} rx={8} fill="#6366f1">
            {setVisibility({ to: 'hidden', begin: 'click' })}
          </rect>
        </svg>
      </Section>

      {/* animateHeight */}
      <Section title="animateHeight — grow & shrink loop">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={30} y={10} width={60} fill="#14b8a6">
            {animateHeight({
              initValue: 0,
              timeline: [
                { to: 100, durationSeconds: 1.5, keySpline: EXPO_OUT },
                { to: 0, durationSeconds: 1.5, keySpline: EXPO_IN },
              ],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* animateWidth */}
      <Section title="animateWidth — grow & shrink loop">
        <svg width={120} height={120} viewBox="0 0 120 120">
          <rect x={10} y={30} height={60} fill="#f43f5e">
            {animateWidth({
              initValue: 0,
              timeline: [
                { to: 100, durationSeconds: 1.5, keySpline: EXPO_OUT },
                { to: 0, durationSeconds: 1.5, keySpline: EXPO_IN },
              ],
              loopCount: 'indefinite',
            })}
          </rect>
        </svg>
      </Section>

      {/* Bezier */}
      <Section title="Bezier helpers">
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getEaseBezier({'{ isIn: true }'}) → {EASE_IN}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getEaseBezier({'{ isOut: true }'}) → {EASE_OUT}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getEaseBezier({'{ isIn: true, isOut: true }'}) → {EASE_IN_OUT}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getLinearBezier() → {getLinearBezier()}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getSineBezier({'{ isIn: true }'}) → {getSineBezier({ isIn: true })}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getSineBezier({'{ isOut: true }'}) → {getSineBezier({ isOut: true })}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getExpoBezier({'{ isIn: true }'}) → {EXPO_IN}
        </p>
        <p style={{ fontSize: 13, fontFamily: 'monospace' }}>
          getExpoBezier({'{ isOut: true }'}) → {EXPO_OUT}
        </p>
      </Section>

      {/* buildTimeline */}
      <Section title="buildTimeline">
        <p style={{ fontSize: 13, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(buildTimeline({
            initValue: 0,
            timeline: [
              { to: 1, durationSeconds: 0.3, keySplines: '0.42 0 0.58 1' },
              { to: 0.5, durationSeconds: 0.5 },
              { to: 0, durationSeconds: 0.2 },
            ],
          }), null, 2)}
        </p>
      </Section>

      {/* Quick smoke: remaining animate/set shortcuts */}
      <Section title="All set* shortcuts imported OK">
        <p style={{ fontSize: 13 }}>
          setVisibility, setOpacity, setDisplay, setFill, setStroke, setStrokeWidth,
          setX, setY, setWidth, setHeight, setR, setRx, setRy, setCx, setCy, setHref
        </p>
      </Section>
      <Section title="All animate* shortcuts imported OK">
        <p style={{ fontSize: 13 }}>
          animateX, animateY, animateWidth, animateHeight, animateFill, animateStroke,
          animateStrokeWidth, animateR, animateRx, animateRy, animateCx, animateCy,
          animateD, animatePathStroke, animateMotion
        </p>
      </Section>
    </div>
  )
}
