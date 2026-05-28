import React from 'react'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import type { I_PathMotionConfig, T_PathMotionRotate } from './types'

function resolveRotate(rotate: T_PathMotionRotate): string {
  return typeof rotate === 'number' ? rotate.toString() : rotate
}

export function pathMotion(config: I_PathMotionConfig) {
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

  if (!path) {
    throw new Error('`path` must not be empty.')
  }

  const rotateValue = resolveRotate(rotate)
  const repeatCountValue = loopCount === 0 ? 'indefinite' : loopCount
  const finalKeyTimes = calcMode === 'spline' ? defaultTo(keyTimes, '0;1') : keyTimes

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
