import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetFillConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setFill(config: I_SetFillConfig) {
  return setAttribute({ ...config, attributeName: 'fill' })
}
