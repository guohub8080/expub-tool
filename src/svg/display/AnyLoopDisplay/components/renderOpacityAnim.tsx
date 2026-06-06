import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import { animateOpacity } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import { buildOpacityPhaseSegments, buildStaySegments } from "../utils/phaseSegmentBuilders"
import { DEFAULT_EASE, combinePhaseSegments } from "./buildFullSegments"

/** 生成 opacity animate（支持 timeline 模式 + stay 配置） */
export const renderOpacityAnim = ({
  entryOpacity, exitOpacity, stayOpacity,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryOpacity?: I_NormalizedChildItem['entry']['opacity']
  exitOpacity?: I_NormalizedChildItem['exit']['opacity']
  stayOpacity?: I_NormalizedChildItem['stay']['opacity']
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entryOpacity) && isNil(exitOpacity) && isNil(stayOpacity)) return null

  const animInitValue = defaultTo(entryOpacity?.initValue, 1)
  const exitTargetValue = defaultTo(exitOpacity?.initValue, 1)
  const ease = entryOpacity?.keySplines ?? exitOpacity?.keySplines ?? DEFAULT_EASE

  const entrySegs = buildOpacityPhaseSegments({ opacityConfig: entryOpacity, phaseDuration: switchDuration, simpleTargetValue: 1, defaultEase: ease })
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].to : 1
  const staySegs = buildStaySegments({ stayConfig: stayOpacity, stayDuration, entryEndValue: lastEntryValue, defaultEase: ease })
  const exitSegs = buildOpacityPhaseSegments({ opacityConfig: exitOpacity, phaseDuration: nextSwitchDuration, simpleTargetValue: exitTargetValue, defaultEase: defaultTo(exitOpacity?.keySplines, ease) })

  const segs = combinePhaseSegments(entrySegs, staySegs, exitSegs, exitTargetValue, holdDuration, ease)

  return animateOpacity({
    initValue: animInitValue,
    timeline: segs,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
  })
}
