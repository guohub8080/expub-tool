import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'
import defaultTo from 'lodash/defaultTo'

export type T_VisibilityValue = 'visible' | 'hidden' | 'collapse'

export type I_VisibilityConfig = Omit<I_AnimateAttributeConfig<T_VisibilityValue>, 'attributeName'>

export function animateVisibility(config: I_VisibilityConfig) {
  return animateAttribute<T_VisibilityValue>({
    ...config,
    attributeName: 'visibility',
    initValue: defaultTo(config.initValue, 'hidden'),
    calcMode: defaultTo(config.calcMode, 'discrete'),
  })
}
