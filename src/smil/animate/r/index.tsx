import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_R_Config = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateR(config: I_R_Config) {
  return animateAttribute<number>({ ...config, attributeName: 'r' })
}
