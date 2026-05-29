import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_StrokeConfig = Omit<I_AnimateAttributeConfig<string>, 'attributeName'>

export function animateStroke(config: I_StrokeConfig) {
  return animateAttribute<string>({ ...config, attributeName: 'stroke' })
}
