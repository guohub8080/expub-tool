import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetRyConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setRy(config: I_SetRyConfig) {
  return setAttribute({ ...config, attributeName: 'ry' })
}
