import React from 'react'
import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export interface I_PathStrokeConfig extends Omit<I_AnimateAttributeConfig<number>, 'attributeName' | 'initValue'> {
  pathLength: number
  initValue?: number
}

export function animatePathStroke(config: I_PathStrokeConfig) {
  const { pathLength, ...rest } = config
  return animateAttribute<number>({
    ...rest,
    attributeName: 'stroke-dashoffset',
    initValue: rest.initValue ?? pathLength,
    isFreeze: rest.isFreeze ?? true,
  })
}

export { animatePathStrokeWrap } from './wrapped'
export type { I_PathStrokeWrapConfig } from './wrapped'
