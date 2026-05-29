import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetHeightConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setHeight(config: I_SetHeightConfig) {
  return setAttribute({ ...config, attributeName: 'height' })
}
