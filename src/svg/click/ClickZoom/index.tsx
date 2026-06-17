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
 * 参考 参考实现 仿 iOS 桌面的 translate-off-screen 机制：
 * 放大层初始 translate(2000,0) 在画布外（不遮挡热区点击）。
 * 点击热区 → 放大层 translate 回 0,0 + scale 放大 + opacity 淡入。
 * 点击关闭区 → scale 缩回 + opacity 淡出 → translate 回 2000,0。
 *
 * 用 translate-off-screen 而非 visibility:hidden（后者会阻止 pointer-events）。
 */
const ClickZoom = (props: I_ClickZoomProps) => {
  const { canvasSize, background, items } = props
  const zoomScale = defaultTo(props.zoomScale, DEFAULT_ZOOM_SCALE)
  const duration = defaultTo(props.duration, DEFAULT_DURATION)
  const keySplines = defaultTo(props.keySplines, DEFAULT_KEY_SPLINES)
  const spacingResult = spacing(props.spacing)
  const isDev = ExPubGoConfig().mode === "development"
  const { w, h } = canvasSize
  const invScale = round4(1 / zoomScale)
  const closeDelay = duration // 关闭后延迟（等缩回再移走）

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

          {/* 底图 */}
          {isDefined(background) && (
            <Content url={background.url} jsx={background.jsx} w={w} h={h} />
          )}

          {/* 热区们 */}
          {items.map((item, i) => {
            const hsW = defaultTo(item.hotspotW, DEFAULT_HOTSPOT_W)
            const hsH = defaultTo(item.hotspotH, DEFAULT_HOTSPOT_H)
            const hotId = `cz-hot-${i}`
            const closeId = `cz-close-${i}`
            const hsX = round4(item.x - hsW / 2)
            const hsY = round4(item.y - hsH / 2)

            return (
              <g key={i}>
                {/* ===== 放大层：初始 translate(2000,0) 在画布外 ===== */}
                <g transform="translate(2000,0)">
                  {/* 进场：hotspot 点击 → translate 回 0,0（瞬间 discrete）*/}
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    begin={`${hotId}.click`}
                    values="2000 0;0 0;0 0"
                    keyTimes="0;0.0000001;1"
                    dur="100s"
                    fill="freeze"
                    calcMode="discrete"
                    restart="always"
                  />
                  {/* 退场：close 点击+延迟 → translate 回 2000,0 */}
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    begin={`${closeId}.click+${closeDelay}s`}
                    values="0 0;2000 0;2000 0"
                    keyTimes="0;0.0000001;1"
                    dur="100s"
                    fill="freeze"
                    calcMode="discrete"
                    restart="always"
                  />

                  {/* 内容：translate 到热区中心 → scale 围绕中心 */}
                  <g transform={`translate(${item.x} ${item.y})`}>
                    <g opacity={0}>
                      {/* scale 放大 */}
                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin={`${hotId}.click`}
                        values={`1;${zoomScale}`}
                        dur={`${duration}s`}
                        fill="freeze"
                        calcMode="spline"
                        keySplines={keySplines}
                        restart="always"
                      />
                      {/* scale 缩回 */}
                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin={`${closeId}.click`}
                        values={`${zoomScale};1`}
                        dur={`${duration}s`}
                        fill="freeze"
                        calcMode="spline"
                        keySplines={keySplines}
                        restart="always"
                      />
                      {/* opacity 淡入 */}
                      <animate
                        attributeName="opacity"
                        begin={`${hotId}.click`}
                        values="0;1"
                        dur="0.01s"
                        fill="freeze"
                        restart="always"
                      />
                      {/* opacity 淡出 */}
                      <animate
                        attributeName="opacity"
                        begin={`${closeId}.click`}
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

                      {/* 详情（反向缩放，在放大层内恢复原始大小） */}
                      <g transform={`scale(${invScale})`}>
                        <g transform={`translate(${-item.x * zoomScale} ${-item.y * zoomScale})`}>
                          <Content url={item.url} jsx={item.jsx} w={w} h={h} />
                        </g>
                      </g>

                      {/* 关闭点击区（覆盖全画布） */}
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
                </g>

                {/* ===== 热区缩略图（可见标注） ===== */}
                <g transform={`translate(${hsX} ${hsY})`}>
                  <Content
                    url={item.thumbnail?.url ?? item.url ?? undefined}
                    jsx={item.thumbnail?.jsx}
                    w={hsW}
                    h={hsH}
                  />
                </g>

                {/* ===== 热区点击区 ===== */}
                <rect
                  id={hotId}
                  x={hsX}
                  y={hsY}
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
