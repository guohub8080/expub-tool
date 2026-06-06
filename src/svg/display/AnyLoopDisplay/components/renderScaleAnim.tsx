import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import type { ReactNode } from "react"
import { transformScaleRaw } from "@smil/index"
import type { I_NormalizedChildItem } from "../utils/normalizer"
import { buildScalePhaseSegments, buildStaySegments } from "../utils/phaseSegmentBuilders"
import { getRotationOrigin } from "../timeline/offsetCalculator"
import { DEFAULT_EASE, combinePhaseSegments } from "./buildFullSegments"

/**
 * 构建 scale 动画配置（使用 transformScaleRaw + 嵌套 <g>）
 *
 * 支持：
 * - 简单模式：entry from→1, exit 1→from
 * - 高级模式：entry/exit 使用用户自定义 timeline
 */
export const buildScaleAnimConfig = ({
  entryScale, exitScale, stayScale, contentWidth, contentHeight,
  stayDuration, switchDuration, nextSwitchDuration, holdDuration, begin,
}: {
  entryScale?: I_NormalizedChildItem['entry']['scale']
  exitScale?: I_NormalizedChildItem['exit']['scale']
  stayScale?: I_NormalizedChildItem['stay']['scale']
  contentWidth: number
  contentHeight: number
  stayDuration: number
  switchDuration: number
  nextSwitchDuration: number
  holdDuration: number
  begin: number
}): { originX: number; originY: number; scaleAnim: ReactNode } | null => {
  if (isNil(entryScale) && isNil(exitScale) && isNil(stayScale)) return null

  const animInitValue = defaultTo(entryScale?.initValue, 1)

  const scaleOrigin = getRotationOrigin({
    origin: defaultTo(entryScale?.childCanvasOrigin, exitScale?.childCanvasOrigin ?? 'Center'),
    contentWidth,
    contentHeight,
  })

  const [originX, originY] = scaleOrigin
  const ease = entryScale?.keySplines ?? exitScale?.keySplines ?? DEFAULT_EASE

  const entrySegs = buildScalePhaseSegments({ scaleConfig: entryScale, phaseDuration: switchDuration, simpleTargetValue: 1, defaultEase: ease })
  const lastEntryValue = entrySegs.length > 0 ? entrySegs[entrySegs.length - 1].to : 1
  const staySegs = buildStaySegments({ stayConfig: stayScale, stayDuration, entryEndValue: lastEntryValue, defaultEase: ease })

  const exitTargetValue = defaultTo(exitScale?.initValue, 1)
  const exitSegs = buildScalePhaseSegments({ scaleConfig: exitScale, phaseDuration: nextSwitchDuration, simpleTargetValue: exitTargetValue, defaultEase: ease })

  const segs = combinePhaseSegments(entrySegs, staySegs, exitSegs, exitTargetValue, holdDuration, ease)

  return {
    originX,
    originY,
    scaleAnim: transformScaleRaw({
      initValue: animInitValue,
      timeline: segs,
      begin: `${begin}s`,
      loopCount: 0,
      isFreeze: true,
      isAdditive: false,
    }),
  }
}
