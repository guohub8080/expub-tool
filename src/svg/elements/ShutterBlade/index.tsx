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
  DEFAULT_APERTURE,
} from "./types"

export type { I_ShutterBladeProps } from "./types"

const rad = (deg: number) => (deg * Math.PI) / 180
const round4 = (n: number) => Math.round(n * 10000) / 10000

/**
 * ShutterBlade — 相机快门叶片（光圈式收缩）
 *
 * 叶片形状：三角形，**一个角（顶点）指向中心**，底边在外缘。
 * - 顶点 tip_i 在距中心 aperture 处（圆孔半径），角度 α_i = i·(360/N) − 90。
 * - 底边两端 baseA/baseB 在外缘圆上，跨 2 个扇区（a±sector），相邻叶片重叠不留缝。
 *
 * N 片顶点围成半径 = aperture 的圆孔。每片沿「顶点→中心」方向平移 → 顶点向中心靠近
 * → 圆孔越来越小 → 最终闭合（顶点到中心，孔=0）。
 *
 * 时序（初始打开/露出）：收缩 → 闭合停留 → 张开 → 打开停留 → 循环。
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
  // 圆孔半径（打开态）：用户传正值用用户值，否则自动（对角线 * 0.6）
  const apertureResolved = defaultTo(props.aperture, DEFAULT_APERTURE)
  const aperture = apertureResolved > 0 ? apertureResolved : radius * 0.6

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
            // 顶点（角）：指向中心方向，距中心 aperture（圆孔边缘）
            const tip = {
              x: cx + aperture * Math.cos(rad(a)),
              y: cy + aperture * Math.sin(rad(a)),
            }
            // 底边两端：外缘，跨 2 扇区（a±sector），相邻重叠不留缝
            const baseA = {
              x: cx + radius * Math.cos(rad(a - sector)),
              y: cy + radius * Math.sin(rad(a - sector)),
            }
            const baseB = {
              x: cx + radius * Math.cos(rad(a + sector)),
              y: cy + radius * Math.sin(rad(a + sector)),
            }
            const points = `${round4(tip.x)},${round4(tip.y)} ${round4(baseA.x)},${round4(baseA.y)} ${round4(baseB.x)},${round4(baseB.y)}`
            // 收缩平移：顶点 → 中心（向量 = center − tip），平移量 = aperture（顶点到中心）
            const dx = round4(cx - tip.x)
            const dy = round4(cy - tip.y)
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
