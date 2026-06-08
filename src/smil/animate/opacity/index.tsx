import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'
import defaultTo from 'lodash/defaultTo'

export type I_OpacityConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateOpacity(config: I_OpacityConfig) {
  return animateAttribute<number>({
    ...config,
    attributeName: 'opacity',
    initValue: defaultTo(config.initValue, 1),
    isFreeze: defaultTo(config.isFreeze, false),
  })
}
