import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetCyConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setCy(config: I_SetCyConfig) {
  return setAttribute({ ...config, attributeName: 'cy' })
}
