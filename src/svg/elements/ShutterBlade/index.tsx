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
} from "./types"

export type { I_ShutterBladeProps } from "./types"

const rad = (deg: number) => (deg * Math.PI) / 180
const round4 = (n: number) => Math.round(n * 10000) / 10000

/**
 * ShutterBlade — 相机快门叶片（直角三角形平移开合）
 *
 * 参考 Raycast 快门动画：N 片直角三角形，每片绕中心旋转 i·sector° 放置。
 *
 * 叶片形状（viewBox 坐标，pivot 在中心 cx,cy）：
 * - P1（pivot）：中心 (cx, cy) — 旋转放置的锚点。
 * - P2（直角顶点）：(cx − side, cy) — 距中心 side，正左方。
 * - P3（远端）：(cx − side, cy − side·tan(sector)) — 构成 sector° 扇角。
 *
 * 每片覆盖 sector° 的扇区，N 片拼合 = 360° 完全覆盖画布。
 *
 * 开合：每片沿本地坐标平移 (tan(sector/2)·side, −side) → 三角形整体外移、
 * 中心露出。由于每片旋转角度不同，平移方向各异 → 对称张开/合拢。
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
  // side = 外缘半径（对角线一半），确保叶片足够大覆盖画布
  const side = Math.hypot(canvasSize.w, canvasSize.h) / 2
  const sector = 360 / blades

  // 叶片三角形顶点（viewBox 坐标）
  const p1x = round4(cx)                    // pivot（中心）
  const p1y = round4(cy)
  const p2x = round4(cx - side)             // 直角顶点（左方）
  const p2y = round4(cy)
  const p3x = round4(cx - side)             // 远端（上方，tan(sector) 决定高度）
  const p3y = round4(cy - side * Math.tan(rad(sector)))
  const points = `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`

  // 打开时的平移量（本地坐标，每片相同；因旋转角度不同，全局方向各异）
  const openTx = round4(Math.tan(rad(sector / 2)) * side)
  const openTy = round4(-side)

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

          {Array.from({ length: blades }, (_, i) => (
            <g key={i} transform={`rotate(${i * sector} ${cx} ${cy})`}>
              <g>
                {transformTranslate({
                  initValue: { x: 0, y: 0 },
                  timeline: [
                    { toAbs: { x: 0, y: 0 }, durationSeconds: closeStay },
                    { toAbs: { x: openTx, y: openTy }, durationSeconds: openDuration },
                    { toAbs: { x: openTx, y: openTy }, durationSeconds: openStay },
                    { toAbs: { x: 0, y: 0 }, durationSeconds: closeDuration },
                  ],
                  begin: "0s",
                  calcMode: "linear",
                  isFreeze: true,
                  loopCount: 0,
                  isAdditive: false,
                  restart: "whenNotActive",
                })}
                <polygon
                  points={points}
                  fill={bladeFill}
                  stroke={bladeStroke}
                  strokeWidth={bladeStrokeWidth}
                />
              </g>
            </g>
          ))}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ShutterBlade
