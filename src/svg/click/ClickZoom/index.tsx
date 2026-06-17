import React, { type ReactNode } from "react"
import defaultTo from "lodash/defaultTo"
import isNil from "lodash/isNil"
import { isDefined } from "@utils/fn/isDefined"
import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import svgURL from "@utils/svg/svgURL"
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

export type { ClickZoomItem, I_ClickZoomProps } from "./types"

const round4 = (n: number) => Math.round(n * 10000) / 10000

/** 渲染图片或 jsx 内容（foreignObject 包裹） */
const Content = ({ url, jsx, w, h }: { url?: string; jsx?: ReactNode; w: number; h: number }) => {
  if (isDefined(jsx)) return <>{jsx}</>
  if (isNil(url)) return null
  return (
    <foreignObject x={0} y={0} width={w} height={h}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ backgroundImage: svgURL(url), backgroundSize: "cover", backgroundPosition: "50% 50%", width: "100%" }} />
    </foreignObject>
  )
}

/**
 * ClickZoom — 点击热区放大详情（toggle 式）
 *
 * 点击热区 → 从热区中心放大 zoomScale 倍 + 淡入详情 → 再点击 → 缩回 + 淡出。
 * 底图也跟着放大（放大镜效果），详情内容叠加在上层。
 *
 * SMIL toggle 机制：
 * - 热区 rect（id=cz-hot-N）：click → 触发放大动画 + visibility=visible
 * - 关闭 rect（id=cz-close-N）：click → 触发缩小动画 + 延迟 visibility=hidden
 * - restart="always" 允许无限次 toggle
 */
const ClickZoom = (props: I_ClickZoomProps) => {
  const { canvasSize, background, items } = props
  const zoomScale = defaultTo(props.zoomScale, DEFAULT_ZOOM_SCALE)
  const duration = defaultTo(props.duration, DEFAULT_DURATION)
  const keySplines = defaultTo(props.keySplines, DEFAULT_KEY_SPLINES)
  const spacingResult = spacing(props.spacing)
  const isDev = ExPubGoConfig().mode === "development"
  const { w, h } = canvasSize

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
          {/* 画布背景 */}
          <g>
            <foreignObject x={0} y={0} width={w} height={h}>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ ...resolveCanvasBg(props.canvasBg), width: "100%" }} />
            </foreignObject>
          </g>

          {/* 底图（始终可见） */}
          {isDefined(background) && (
            <Content url={background.url} jsx={background.jsx} w={w} h={h} />
          )}

          {/* 热区们 */}
          {items.map((item, i) => {
            const hsW = defaultTo(item.hotspotW, DEFAULT_HOTSPOT_W)
            const hsH = defaultTo(item.hotspotH, DEFAULT_HOTSPOT_H)
            const hotId = `cz-hot-${i}`
            const closeId = `cz-close-${i}`
            const invScale = round4(1 / zoomScale)
            // 关闭动画 begin（延迟 duration 秒，等缩回再淡出+隐藏）
            const closeBegin = `${closeId}.click`
            const closeDelay = `${closeId}.click+${duration}s`

            return (
              <g key={i}>
                {/* 放大层：translate 到热区中心 → scale 围绕中心放大 */}
                <g transform={`translate(${item.x} ${item.y})`}>
                  <g style={{ visibility: "hidden", opacity: 0 }}>
                    {/* toggle visibility */}
                    <set attributeName="visibility" to="visible" begin={hotId + ".click"} dur="0.01s" fill="freeze" restart="always" />
                    <set attributeName="visibility" to="hidden" begin={closeDelay} dur="0.01s" fill="freeze" restart="always" />

                    {/* scale 放大（点击热区时） */}
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      begin={hotId + ".click"}
                      values={`1;${zoomScale}`}
                      dur={`${duration}s`}
                      fill="freeze"
                      calcMode="spline"
                      keySplines={keySplines}
                      restart="always"
                    />
                    {/* scale 缩回（点击关闭时） */}
                    <animateTransform
                      attributeName="transform"
                      type="scale"
                      begin={closeBegin}
                      values={`${zoomScale};1`}
                      dur={`${duration}s`}
                      fill="freeze"
                      calcMode="spline"
                      keySplines={keySplines}
                      restart="always"
                    />

                    {/* opacity 淡入（点击热区时，瞬间） */}
                    <animate
                      attributeName="opacity"
                      begin={hotId + ".click"}
                      values="0;1"
                      dur="0.01s"
                      fill="freeze"
                      restart="always"
                    />
                    {/* opacity 淡出（缩回后，延迟 duration 秒） */}
                    <animate
                      attributeName="opacity"
                      begin={closeDelay}
                      values="1;0"
                      dur="0.01s"
                      fill="freeze"
                      restart="always"
                    />

                    {/* 底图（偏移使热区中心对齐 origin → 放大该区域） */}
                    {isDefined(background) && (
                      <g transform={`translate(${-item.x} ${-item.y})`}>
                        <Content url={background.url} jsx={background.jsx} w={w} h={h} />
                      </g>
                    )}

                    {/* 详情内容（反向缩放，在放大层内恢复原始大小） */}
                    <g transform={`scale(${invScale})`}>
                      <g transform={`translate(${-item.x * zoomScale} ${-item.y * zoomScale})`}>
                        <Content url={item.url} jsx={item.jsx} w={w} h={h} />
                      </g>
                    </g>

                    {/* 关闭点击区（覆盖整个画布，偏移回 viewBox 坐标） */}
                    <g transform={`translate(${-item.x} ${-item.y})`}>
                      <rect
                        id={closeId}
                        x={0}
                        y={0}
                        width={w}
                        height={h}
                        fill="transparent"
                        opacity={0.001}
                        style={{ pointerEvents: "all" }}
                      />
                    </g>
                  </g>
                </g>

                {/* 热区缩略图（可见标注：让用户看到哪里可以点） */}
                <g transform={`translate(${round4(item.x - hsW / 2)} ${round4(item.y - hsH / 2)})`}>
                  <Content
                    url={item.thumbnail?.url ?? item.url ?? undefined}
                    jsx={item.thumbnail?.jsx}
                    w={hsW}
                    h={hsH}
                  />
                </g>

                {/* 热区点击区域（viewBox 坐标，始终可点击） */}
                <rect
                  id={hotId}
                  x={round4(item.x - hsW / 2)}
                  y={round4(item.y - hsH / 2)}
                  width={hsW}
                  height={hsH}
                  fill="transparent"
                  opacity={0.001}
                  style={{ pointerEvents: "all" }}
                />
              </g>
            )
          })}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ClickZoom
