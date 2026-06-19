import React, { type ReactNode } from "react"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { resolveCanvasBg } from "@utils/svg/resolveCanvasBg"
import { spacing } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import type { I_CanvasBg } from "@svg/types"
import type { T_SpacingProps } from "@css-fn/spacing"
import type { ClickZoomItem, I_ClickZoomProps } from "./types"
import {
  DEFAULT_ZOOM_SCALE,
  DEFAULT_DURATION,
  DEFAULT_KEY_SPLINES,
  DEFAULT_HOTSPOT_W,
  DEFAULT_HOTSPOT_H,
} from "./types"
import { computeGeometry } from "./utils/geometry"
import {
  buildOffScreenTranslate,
  buildZoomScaleOpacity,
  buildDetailOpacity,
  buildClickVisibility,
  buildCounterTranslate,
} from "./timeline/animations"

export type { ClickZoomItem, I_ClickZoomProps } from "./types"

const round4 = (n: number) => Math.round(n * 10000) / 10000

/** 详情内容：jsx 直接返回；url 用 <image>（跟参考一致，不用 foreignObject） */
const renderDetailContent = (item: ClickZoomItem, w: number, h: number): ReactNode => {
  if (isDefined(item.jsx)) return item.jsx
  if (isNil(item.url)) return null
  return (
    <image href={item.url} x={0} y={0} width={w} height={h}
      preserveAspectRatio="xMidYMid slice" style={{ pointerEvents: "none" }} />
  )
}

/**
 * 放大层内的背景覆盖（完全覆盖画布，防止原位背景透过）。
 *
 * url：放大底图（放大镜效果），<image> scale 下正确缩放。
 * color：纯色 <rect>，scale 下正确覆盖。
 */
const renderZoomBackground = (
  canvasBg: I_CanvasBg | undefined,
  geo: { centerX: number; centerY: number },
  w: number,
  h: number,
): ReactNode => {
  if (isDefined(canvasBg?.url)) {
    return (
      <image href={canvasBg!.url}
        x={-geo.centerX} y={-geo.centerY}
        width={w} height={h}
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: "none" }}
      />
    )
  }
  if (isDefined(canvasBg?.color)) {
    return (
      <rect x={-geo.centerX} y={-geo.centerY}
        width={w} height={h}
        fill={canvasBg!.color}
        style={{ pointerEvents: "none" }}
      />
    )
  }
  return null
}

/**
 * 单个热区的完整渲染（放大层 + 详情层 + 点击区）
 */
const HotspotSlot = ({
  item, geo, zoomScale, invScale, duration, keySplines, canvasBg, homeBg, w, h,
}: {
  item: ClickZoomItem
  geo: ReturnType<typeof computeGeometry>
  zoomScale: number
  invScale: number
  duration: number
  keySplines: string
  canvasBg: I_CanvasBg | undefined
  homeBg: ReactNode
  w: number
  h: number
}) => {
  // per-item scale 配置，缺省用组件级
  const scaleInDuration = defaultTo(item.scale?.inDuration, duration)
  const scaleOutDuration = defaultTo(item.scale?.outDuration, duration)
  const scaleInSplines = defaultTo(item.scale?.inKeySplines, keySplines)
  const scaleOutSplines = defaultTo(item.scale?.outKeySplines, keySplines)

  return (
  <g>
    {/* 定位到热区中心 */}
    <g transform={`translate(${geo.centerX} ${geo.centerY})`}>

      {/* ===== ③ 放大层（scale + 主 opacity）===== */}
      <g opacity={0}>
        {buildZoomScaleOpacity(zoomScale, scaleInDuration, scaleOutDuration, scaleInSplines, scaleOutSplines)}

        {/* 放大背景（覆盖画布） */}
        {renderZoomBackground(canvasBg, geo, w, h)}

        {/* homeBg 副本（跟着 scale 放大，跟静态层同一个 jsx → SMIL 自动同步） */}
        <g transform={`translate(${-geo.centerX} ${-geo.centerY})`} style={{ pointerEvents: "none" }}>
          {homeBg}
        </g>

        {/* ===== ④ 详情层（独立 opacity）===== */}
        <g opacity={0}>
          {buildDetailOpacity(duration)}

          {/* 详情图（反缩放，放大层内恢复原始大小） */}
          <g transform={`scale(${invScale})`}>
            <g transform={`translate(${-geo.centerX} ${-geo.centerY})`}>
              {renderDetailContent(item, w, h)}
            </g>
          </g>

          {/* ===== ⑤ 点击区（visibility + counter + rect）===== */}
          <g transform={`translate(${-geo.centerX} ${-geo.centerY})`} opacity={0}>
            {/* visibility 控制在 click-wrapper g 内 */}
            {buildClickVisibility(duration)}

            {/* counter-translate 动画必须在 counter g 内（不是 click-wrapper g） */}
            <g transform="translate(-2000,0)">
              {buildCounterTranslate(duration)}
              <rect
                x={geo.rectX} y={geo.rectY}
                width={geo.rectW} height={geo.rectH}
                fill="transparent" opacity={0.001}
                style={{ pointerEvents: "all" }}
              />
            </g>
          </g>
        </g>
      </g>
    </g>
  </g>
  )
}

/**
 * ClickZoom — 点击热区放大详情（严格还原 参考实现 参考）
 *
 * 5 个角色分离（按 COMPONENT_SPLIT_GUIDE.md 规范）：
 * ① 画布层（canvasBg + homeBg 静态）→ 始终可见
 * ② 共享 off-screen g → 所有热区放大内容进出开关
 * ③ 放大层（scale+opacity）→ canvasBg 底图 + homeBg 副本（跟着放大）
 * ④ 详情层（独立 opacity）→ 详情内容叠加
 * ⑤ 点击区（visibility+counter）→ 透明 rect，触发 mouseover/mouseout
 *
 * 文件拆分：
 * - utils/geometry.ts → 位置计算
 * - timeline/animations.ts → 动画时间线构建（放大/缩小/淡入/淡出/进出）
 * - index.tsx → 读 props → 调用计算 → 组装 JSX
 */
const ClickZoom = (props: I_ClickZoomProps) => {
  const { canvasSize, items } = props
  const homeBg = defaultTo(props.homeBg, null as ReactNode)
  const zoomScale = defaultTo(props.zoomScale, DEFAULT_ZOOM_SCALE)
  const duration = defaultTo(props.duration, DEFAULT_DURATION)
  const keySplines = defaultTo(props.keySplines, DEFAULT_KEY_SPLINES)
  const spacingResult = spacing(props.spacing)
  const isDev = ExPubGoConfig().mode === "development"
  const { w, h } = canvasSize
  const invScale = round4(1 / zoomScale)

  return (
    <SectionEx
      {...(isDev ? { "expubgo-label": "click-zoom" } : {})}
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
        <SvgEx viewBox={`0 0 ${w} ${h}`} style={{ display: "block", width: "100%" }}>

          {/* ===== ① 画布层：canvasBg（简单背景）+ homeBg（复杂背景，始终可见）===== */}
          <g>
            <foreignObject x={0} y={0} width={w} height={h}>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ ...resolveCanvasBg(props.canvasBg), width: "100%" }} />
            </foreignObject>
          </g>
          <g style={{ pointerEvents: "none" }}>
            {homeBg}
          </g>

          {/* ===== ② 共享 off-screen g（所有热区共用）===== */}
          <g transform="translate(2000,0)">
            {buildOffScreenTranslate(duration)}

            {items.map((item, i) => {
              const hsW = defaultTo(item.hotspotW, DEFAULT_HOTSPOT_W)
              const hsH = defaultTo(item.hotspotH, DEFAULT_HOTSPOT_H)
              const geo = computeGeometry({ x: item.x, y: item.y, hotspotW: hsW, hotspotH: hsH })

              return (
                <HotspotSlot
                  key={i}
                  item={item}
                  geo={geo}
                  zoomScale={zoomScale}
                  invScale={invScale}
                  duration={duration}
                  keySplines={keySplines}
                  canvasBg={props.canvasBg}
                  homeBg={homeBg}
                  w={w}
                  h={h}
                />
              )
            })}
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ClickZoom
