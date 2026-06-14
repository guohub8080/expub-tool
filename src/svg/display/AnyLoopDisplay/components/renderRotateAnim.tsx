import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import { transformRotate } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import { buildRotationPhaseSegments, buildStaySegments } from "../utils/phaseSegmentBuilders"
import { getRotationOrigin } from "@utils/svg/getRotationOrigin"
import { DEFAULT_EASE, combinePhaseSegments } from "./buildFullSegments"

/** 生成 rotate animateTransform（支持 timeline 模式 + stay 配置） */
export const renderRotateAnim = ({
  entryRotation, exitRotation, stayRotation, contentWidth, contentHeight,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryRotation?: I_NormalizedChildItem['entry']['rotation']
  exitRotation?: I_NormalizedChildItem['exit']['rotation']
  stayRotation?: I_NormalizedChildItem['stay']['rotation']
  contentWidth: number
  contentHeight: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entryRotation) && isNil(exitRotation) && isNil(stayRotation)) return null

  const animInitValue = defaultTo(entryRotation?.initValue, 0)
  const exitTargetValue = defaultTo(exitRotation?.initValue, 0)

  const rotationOrigin = getRotationOrigin({
    origin: defaultTo(entryRotation?.childCanvasOrigin, defaultTo(exitRotation?.childCanvasOrigin, 'Center')),
    contentWidth,
    contentHeight,
  })

  const ease = defaultTo(entryRotation?.keySplines, defaultTo(exitRotation?.keySplines, DEFAULT_EASE))

  const entrySegs = buildRotationPhaseSegments({ rotationConfig: entryRotation, phaseDuration: switchDuration, simpleTargetValue: 0, defaultEase: ease })
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 0
  const staySegs = buildStaySegments({ stayConfig: stayRotation, stayDuration, entryEndValue: lastEntryValue, defaultEase: ease })
  const exitSegs = buildRotationPhaseSegments({ rotationConfig: exitRotation, phaseDuration: nextSwitchDuration, simpleTargetValue: exitTargetValue, defaultEase: defaultTo(exitRotation?.keySplines, ease) })

  const segs = combinePhaseSegments(entrySegs, staySegs, exitSegs, exitTargetValue, holdDuration, ease)

  return transformRotate({
    initValue: animInitValue,
    timeline: segs,
    origin: rotationOrigin,
    begin: `${begin}s`,
    loopCount: 0,
    isFreeze: true,
    isAdditive: false,
  })
}
