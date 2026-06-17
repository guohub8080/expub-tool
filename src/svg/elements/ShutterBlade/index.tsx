import React from "react"
import defaultTo from "lodash/defaultTo"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { spacing } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import { transformRotate } from "@smil/animateTransform/rotate"
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
  DEFAULT_CLOSE_ANGLE,
} from "./types"

export type { I_ShutterBladeProps } from "./types"

const rad = (deg: number) => (deg * Math.PI) / 180
const round4 = (n: number) => Math.round(n * 10000) / 10000

/** 极坐标 → 直角坐标（相对中心 0,0） */
const polar = (r: number, angleDeg: number) => ({
  x: r * Math.cos(rad(angleDeg)),
  y: r * Math.sin(rad(angleDeg)),
})

/**
 * ShutterBlade — 相机快门叶片（光圈式旋转收缩）
 *
 * 机械光圈模型：N 片叶片，每片绕自己的**外缘枢轴**旋转（模拟连杆/凸轮驱动）。
 *
 * 叶片形状（标准位，中心相对坐标，叶片在顶部 φ=−90°）：
 * - V1（枢轴）：外缘，角度 −90−sector/2（扇区左边界）。叶片绕此点旋转。
 * - V2（外缘远端）：外缘，角度 −90+sector（跨入下一扇区，相邻重叠）。
 * - V3（内角）：距中心 R/2，角度 −90+sector/2（扇区中心方向）。
 *
 * N 片各旋转 i·sector 放置 → 围成中心圆孔（半径 ≈ R/2）。
 * 每片绕 V1 旋转 closeAngle（默认 sector/2）→ V3 扫向中心 → 圆孔收缩 → 闭合。
 *
 * z 序：blade 0 在底、blade N−1 在顶（DOM 顺序），形成 pinwheel 层叠。
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

  // 闭合旋转角度：默认 sector/2（内角扫向中心），用户可覆盖
  const closeAngleResolved = defaultTo(props.closeAngle, DEFAULT_CLOSE_ANGLE)
  const closeAngle = closeAngleResolved > 0 ? closeAngleResolved : sector / 2

  // 叶片三角形顶点（中心相对坐标，标准位 φ=−90° 顶部）
  const v1 = polar(radius, -90 - sector / 2)  // 枢轴：外缘左边界
  const v2 = polar(radius, -90 + sector * 1.5)   // 外缘远端：跨更多扇区（叶片更宽、重叠更多）
  const v3 = polar(radius * 0.5, -90 + sector / 2)  // 内角：距中心 R/2

  // viewBox 绝对坐标
  const pivotX = round4(cx + v1.x)
  const pivotY = round4(cy + v1.y)
  const points = [
    `${round4(cx + v1.x)},${round4(cy + v1.y)}`,
    `${round4(cx + v2.x)},${round4(cy + v2.y)}`,
    `${round4(cx + v3.x)},${round4(cy + v3.y)}`,
  ].join(" ")

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
                {transformRotate({
                  initValue: 0,
                  timeline: [
                    { toAbs: 0, durationSeconds: openStay },
                    { toAbs: closeAngle, durationSeconds: closeDuration },
                    { toAbs: closeAngle, durationSeconds: closeStay },
                    { toAbs: 0, durationSeconds: openDuration },
                  ],
                  pivot: [pivotX, pivotY],
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
