import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetXConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setX(config: I_SetXConfig) {
  return setAttribute({ ...config, attributeName: 'x' })
}
