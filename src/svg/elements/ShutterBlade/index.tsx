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
 * ShutterBlade — 相机快门叶片
 *
 * 叶片形状：顶点在画布中心 C，底边两端在外缘圆上（跨一个扇区 360/N）。
 * 关闭态（rotate=0）：N 片在中心无缝拼接，铺满整圆，完全覆盖画布。
 *
 * 旋转枢轴：底边中点 M（外缘）。绕 M 旋转 openAngle → 叶片向边缘外翻（撤离），
 * 露出中心。openAngle 默认 = 扇区角，使撤离时叶片翻到画布外。
 *
 * 动作（一个周期）：关闭停留（铺满）→ 打开（翻出撤离）→ 打开停留 → 关闭（翻回铺满）。
 */
const ShutterBlade = (props: I_ShutterBladeProps) => {
  const { canvasSize, children } = props
  const blades = defaultTo(props.blades, DEFAULT_BLADES)
  const bladeFill = defaultTo(props.bladeFill, DEFAULT_BLADE_FILL)
  const bladeStroke = defaultTo(props.bladeStroke, DEFAULT_BLADE_STROKE)
  const bladeStrokeWidth = defaultTo(props.bladeStrokeWidth, DEFAULT_BLADE_STROKE_WIDTH)
  const openAngle = defaultTo(props.openAngle, 0)
  const closeDuration = defaultTo(props.closeDuration, DEFAULT_CLOSE_DURATION)
  const closeStay = defaultTo(props.closeStay, DEFAULT_CLOSE_STAY)
  const openDuration = defaultTo(props.openDuration, DEFAULT_OPEN_DURATION)
  const openStay = defaultTo(props.openStay, DEFAULT_OPEN_STAY)

  const spacingResult = spacing(props.spacing)
  const isDev = ExPubGoConfig().mode === "development"
  const cx = canvasSize.w / 2
  const cy = canvasSize.h / 2
  // 外缘半径 = 对角线一半，确保关闭时盖住四角
  const radius = Math.hypot(canvasSize.w, canvasSize.h) / 2
  const sector = 360 / blades

  // 撤离角度：让叶片翻到画布外。默认扇区角。
  const escapeAngle = openAngle > 0 ? openAngle : sector

  // 时序：关闭停留 → 打开 → 打开停留 → 关闭 → 循环
  const cycle = closeStay + openDuration + openStay + closeDuration
  const keyTimes = [
    0,
    closeStay / cycle,
    (closeStay + openDuration) / cycle,
    (closeStay + openDuration + openStay) / cycle,
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

          {/* 快门叶片：N 片，顶点在中心、底边在外缘，绕底边中点旋转 */}
          {Array.from({ length: blades }, (_, i) => {
            const alpha = i * sector - 90
            // 底边两端：外缘上，跨一个扇区
            const baseA = polar(cx, cy, radius, alpha)
            const baseB = polar(cx, cy, radius, alpha + sector)
            // 底边中点（枢轴）
            const pivotX = round4((baseA.x + baseB.x) / 2)
            const pivotY = round4((baseA.y + baseB.y) / 2)
            const points = `${cx},${cy} ${round4(baseA.x)},${round4(baseA.y)} ${round4(baseB.x)},${round4(baseB.y)}`
            // rotate: 0 = 关闭（铺满）；escapeAngle = 打开（翻出撤离）
            const values = [
              `0 ${pivotX} ${pivotY}`,
              `0 ${pivotX} ${pivotY}`,
              `${escapeAngle} ${pivotX} ${pivotY}`,
              `${escapeAngle} ${pivotX} ${pivotY}`,
              `0 ${pivotX} ${pivotY}`,
            ].join(";")
            return (
              <g key={i}>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
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
