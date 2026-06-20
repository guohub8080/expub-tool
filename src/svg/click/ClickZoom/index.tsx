import React, { type ReactNode } from "react"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import { spacing } from "@css-fn/spacing"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import type { T_SpacingProps } from "@css-fn/spacing"
import type { ClickZoomItem, ClickZoomScale, I_ClickZoomProps } from "./types"
import {
  DEFAULT_ZOOM_SCALE,
  DEFAULT_DURATION,
  DEFAULT_KEY_SPLINES,
} from "./types"
import { computeGeometry } from "./utils/geometry"
import {
  buildOffScreenTranslate,
  buildZoomScaleOpacity,
  buildDetailOpacity,
  buildRectFlyOut,
  buildCounterTranslate,
} from "./timeline/animations"

export type { ClickZoomItem, ClickZoomScale, I_ClickZoomProps } from "./types"

const round4 = (n: number) => Math.round(n * 10000) / 10000

/** 统一内容渲染：string = <image>；ReactNode = 直接渲染 */
const renderContent = (content: string | ReactNode, w: number, h: number): ReactNode => {
  if (typeof content === "string") {
    return (
      <image href={content} x={0} y={0} width={w} height={h}
        preserveAspectRatio="xMidYMid slice" style={{ pointerEvents: "none" }} />
    )
  }
  return content
}

/** 单个热区完整渲染 */
const HotspotSlot = ({
  item, geo, zoomScale, invScale, duration, keySplines, homeBg, w, h,
}: {
  item: ClickZoomItem
  geo: ReturnType<typeof computeGeometry>
  zoomScale: number
  invScale: number
  duration: number
  keySplines: string
  homeBg: ReactNode
  w: number
  h: number
}) => {
  const scaleInDuration = defaultTo(item.scale?.inDuration, duration)
  const scaleOutDuration = defaultTo(item.scale?.outDuration, duration)
  const scaleInSplines = defaultTo(item.scale?.inKeySplines, keySplines)
  const scaleOutSplines = defaultTo(item.scale?.outKeySplines, keySplines)
  const isScaleOne = zoomScale === 1
  const detailInner = (
    <g transform={`translate(${-geo.centerX} ${-geo.centerY})`}>
      {renderContent(item.modalContent, w, h)}
    </g>
  )

  return (
    <g>
      <g transform={`translate(${geo.centerX} ${geo.centerY})`}>

        {/* 放大层（scale + 主 opacity） */}
        <g opacity={0}>
          {buildZoomScaleOpacity(zoomScale, scaleInDuration, scaleOutDuration, scaleInSplines, scaleOutSplines)}

          {/* homeBg 副本（跟着 scale 放大，跟静态层同步）。scale=1 时与静态层重合，跳过节省 DOM */}
          {isScaleOne ? null : (
            <g transform={`translate(${-geo.centerX} ${-geo.centerY})`} style={{ pointerEvents: "none" }}>
              {homeBg}
            </g>
          )}

          {/* 详情层（独立 opacity） */}
          <g opacity={0}>
            {buildDetailOpacity()}

            {/* 详情图（反缩放）。scale=1 时 invScale=1，跳过外层 scale g */}
            {isScaleOne ? detailInner : <g transform={`scale(${invScale})`}>{detailInner}</g>}

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
 * 5 个角色：homeBg 静态层 / 共享 off-screen g / 放大层 / 详情层 / 点击区
 */
const ClickZoom = (props: I_ClickZoomProps) => {
  const { canvasSize, childItems, homeBg } = props
  const zoomScale = defaultTo(props.zoomScale, DEFAULT_ZOOM_SCALE)
  if (zoomScale < 1) {
    throw new Error(`[ClickZoom] zoomScale 必须 >= 1（当前 ${zoomScale}）`)
  }
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

          {/* homeBg 静态层（始终可见，pointer-events:none 防干扰） */}
          <g style={{ pointerEvents: "none" }}>
            {renderContent(homeBg, w, h)}
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
