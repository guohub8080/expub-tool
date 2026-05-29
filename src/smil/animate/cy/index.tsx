import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_CyConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateCy(config: I_CyConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'cy' })
}
