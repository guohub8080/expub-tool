import React from 'react'
import isNil from 'lodash/isNil'
import type { T_NativeAnimateMotion } from '@smil/types'
import defaultTo from 'lodash/defaultTo'

export type T_PathMotionRotate = 'auto' | 'auto-reverse' | number

export interface I_PathMotionConfig {
  path: string
  durationSeconds?: number
  rotate?: T_PathMotionRotate
  begin?: string
  calcMode?: 'spline' | 'linear' | 'paced'
  keySplines?: string
  keyTimes?: string
  isFreeze?: boolean
  loopCount?: number
  restart?: 'always' | 'whenNotActive' | 'never'
  native?: T_NativeAnimateMotion
}

function resolveRotate(rotate: T_PathMotionRotate): string {
  return typeof rotate === 'number' ? rotate.toString() : rotate
}

export function animateMotion(config: I_PathMotionConfig) {
  const {
    path,
    durationSeconds = 6,
    rotate = 'auto',
    begin,
    calcMode = 'linear',
    keySplines,
    keyTimes,
    isFreeze = false,
    loopCount = 0,
    restart,
  } = config

  if (isNil(path)) {
    throw new Error('`path` must not be empty.')
  }

  const rotateValue = resolveRotate(rotate)
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount
  const finalKeyTimes = calcMode === 'spline' ? defaultTo(keyTimes, '0;1') : undefined

  return (
    <animateMotion
      path={path}
      dur={`${durationSeconds}s`}
      rotate={rotateValue}
      calcMode={calcMode}
      keySplines={keySplines}
      keyTimes={finalKeyTimes}
      repeatCount={repeatCountValue}
      begin={begin}
      fill={isFreeze ? 'freeze' : 'remove'}
      {...(!isNil(restart) && { restart })}
      {...config.native}
    />
  )
}
