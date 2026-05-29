import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_OpacityConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateOpacity(config: I_OpacityConfig) {
  return animateAttribute<number>({
    ...config,
    attributeName: 'opacity',
    initValue: config.initValue ?? 1,
    isFreeze: config.isFreeze ?? false,
  })
}
