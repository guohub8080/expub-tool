import { animateAttribute } from '../attribute'
import type { I_AnimateAttributeConfig } from '../attribute'

export type I_StrokeWidthConfig = Omit<I_AnimateAttributeConfig<number>, 'attributeName'>

export function animateStrokeWidth(config: I_StrokeWidthConfig) {
  return animateAttribute<number>({ ...config, attributeName: 'stroke-width' })
}
