import { setAttribute } from './setAttribute'
import type { I_SetAttributeConfig } from './setAttribute'

export type I_SetRxConfig = Omit<I_SetAttributeConfig, 'attributeName'>

export function setRx(config: I_SetRxConfig) {
  return setAttribute({ ...config, attributeName: 'rx' })
}
