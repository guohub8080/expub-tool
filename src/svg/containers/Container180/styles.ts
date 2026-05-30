import type { CSSProperties } from 'react'

export const rootBaseStyle: CSSProperties = {
  WebkitTouchCallout: 'none',
  userSelect: 'text',
  overflow: 'hidden',
  textAlign: 'center',
  lineHeight: 0,
}

export const rotateStyle: CSSProperties = {
  display: 'block',
  transform: 'rotate(180deg)',
  transformOrigin: 'center',
}
