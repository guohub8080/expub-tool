import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_FillConfig = Omit<I_AnimateAttributeConfig<string>, 'attributeName'>

export function animateFill(config: I_FillConfig) {
  return animateAttribute<string>({ ...config, attributeName: 'fill' })
}
