import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_XConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateX(config: I_XConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'x' })
}
