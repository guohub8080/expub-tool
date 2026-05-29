import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_HeightConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateHeight(config: I_HeightConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'height' })
}
