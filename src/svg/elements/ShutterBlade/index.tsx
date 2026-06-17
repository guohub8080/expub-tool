import React from "react"
import defaultTo from "lodash/defaultTo"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { spacing } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformTranslate } from "@smil/index"
import type { I_ShutterBladeProps } from "./types"
import {
  DEFAULT_BLADES,
  DEFAULT_BLADE_FILL,
  DEFAULT_BLADE_STROKE,
  DEFAULT_BLADE_STROKE_WIDTH,
  DEFAULT_CLOSE_DURATION,
  DEFAULT_CLOSE_STAY,
  DEFAULT_OPEN_DURATION,
  DEFAULT_OPEN_STAY,
  DEFAULT_TRAVEL,
} from "./types"

export type { I_ShutterBladeProps } from "./types"

const rad = (deg: number) => (deg * Math.PI) / 180
const round4 = (n: number) => Math.round(n * 10000) / 10000

/**
 * ShutterBlade — 相机快门叶片（光圈式收缩）
 *
 * N 片大三角形叶片，互相重叠。每片顶点在画布外缘、底边跨过中心到对侧外缘——
 * 形成一个「比扇区大得多」的三角形，相邻叶片大面积重叠。
 *
 * 关闭态：叶片在自己「home」位置（rotate=0, translate=0），中心露出一个圆形孔洞
 * （孔的大小由 travel 决定：叶片从 home 向中心平移 travel，孔变小）。
 *
 * 收缩：每片沿自己的径向（顶点→中心方向）向中心平移 travel → 叶片往中心挤、
 * 圆孔越来越小 → 最终闭合。
 *
 * 打开：反向平移，孔变大、露出底图。
 *
 * 时序（初始打开/露出）：
 * 收缩(closeDuration) → 闭合停留(closeStay) → 张开(openDuration) → 打开停留(openStay) → 循环。
 */
const ShutterBlade = (props: I_ShutterBladeProps) => {
  const { canvasSize, children } = props
  const blades = defaultTo(props.blades, DEFAULT_BLADES)
  const bladeFill = defaultTo(props.bladeFill, DEFAULT_BLADE_FILL)
  const bladeStroke = defaultTo(props.bladeStroke, DEFAULT_BLADE_STROKE)
  const bladeStrokeWidth = defaultTo(props.bladeStrokeWidth, DEFAULT_BLADE_STROKE_WIDTH)
  const closeDuration = defaultTo(props.closeDuration, DEFAULT_CLOSE_DURATION)
  const closeStay = defaultTo(props.closeStay, DEFAULT_CLOSE_STAY)
  const openDuration = defaultTo(props.openDuration, DEFAULT_OPEN_DURATION)
  const openStay = defaultTo(props.openStay, DEFAULT_OPEN_STAY)

  const spacingResult = spacing(props.spacing)
  const isDev = ExPubGoConfig().mode === "development"
  const cx = canvasSize.w / 2
  const cy = canvasSize.h / 2
  const radius = Math.hypot(canvasSize.w, canvasSize.h) / 2
  const sector = 360 / blades
  // 收缩行程：用户传正值用用户值，否则自动（对角线 * 2/3）
  const travelResolved = defaultTo(props.travel, DEFAULT_TRAVEL)
  const travel = travelResolved > 0 ? travelResolved : (radius * 2) / 3

  return (
    <SectionEx
      {...(isDev ? { "expubgo-label": "shutter-blade" } : {})}
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
          {children}

          {Array.from({ length: blades }, (_, i) => {
            const a = i * sector - 90
            // 顶点：外缘
            const tip = { x: cx + radius * Math.cos(rad(a)), y: cy + radius * Math.sin(rad(a)) }
            // 底边两端：外缘、跨 2 个扇区（比 1 个扇区大，确保相邻重叠）
            const baseA = { x: cx + radius * Math.cos(rad(a + sector)), y: cy + radius * Math.sin(rad(a + sector)) }
            const baseB = { x: cx + radius * Math.cos(rad(a - sector)), y: cy + radius * Math.sin(rad(a - sector)) }
            const points = `${round4(tip.x)},${round4(tip.y)} ${round4(baseA.x)},${round4(baseA.y)} ${round4(baseB.x)},${round4(baseB.y)}`
            // 平移方向：顶点 → 中心（叶片沿此方向向中心收缩）
            const dx = round4((cx - tip.x) / radius * travel)
            const dy = round4((cy - tip.y) / radius * travel)
            return (
              <g key={i}>
                {transformTranslate({
                  initValue: { x: 0, y: 0 },
                  timeline: [
                    { toAbs: { x: dx, y: dy }, durationSeconds: closeDuration },
                    { toAbs: { x: dx, y: dy }, durationSeconds: closeStay },
                    { toAbs: { x: 0, y: 0 }, durationSeconds: openDuration },
                    { toAbs: { x: 0, y: 0 }, durationSeconds: openStay },
                  ],
                  begin: "0s",
                  calcMode: "linear",
                  isFreeze: true,
                  loopCount: 0,
                  isAdditive: false,
                  restart: "whenNotActive",
                })}
                <polygon points={points} fill={bladeFill} stroke={bladeStroke} strokeWidth={bladeStrokeWidth} />
              </g>
            )
          })}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ShutterBlade
