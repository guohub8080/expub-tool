import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetCxConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setCx(config: I_SetCxConfig) {
  return setAttribute({ ...config, attributeName: 'cx' })
}
