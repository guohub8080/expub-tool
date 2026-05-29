import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetWidthConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setWidth(config: I_SetWidthConfig) {
  return setAttribute({ ...config, attributeName: 'width' })
}
