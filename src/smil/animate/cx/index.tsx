import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_CxConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateCx(config: I_CxConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'cx' })
}
