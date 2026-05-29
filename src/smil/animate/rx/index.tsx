import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_RxConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateRx(config: I_RxConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'rx' })
}
