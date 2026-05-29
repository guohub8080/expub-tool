import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetR_Config = Omit<I_SetAttributeConfig, 'attributeName'>

export function setR(config: I_SetR_Config) {
  return setAttribute({ ...config, attributeName: 'r' })
}
