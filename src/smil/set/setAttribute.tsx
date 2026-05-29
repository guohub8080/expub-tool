import React from 'react'
import type { T_NativeSet } from '@smil/types'

export interface I_SetAttributeConfig {
  attributeName: string
  to: string
  begin?: string
  isFreeze?: boolean
  loopCount?: number
  native?: T_NativeSet
}

export function setAttribute(config: I_SetAttributeConfig) {
  const {
    attributeName,
    to,
    begin,
    isFreeze = true,
    loopCount = 1,
  } = config

  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount

  return (
    <set
      attributeName={attributeName}
      to={to}
      begin={begin}
      fill={isFreeze ? 'freeze' : 'remove'}
      repeatCount={repeatCountValue}
      {...config.native}
    />
  )
}
