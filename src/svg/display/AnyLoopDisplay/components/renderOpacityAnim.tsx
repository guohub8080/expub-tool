import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import { animateOpacity } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import { buildOpacityPhaseSegments, buildStaySegments } from "../utils/phaseSegmentBuilders"
import { DEFAULT_EASE, combinePhaseSegments } from "./buildFullSegments"

/** 生成 opacity animate（支持 timeline 模式 + stay/hold 配置） */
export const renderOpacityAnim = ({
  entryOpacity, exitOpacity, stayOpacity, holdOpacity,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryOpacity?: I_NormalizedChildItem['entry']['opacity']
  exitOpacity?: I_NormalizedChildItem['exit']['opacity']
  stayOpacity?: I_NormalizedChildItem['stay']['opacity']
  holdOpacity?: I_NormalizedChildItem['hold']['opacity']
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entryOpacity) && isNil(exitOpacity) && isNil(stayOpacity) && isNil(holdOpacity)) return null

  const animInitValue = defaultTo(entryOpacity?.initValue, 1)
  const exitTargetValue = defaultTo(exitOpacity?.initValue, 1)
  const ease = defaultTo(entryOpacity?.keySplines, defaultTo(exitOpacity?.keySplines, DEFAULT_EASE))

  const entrySegs = buildOpacityPhaseSegments({ opacityConfig: entryOpacity, phaseDuration: switchDuration, simpleTargetValue: 1, defaultEase: ease })
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 1
  const staySegs = buildStaySegments({ stayConfig: stayOpacity, stayDuration, entryEndValue: lastEntryValue, defaultEase: ease })
  const exitSegs = buildOpacityPhaseSegments({ opacityConfig: exitOpacity, phaseDuration: nextSwitchDuration, simpleTargetValue: exitTargetValue, defaultEase: defaultTo(exitOpacity?.keySplines, ease) })

  // hold 段：有 holdOpacity 配置时构建自定义 hold 段，否则保持 exit 终态
  const lastExitValue = exitSegs.length > 0 ? exitSegs[exitSegs.length - 1].toAbs : exitTargetValue
  const holdSegs = holdOpacity
    ? buildStaySegments({ stayConfig: holdOpacity, stayDuration: holdDuration, entryEndValue: lastExitValue, defaultEase: ease })
    : undefined

  const segs = combinePhaseSegments(entrySegs, staySegs, exitSegs, exitTargetValue, holdDuration, ease, holdSegs)

  return animateOpacity({
    initValue: animInitValue,
    timeline: segs,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
  })
}
