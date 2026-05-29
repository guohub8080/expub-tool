import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_RyConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateRy(config: I_RyConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'ry' })
}
