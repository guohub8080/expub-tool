import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetHrefConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setHref(config: I_SetHrefConfig) {
  return setAttribute({ ...config, attributeName: 'href' })
}
