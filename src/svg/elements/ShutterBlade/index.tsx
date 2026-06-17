import React from "react"
import defaultTo from "lodash/defaultTo"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { spacing } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
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
} from "./types"

export type { I_ShutterBladeProps } from "./types"

/** 极坐标 → 直角坐标 */
const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const round4 = (n: number): number => Math.round(n * 10000) / 10000

/**
 * ShutterBlade — 相机快门叶片（平移开合）
 *
 * 叶片形状：三角形（顶点在画布中心 C + 底边两端在外缘圆上，跨一个扇区 360/N）。
 * 关闭态（translate=0）：N 片在中心无缝拼接、铺满整圆，完全覆盖画布（含四角）。
 *
 * 平移：每片沿自己的径向（底边中点方向）外移 outerDist（> 画布对角线）→ 整片到 viewBox 外，完全看不到。
 *
 * 动作（一个周期，初始在 viewBox 外）：
 * - 进来：从外平移到中心（translate 外移 → 0），N 片拼拢覆盖。
 * - 闭合停留：铺满。
 * - 撤离：从中心平移到外（translate 0 → 外移），露出底图。
 * - 打开停留。
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
  // 外缘半径 = 对角线一半，叶片底边在外缘、顶点在中心，关闭时铺满覆盖四角
  const radius = Math.hypot(canvasSize.w, canvasSize.h) / 2
  const sector = 360 / blades
  // 外移距离：超过画布对角线半径，确保整片移到 viewBox 外完全看不到
  const outerDist = radius * 1.5

  // 时序：进来(closeDuration) → 闭合停留(closeStay) → 撤离(openDuration) → 打开停留(openStay)
  const cycle = closeDuration + closeStay + openDuration + openStay
  const keyTimes = [
    0,
    closeDuration / cycle,
    (closeDuration + closeStay) / cycle,
    (closeDuration + closeStay + openDuration) / cycle,
    1,
  ].map(round4).join(";")

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
          {/* 快门后面的内容（叶片撤离时露出） */}
          {children}

          {/* 快门叶片：N 片三角形，沿径向平移进出 */}
          {Array.from({ length: blades }, (_, i) => {
            const alpha = i * sector - 90
            const baseA = polar(cx, cy, radius, alpha)
            const baseB = polar(cx, cy, radius, alpha + sector)
            // 径向角度（底边中点方向），叶片沿此方向外移
            const theta = alpha + sector / 2
            const rad = (theta * Math.PI) / 180
            const dx = round4(outerDist * Math.cos(rad))
            const dy = round4(outerDist * Math.sin(rad))
            const points = `${cx},${cy} ${round4(baseA.x)},${round4(baseA.y)} ${round4(baseB.x)},${round4(baseB.y)}`
            // translate: 初始外移(外) → 0(关闭铺满) → 0(停留) → 外移(撤离) → 外移(停留)
            const values = `${dx} ${dy}; 0 0; 0 0; ${dx} ${dy}; ${dx} ${dy}`
            return (
              <g key={i}>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={values}
                  keyTimes={keyTimes}
                  calcMode="linear"
                  dur={`${cycle}s`}
                  begin="0s"
                  fill="freeze"
                  repeatCount="indefinite"
                />
                <polygon
                  points={points}
                  fill={bladeFill}
                  stroke={bladeStroke}
                  strokeWidth={bladeStrokeWidth}
                />
              </g>
            )
          })}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ShutterBlade
