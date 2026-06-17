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
import { transformTranslate, transformScaleRaw, animateOpacity, animateVisibility } from "@smil/index"
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
 * ClickZoom — 点击热区放大详情
 *
 * 严格参考 参考实现 仿 iOS 桌面的 mouseover/mouseout 机制：
 * - mouseover（按下）→ 放大层从画布外 translate 回来 + scale 放大 + opacity 淡入
 * - mouseout（松开）→ scale 缩回 + 延迟后 opacity 淡出 + translate 回画布外
 * - 热区透明 rect 始终在画布内可点击（pointer-events: all）
 *
 * 全程用 SMIL 工具函数，begin 用 "mouseover"/"mouseout"，不用 id.click。
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

          {/* 热区们：每个 g 子树独立，mouseover/mouseout 不串扰 */}
          {items.map((item, i) => {
            const hsW = defaultTo(item.hotspotW, DEFAULT_HOTSPOT_W)
            const hsH = defaultTo(item.hotspotH, DEFAULT_HOTSPOT_H)
            const hsX = round4(item.x - hsW / 2)
            const hsY = round4(item.y - hsH / 2)

            return (
              <g key={i}>
                {/* ===== 放大层：初始 translate(2000,0) 在画布外 ===== */}
                <g transform="translate(2000,0)">
                  {/* mouseover → translate 回 0,0（discrete 瞬间）*/}
                  {transformTranslate({
                    initValue: { x: 2000, y: 0 },
                    timeline: [{ toAbs: { x: 0, y: 0 }, durationSeconds: 0.001 }],
                    begin: "mouseover",
                    calcMode: "discrete",
                    isFreeze: true,
                    loopCount: 0,
                    isAdditive: false,
                    restart: "always",
                  })}
                  {/* mouseout+延迟 → translate 回 2000,0 */}
                  {transformTranslate({
                    initValue: { x: 0, y: 0 },
                    timeline: [{ toAbs: { x: 2000, y: 0 }, durationSeconds: 0.001 }],
                    begin: `mouseout+${duration}s`,
                    calcMode: "discrete",
                    isFreeze: true,
                    loopCount: 0,
                    isAdditive: false,
                    restart: "always",
                  })}

                  {/* 内容：translate 到热区中心 → scale 围绕中心 */}
                  <g transform={`translate(${item.x} ${item.y})`}>
                    <g opacity={0}>
                      {/* scale 放大（mouseover）*/}
                      {transformScaleRaw({
                        initValue: 1,
                        timeline: [{ toAbs: zoomScale, durationSeconds: duration, keySplines }],
                        begin: "mouseover",
                        isFreeze: true,
                        loopCount: 0,
                        isAdditive: false,
                        restart: "always",
                      })}
                      {/* scale 缩回（mouseout）*/}
                      {transformScaleRaw({
                        initValue: zoomScale,
                        timeline: [{ toAbs: 1, durationSeconds: duration, keySplines }],
                        begin: "mouseout",
                        isFreeze: true,
                        loopCount: 0,
                        isAdditive: false,
                        restart: "always",
                      })}
                      {/* opacity 淡入（mouseover，瞬间）*/}
                      {animateOpacity({
                        initValue: 0,
                        timeline: [{ toAbs: 1, durationSeconds: 0.01 }],
                        begin: "mouseover",
                        isFreeze: true,
                        loopCount: 0,
                        restart: "always",
                      })}
                      {/* opacity 淡出（mouseout+延迟）*/}
                      {animateOpacity({
                        initValue: 1,
                        timeline: [{ toAbs: 0, durationSeconds: 0.01 }],
                        begin: `mouseout+${duration}s`,
                        isFreeze: true,
                        loopCount: 0,
                        restart: "always",
                      })}

                      {/* 底图（偏移使热区中心对齐 origin） */}
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

                {/* ===== 热区点击区（始终在画布内，pointer-events: all） ===== */}
                <rect
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
