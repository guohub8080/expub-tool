import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import { transformSkewX, transformSkewY } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import { buildSkewPhaseSegments, buildStaySegments } from "../utils/phaseSegmentBuilders"
import { getRotationPivot } from "@utils/svg/getRotationPivot"
import { DEFAULT_EASE, combinePhaseSegments } from "./buildFullSegments"

/** 生成单轴 skew animateTransform（支持 timeline 模式 + stay 配置 + pivot） */
export const renderSkewAxisAnim = ({
  axis,
  entrySkew, exitSkew, staySkew,
  contentWidth, contentHeight,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  axis: 'X' | 'Y'
  entrySkew?: I_NormalizedChildItem['entry']['skewX']
  exitSkew?: I_NormalizedChildItem['exit']['skewX']
  staySkew?: I_NormalizedChildItem['stay']['skewX']
  contentWidth: number
  contentHeight: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}): { pivotX: number; pivotY: number; skewAnim: React.ReactElement | null } | null => {
  if (isNil(entrySkew) && isNil(exitSkew) && isNil(staySkew)) return null

  const animInitValue = defaultTo(entrySkew?.initValue, 0)
  const exitTargetValue = defaultTo(exitSkew?.initValue, 0)
  const ease = defaultTo(entrySkew?.keySplines, defaultTo(exitSkew?.keySplines, DEFAULT_EASE))

  const skewPivot = getRotationPivot({
    pivot: defaultTo(entrySkew?.childCanvasPivot, defaultTo(exitSkew?.childCanvasPivot, 'Center')),
    contentWidth,
    contentHeight,
  })
  const [pivotX, pivotY] = skewPivot

  const entrySegs = buildSkewPhaseSegments({ skewConfig: entrySkew, phaseDuration: switchDuration, simpleTargetValue: 0, defaultEase: ease })
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].toAbs : 0
  const staySegs = buildStaySegments({ stayConfig: staySkew, stayDuration, entryEndValue: lastEntryValue, defaultEase: ease })
  const exitSegs = buildSkewPhaseSegments({ skewConfig: exitSkew, phaseDuration: nextSwitchDuration, simpleTargetValue: exitTargetValue, defaultEase: defaultTo(exitSkew?.keySplines, ease) })

  const segs = combinePhaseSegments(entrySegs, staySegs, exitSegs, exitTargetValue, holdDuration, ease)

  const skewConfig = { initValue: animInitValue, timeline: segs, begin: `${begin}s`, loopCount: 0, isFreeze: true, isAdditive: false }
  const skewAnim = axis === 'Y' ? transformSkewY(skewConfig) : transformSkewX(skewConfig)
  return { pivotX, pivotY, skewAnim }
}
