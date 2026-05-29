import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetYConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setY(config: I_SetYConfig) {
  return setAttribute({ ...config, attributeName: 'y' })
}
