import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetDisplayConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setDisplay(config: I_SetDisplayConfig) {
  return setAttribute({ ...config, attributeName: 'display' })
}
