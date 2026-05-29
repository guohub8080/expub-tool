import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetOpacityConfig = Omit<I_SetAttributeConfig, 'attributeName' | 'to'> & {
  to: number
}

export function setOpacity(config: I_SetOpacityConfig) {
  return setAttribute({ ...config, attributeName: 'opacity', to: String(config.to) })
}
