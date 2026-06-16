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
import AnyLoopDisplayPage from './pages/AnyLoopDisplayPage'
import StackCarouselPage from './pages/StackCarouselPage'
import ClickFlipInfinityPage from './pages/ClickFlipInfinityPage'
import ClickFlipOncePage from './pages/ClickFlipOncePage'
import ClickPopupPage from './pages/ClickPopupPage'
import ClickCascadePage from './pages/ClickCascadePage'
import CamaraStagePage from './pages/CamaraStagePage'
import CoverPage from './pages/CoverPage'
import AnyCarouselPage from './pages/AnyCarouselPage'
import FlashSlideCarouselPage from './pages/FlashSlideCarouselPage'

const links = [
  { to: '/', label: 'SMIL' },
  { to: '/svg', label: 'SVG' },
  { to: '/collapsible-box', label: 'CollapseBox' },
  { to: '/any-push', label: 'AnyPush' },
  { to: '/cover-flow', label: 'CoverFlow' },
  { to: '/cover', label: 'Cover' },
  { to: '/any-carousel', label: 'Carousel' },
  { to: '/flash-slide', label: 'FlashSlide' },
  { to: '/spin-zoom', label: 'SpinZoom' },
  { to: '/any-loop-display', label: 'AnyLoopDisplay' },
  { to: '/stack-carousel', label: 'StackCarousel' },
  { to: '/click-flip', label: 'Flip∞' },
  { to: '/click-flip-once', label: 'FlipOnce' },
  { to: '/click-popup', label: 'ClickPopup' },
  { to: '/click-cascade', label: 'ClickCascade' },
  { to: '/camara-stage', label: 'CamaraStage' },
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
          <Route path="/cover" element={<CoverPage />} />
          <Route path="/any-carousel" element={<AnyCarouselPage />} />
          <Route path="/flash-slide" element={<FlashSlideCarouselPage />} />
          <Route path="/spin-zoom" element={<SpinZoomCarouselPage />} />
          <Route path="/any-loop-display" element={<AnyLoopDisplayPage />} />
          <Route path="/stack-carousel" element={<StackCarouselPage />} />
          <Route path="/click-flip" element={<ClickFlipInfinityPage />} />
          <Route path="/click-flip-once" element={<ClickFlipOncePage />} />
          <Route path="/click-popup" element={<ClickPopupPage />} />
          <Route path="/click-cascade" element={<ClickCascadePage />} />
          <Route path="/camara-stage" element={<CamaraStagePage />} />
          <Route path="/behaviors" element={<BehaviorsPage />} />
          <Route path="/css" element={<CssPage />} />
          <Route path="/utils" element={<UtilsPage />} />
        </Routes>
      </main>
    </div>
  )
}
