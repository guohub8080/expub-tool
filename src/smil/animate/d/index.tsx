import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_DConfig = Omit<I_AnimateAttributeConfig<string>, 'attributeName'>

export function animateD(config: I_DConfig) {
  return animateAttribute<string>({ ...config, attributeName: 'd' })
}
