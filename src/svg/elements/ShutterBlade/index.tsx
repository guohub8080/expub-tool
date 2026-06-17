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
 * N 片三角形叶片，每片顶点在画布外缘、底边朝向中心。
 *
 * 动作（一个周期）：
 * - 关闭：叶片从画布边缘旋入，底边向中心收拢，最终在中心拼成完整圆盘，包裹住整张画布。
 * - 闭合停留：叶片铺满（覆盖底图）。
 * - 打开：叶片向边缘旋回撤离，露出底图。
 * - 打开停留。
 *
 * 叶片 i：顶点 P_i（外缘，角度 α_i = i·360/N − 90），底边两端在外缘半径稍内处，
 * 构成一个指向中心的三角形。绕 P_i（外缘顶点）旋转：
 * - rotate=0：叶片「撇在边缘」（撤离状态，基本不挡画布）。
 * - rotate=openAngle：叶片旋入，底边盖向中心（包裹状态）。
 *
 * 叶片带描边（stroke）+ 浅填充，轮廓清晰有层次。
 */
const ShutterBlade = (props: I_ShutterBladeProps) => {
  const { canvasSize, children } = props
  const blades = defaultTo(props.blades, DEFAULT_BLADES)
  const bladeFill = defaultTo(props.bladeFill, DEFAULT_BLADE_FILL)
  const bladeStroke = defaultTo(props.bladeStroke, DEFAULT_BLADE_STROKE)
  const bladeStrokeWidth = defaultTo(props.bladeStrokeWidth, DEFAULT_BLADE_STROKE_WIDTH)
  const openAngle = defaultTo(props.openAngle, 0)  // 默认 0 = 内部自动算
  const openDuration = defaultTo(props.openDuration, DEFAULT_OPEN_DURATION)
  const openStay = defaultTo(props.openStay, DEFAULT_OPEN_STAY)
  const closeDuration = defaultTo(props.closeDuration, DEFAULT_CLOSE_DURATION)
  const closeStay = defaultTo(props.closeStay, DEFAULT_CLOSE_STAY)

  const spacingResult = spacing(props.spacing)
  const isDev = ExPubGoConfig().mode === "development"
  const cx = canvasSize.w / 2
  const cy = canvasSize.h / 2
  const radius = Math.hypot(canvasSize.w, canvasSize.h) / 2
  const sector = 360 / blades

  // 关闭态叶片需要旋入的角度：让底边从「撇在外」旋到「盖向中心」。
  // 默认取扇区角（360/N），使相邻叶片底边在中心拼接。
  const closeAngle = openAngle > 0 ? openAngle : sector

  // 开合时序（归一化 keyTimes）：撤离→关闭→停留→打开→停留
  const cycle = openDuration + openStay + closeDuration + closeStay
  const keyTimes = [
    0,
    openDuration / cycle,
    (openDuration + closeStay) / cycle,
    (openDuration + closeStay + closeDuration) / cycle,
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
          {/* 快门后面的内容 */}
          {children}

          {/* 快门叶片 */}
          {Array.from({ length: blades }, (_, i) => {
            const alpha = i * sector - 90
            // 顶点在外缘
            const tip = polar(cx, cy, radius, alpha)
            // 底边两端：在外缘、相邻顶点方向偏移 sector/2（构成指向中心的三角形）
            const baseA = polar(cx, cy, radius, alpha - sector / 2)
            const baseB = polar(cx, cy, radius, alpha + sector / 2)
            const pivotX = round4(tip.x)
            const pivotY = round4(tip.y)
            const points = `${round4(tip.x)},${round4(tip.y)} ${round4(baseA.x)},${round4(baseA.y)} ${round4(baseB.x)},${round4(baseB.y)}`
            // rotate values: 0（撤离）→ closeAngle（关闭/包裹）→ closeAngle（停留）→ 0（打开）→ 0（停留）
            const values = [
              `0 ${pivotX} ${pivotY}`,
              `${closeAngle} ${pivotX} ${pivotY}`,
              `${closeAngle} ${pivotX} ${pivotY}`,
              `0 ${pivotX} ${pivotY}`,
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
