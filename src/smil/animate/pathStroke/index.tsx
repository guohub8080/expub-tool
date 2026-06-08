import React from 'react'
import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'
import defaultTo from 'lodash/defaultTo'

export interface I_PathStrokeConfig extends Omit<I_AnimateAttributeConfig<number>, 'attributeName' | 'initValue'> {
  pathLength: number
  initValue?: number
}

export function animatePathStroke(config: I_PathStrokeConfig) {
  const { pathLength, ...rest } = config
  return animateAttribute<number>({
    ...rest,
    attributeName: 'stroke-dashoffset',
    initValue: defaultTo(rest.initValue, pathLength),
    isFreeze: defaultTo(rest.isFreeze, true),
  })
}

export { animatePathStrokeWrap } from './wrapped'
export type { I_PathStrokeWrapConfig } from './wrapped'
