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
import type { ClickZoomItem, ClickZoomScale, I_ClickZoomProps } from "./types"
import {
  DEFAULT_ZOOM_SCALE,
  DEFAULT_DURATION,
  DEFAULT_KEY_SPLINES,
} from "./types"
import {
  buildOffScreenTranslate,
  buildZoomScaleOpacity,
  buildDetailOpacity,
  buildRectFlyOut,
  buildCounterTranslate,
} from "./timeline/animations"
import { computeGeometry } from "./utils/geometry"

export type { ClickZoomItem, ClickZoomScale, I_ClickZoomProps } from "./types"

const round4 = (n: number) => Math.round(n * 10000) / 10000

/** 详情内容：string = <image>；ReactNode = 直接渲染 */
const renderModalContent = (content: string | ReactNode, w: number, h: number): ReactNode => {
  if (React.isValidElement(content)) return content
  if (typeof content !== "string" || isNil(content)) return null
  return (
    <image href={content} x={0} y={0} width={w} height={h}
      preserveAspectRatio="xMidYMid slice" style={{ pointerEvents: "none" }} />
  )
}

/** 放大层背景（url 用 <image>，color 用 <rect>） */
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

/** 单个热区完整渲染 */
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
  const scaleInDuration = defaultTo(item.scale?.inDuration, duration)
  const scaleOutDuration = defaultTo(item.scale?.outDuration, duration)
  const scaleInSplines = defaultTo(item.scale?.inKeySplines, keySplines)
  const scaleOutSplines = defaultTo(item.scale?.outKeySplines, keySplines)

  return (
    <g>
      <g transform={`translate(${geo.centerX} ${geo.centerY})`}>

        {/* 放大层（scale + 主 opacity） */}
        <g opacity={0}>
          {buildZoomScaleOpacity(zoomScale, scaleInDuration, scaleOutDuration, scaleInSplines, scaleOutSplines)}
          {renderZoomBackground(canvasBg, geo, w, h)}

          {/* homeBg 副本（跟着 scale 放大） */}
          <g transform={`translate(${-geo.centerX} ${-geo.centerY})`} style={{ pointerEvents: "none" }}>
            {homeBg}
          </g>

          {/* 详情层（独立 opacity） */}
          <g opacity={0}>
            {buildDetailOpacity()}

            {/* 详情图（反缩放） */}
            <g transform={`scale(${invScale})`}>
              <g transform={`translate(${-geo.centerX} ${-geo.centerY})`}>
                {renderModalContent(item.modalContent, w, h)}
              </g>
            </g>

            {/* 点击区（counter + rect 飞出/飞回） */}
            <g transform={`translate(${-geo.centerX} ${-geo.centerY})`} opacity={0}>
              <g transform="translate(-2000,0)">
                {buildCounterTranslate(duration)}
                <g>
                  {buildRectFlyOut()}
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
    </g>
  )
}

/**
 * ClickZoom — 点击热区放大详情
 *
 * 5 个角色：画布层 / 共享 off-screen g / 放大层 / 详情层 / 点击区
 */
const ClickZoom = (props: I_ClickZoomProps) => {
  const { canvasSize, childItems } = props
  const homeBg = defaultTo(props.homeBg, null as ReactNode)
  const zoomScale = defaultTo(props.zoomScale, DEFAULT_ZOOM_SCALE)
  const duration = DEFAULT_DURATION
  const keySplines = DEFAULT_KEY_SPLINES
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

          {/* 画布层：canvasBg + homeBg */}
          <g>
            <foreignObject x={0} y={0} width={w} height={h}>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ ...resolveCanvasBg(props.canvasBg), width: "100%" }} />
            </foreignObject>
          </g>
          <g style={{ pointerEvents: "none" }}>
            {homeBg}
          </g>

          {/* 共享 off-screen g */}
          <g transform="translate(2000,0)">
            {buildOffScreenTranslate(duration)}

            {childItems.map((item, i) => {
              const geo = computeGeometry(item.thumbnail)

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
