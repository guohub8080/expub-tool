import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import { transformSkewX, transformSkewY } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import { buildSkewPhaseSegments, buildStaySegments } from "../utils/phaseSegmentBuilders"
import { DEFAULT_EASE, combinePhaseSegments } from "./buildFullSegments"

/** 生成单轴 skew animateTransform（支持 timeline 模式 + stay 配置） */
export const renderSkewAxisAnim = ({
  axis,
  entrySkew, exitSkew, staySkew,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  axis: 'X' | 'Y'
  entrySkew?: I_NormalizedChildItem['entry']['skewX']
  exitSkew?: I_NormalizedChildItem['exit']['skewX']
  staySkew?: I_NormalizedChildItem['stay']['skewX']
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}) => {
  if (isNil(entrySkew) && isNil(exitSkew) && isNil(staySkew)) return null

  const animInitValue = defaultTo(entrySkew?.initValue, 0)
  const exitTargetValue = defaultTo(exitSkew?.initValue, 0)
  const ease = defaultTo(entrySkew?.keySplines, defaultTo(exitSkew?.keySplines, DEFAULT_EASE))

  const entrySegs = buildSkewPhaseSegments({ skewConfig: entrySkew, phaseDuration: switchDuration, simpleTargetValue: 0, defaultEase: ease })
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 0
  const staySegs = buildStaySegments({ stayConfig: staySkew, stayDuration, entryEndValue: lastEntryValue, defaultEase: ease })
  const exitSegs = buildSkewPhaseSegments({ skewConfig: exitSkew, phaseDuration: nextSwitchDuration, simpleTargetValue: exitTargetValue, defaultEase: defaultTo(exitSkew?.keySplines, ease) })

  const segs = combinePhaseSegments(entrySegs, staySegs, exitSegs, exitTargetValue, holdDuration, ease)

  const skewConfig = { initValue: animInitValue, timeline: segs, begin: `${begin}s`, loopCount: 0, isFreeze: true, isAdditive: false }
  return axis === 'Y' ? transformSkewY(skewConfig) : transformSkewX(skewConfig)
}
