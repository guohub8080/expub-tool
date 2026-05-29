import React from 'react'
import { animatePathStroke } from './index'
import type { I_PathStrokeConfig } from './index'

export interface I_PathStrokeWrapConfig extends Omit<I_PathStrokeConfig, 'pathLength'> {
  pathLength: number
  element: React.ReactElement
  clickableAreaSize?: { width: number; height: number }
}

export function animatePathStrokeWrap(config: I_PathStrokeWrapConfig): React.ReactElement {
  const { pathLength, element, begin, clickableAreaSize, ...strokeConfig } = config

  return (
    <g style={begin ? { cursor: 'pointer' } : undefined}>
      {animatePathStroke({ pathLength, ...strokeConfig })}
      {begin && clickableAreaSize && (
        <rect
          x="0"
          y="0"
          width={clickableAreaSize.width}
          height={clickableAreaSize.height}
          fill="transparent"
          pointerEvents="visiblePainted"
        />
      )}
      {element}
    </g>
  )
}
