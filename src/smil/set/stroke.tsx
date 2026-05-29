import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetStrokeConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setStroke(config: I_SetStrokeConfig) {
  return setAttribute({ ...config, attributeName: 'stroke' })
}
