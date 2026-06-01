import { Routes, Route, NavLink } from 'react-router-dom'
import SmilPage from './pages/SmilPage'
import BehaviorsPage from './pages/BehaviorsPage'
import CssPage from './pages/CssPage'
import UtilsPage from './pages/UtilsPage'
import SvgPage from './pages/SvgPage'
import CollapsibleBoxPage from './pages/CollapsibleBoxPage'
import AnyPushPage from './pages/AnyPushPage'
import CoverFlowPage from './pages/CoverFlowPage'
import SpinZoomCarouselPage from './pages/SpinZoomCarouselPage'
import SkewSlideCarouselPage from './pages/SkewSlideCarouselPage'
import SkewSlideCarouselYPage from './pages/SkewSlideCarouselYPage'
import SkewPushYPage from './pages/SkewPushYPage'
import AnySkewPushPage from './pages/AnySkewPushPage'

const links = [
  { to: '/', label: 'SMIL' },
  { to: '/svg', label: 'SVG' },
  { to: '/collapsible-box', label: 'CollapseBox' },
  { to: '/any-push', label: 'AnyPush' },
  { to: '/cover-flow', label: 'CoverFlow' },
  { to: '/spin-zoom', label: 'SpinZoom' },
  { to: '/skew-slide', label: 'SkewSlide' },
  { to: '/skew-slide-y', label: 'SkewSlideY' },
  { to: '/skew-push-y', label: 'SkewPushY' },
  { to: '/any-skew-push', label: 'AnySkewPush' },
  { to: '/behaviors', label: 'Behaviors' },
  { to: '/css', label: 'CSS' },
  { to: '/utils', label: 'Utils' },
]

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{
        width: 180,
        borderRight: '1px solid #e5e7eb',
        padding: '16px 12px',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#6b7280' }}>
          expub-tool
        </div>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            style={({ isActive }) => ({
              display: 'block',
              padding: '6px 8px',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
              color: isActive ? '#2563eb' : '#374151',
              background: isActive ? '#eff6ff' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              marginBottom: 2,
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<SmilPage />} />
          <Route path="/svg" element={<SvgPage />} />
          <Route path="/collapsible-box" element={<CollapsibleBoxPage />} />
          <Route path="/any-push" element={<AnyPushPage />} />
          <Route path="/cover-flow" element={<CoverFlowPage />} />
          <Route path="/spin-zoom" element={<SpinZoomCarouselPage />} />
          <Route path="/skew-slide" element={<SkewSlideCarouselPage />} />
          <Route path="/skew-slide-y" element={<SkewSlideCarouselYPage />} />
          <Route path="/skew-push-y" element={<SkewPushYPage />} />
          <Route path="/any-skew-push" element={<AnySkewPushPage />} />
          <Route path="/behaviors" element={<BehaviorsPage />} />
          <Route path="/css" element={<CssPage />} />
          <Route path="/utils" element={<UtilsPage />} />
        </Routes>
      </main>
    </div>
  )
}
