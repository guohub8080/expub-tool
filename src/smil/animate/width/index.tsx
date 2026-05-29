import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_WidthConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateWidth(config: I_WidthConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'width' })
}
