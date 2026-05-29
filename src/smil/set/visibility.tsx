import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type T_VisibilityValue = 'visible' | 'hidden' | 'collapse'
export type I_SetVisibilityConfig = Omit<I_SetAttributeConfig, 'attributeName' | 'to'> & {
  to: T_VisibilityValue
}

export function setVisibility(config: I_SetVisibilityConfig) {
  return setAttribute({ ...config, attributeName: 'visibility' })
}
