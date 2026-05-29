import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetStrokeWidthConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setStrokeWidth(config: I_SetStrokeWidthConfig) {
  return setAttribute({ ...config, attributeName: 'stroke-width' })
}
