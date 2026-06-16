import React from "react"
import isNil from "lodash/isNil"
import defaultTo from "lodash/defaultTo"
import { isDefined } from "@utils/fn/isDefined"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import svgURL from "@utils/svg/svgURL"
import { spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import type { I_CanvasBg } from "@svg/types"
import type { FlashSlideItem, I_FlashSlideCarouselProps } from "./types"
import {
  DEFAULT_DURATION,
  DEFAULT_FLASH_SHRINK,
  DEFAULT_FLASH_SCALE,
  DEFAULT_TRANS_FRAC,
} from "./types"

export type { FlashSlideItem, I_FlashSlideCarouselProps } from "./types"

/** ease-in-out，用于 opacity 与 scale 全部段 */
const EASE = "0.42 0 0.58 1"

/** 生成 count 个 EASE（用分号连接），count = keyTimes 数 − 1 */
const easeN = (keyTimeCount: number): string => Array(keyTimeCount - 1).fill(EASE).join(";")

/** 保留 4 位小数，避免 keyTimes 出现浮点尾巴 */
const round4 = (n: number): number => Math.round(n * 10000) / 10000

interface Timeline {
  keyTimes: string
  values: string
  keyTimeCount: number
}

/**
 * 第 i 张图的 opacity 时间线（一个周期内）
 *
 * - i=0：t=0 可见（上周期末已从最后一张淡化进来），slot 末淡化出去，周期末再淡化进来（接最后一张）
 * - i>0：slot 起淡化进来，slot 末淡化出去，其余隐藏
 *
 * tw = 切换宽度（全局比例），淡化窗口 = [slotEnd − tw, slotEnd]
 */
const buildOpacity = (i: number, N: number, tw: number): Timeline => {
  if (i === 0) {
    const slotEnd = round4(1 / N)
    const keyTimes = [0, round4(slotEnd - tw), slotEnd, round4(1 - tw), 1]
    return { keyTimes: keyTimes.join(";"), values: "1;1;0;0;1", keyTimeCount: keyTimes.length }
  }
  const slotStart = round4(i / N)
  const slotEnd = round4((i + 1) / N)
  const keyTimes = [0, round4(slotStart - tw), slotStart, round4(slotEnd - tw), slotEnd, 1]
  return { keyTimes: keyTimes.join(";"), values: "0;0;1;1;0;0", keyTimeCount: keyTimes.length }
}

/**
 * 第 i 张图的 scale 时间线（一个周期内）
 *
 * 全程 scale=1，仅在 slot 末淡化窗口 [slotEnd−tw, slotEnd] 内抖动：
 * 1 → shrink → high → shrink → 1
 */
const buildScale = (i: number, N: number, tw: number, shrink: number, high: number): Timeline => {
  const slotEnd = round4((i + 1) / N)
  const a = round4(slotEnd - tw)
  const points = [a, round4(a + tw / 4), round4(a + tw / 2), round4(a + (3 * tw) / 4), slotEnd]
  const keyTimes = [0, ...points, 1]
  const values = [1, 1, shrink, high, shrink, 1, 1].join(";")
  return { keyTimes: keyTimes.join(";"), values, keyTimeCount: keyTimes.length }
}

/**
 * 快门图 opacity 时间线：每个切换窗口中段闪现一次（0→1→0）
 *
 * 闪现窗口对齐抖动峰值：[slotEnd − 3tw/4, slotEnd − tw/4]，峰在 slotEnd − tw/2
 */
const buildShutterOpacity = (N: number, tw: number): Timeline => {
  const keyTimes: number[] = [0]
  const values: number[] = [0]
  for (let i = 0; i < N; i++) {
    const slotEnd = round4((i + 1) / N)
    keyTimes.push(round4(slotEnd - (3 * tw) / 4), round4(slotEnd - tw / 2), round4(slotEnd - tw / 4))
    values.push(0, 1, 0)
  }
  keyTimes.push(1)
  values.push(0)
  return { keyTimes: keyTimes.join(";"), values: values.join(";"), keyTimeCount: keyTimes.length }
}

const FlashSlideCarousel = (props: I_FlashSlideCarouselProps) => {
  const {
    canvasSize,
    childItems,
    canvasBg,
    spacing: spacingProp,
    shutter,
  } = props
  const duration = defaultTo(props.duration, DEFAULT_DURATION)
  const flashShrink = defaultTo(props.flashShrink, DEFAULT_FLASH_SHRINK)
  const flashScale = defaultTo(props.flashScale, DEFAULT_FLASH_SCALE)
  const transFrac = defaultTo(props.transFrac, DEFAULT_TRANS_FRAC)

  const spacingResult = spacing(spacingProp)
  const firstItem = childItems?.[0]
  if (isNil(firstItem?.url) && isNil(firstItem?.jsx)) return null

  const N = childItems.length
  const tw = transFrac / N  // 切换宽度（全局比例）
  const isDev = ExPubGoConfig().mode === "development"
  const cx = canvasSize.w / 2
  const cy = canvasSize.h / 2

  return (
    <SectionEx
      {...(isDev ? { "expubgo-label": "flash-slide" } : {})}
      style={{
        boxSizing: "border-box",
        display: "block",
        overflow: "hidden",
        pointerEvents: "none",
        userSelect: "none",
        width: "100%",
        ...spacingResult,
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`} style={{ display: "block", width: "100%" }}>
          {/* 背景层 */}
          <g>
            <foreignObject x={0} y={0} width={canvasSize.w} height={canvasSize.h}>
              <svg viewBox={`0 0 ${canvasSize.w} ${canvasSize.h}`} style={{ ...resolveCanvasBg(canvasBg), width: "100%" }} />
            </foreignObject>
          </g>

          {childItems.map((item, i) => {
            const op = buildOpacity(i, N, tw)
            const sc = buildScale(i, N, tw, flashShrink, flashScale)
            return (
              <g key={i}>
                <animate
                  attributeName="opacity"
                  values={op.values}
                  keyTimes={op.keyTimes}
                  keySplines={easeN(op.keyTimeCount)}
                  calcMode="spline"
                  dur={`${duration}s`}
                  begin="0s"
                  fill="freeze"
                  repeatCount="indefinite"
                />
                {/* scale 围绕画布中心：translate(中心) → scale → translate(−中心) */}
                <g transform={`translate(${cx} ${cy})`}>
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      values={sc.values}
                      keyTimes={sc.keyTimes}
                      keySplines={easeN(sc.keyTimeCount)}
                      calcMode="spline"
                      dur={`${duration}s`}
                      begin="0s"
                      fill="freeze"
                      repeatCount="indefinite"
                    />
                    <g transform={`translate(${-cx} ${-cy})`}>
                      <ItemContent item={item} w={canvasSize.w} h={canvasSize.h} />
                    </g>
                  </g>
                </g>
              </g>
            )
          })}
          {/* 快门层：每次切换瞬间闪现一次（覆盖在所有图上） */}
          {isDefined(shutter) && (() => {
            const sh = buildShutterOpacity(N, tw)
            return (
              <g>
                <animate
                  attributeName="opacity"
                  values={sh.values}
                  keyTimes={sh.keyTimes}
                  keySplines={easeN(sh.keyTimeCount)}
                  calcMode="spline"
                  dur={`${duration}s`}
                  begin="0s"
                  fill="freeze"
                  repeatCount="indefinite"
                />
                <ItemContent item={shutter} w={canvasSize.w} h={canvasSize.h} />
              </g>
            )
          })()}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

const ItemContent = ({ item, w, h }: { item: FlashSlideItem; w: number; h: number }) => {
  if (isDefined(item.jsx)) return <>{item.jsx}</>
  return (
    <foreignObject x={0} y={0} width={w} height={h}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ backgroundImage: svgURL(item.url!), backgroundSize: "cover", backgroundPosition: "50% 50%", width: "100%" }} />
    </foreignObject>
  )
}

export default FlashSlideCarousel
