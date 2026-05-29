import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_YConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateY(config: I_YConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'y' })
}
