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
import { transformTranslate, transformScaleRaw, animateOpacity, setVisibility } from "@smil/index"
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
 * ClickZoom — 点击热区放大详情（完全还原 参考实现 参考）
 *
 * 每个热区是一个完整的 6 层嵌套 g 子树：
 *
 * g(translate 2000,0)                    ← off-screen wrapper（放大层初始在画布外）
 *   translate in: begin="mouseover"      ← 移回画布
 *   translate out: begin="mouseout+D"    ← 移回画布外（D=duration 延迟）
 *   g(translate x,y)                     ← 定位到热区中心
 *     g(opacity 0)                       ← 放大层（scale + 主 opacity）
 *       scale in: begin="mouseover"
 *       scale out: begin="mouseout"
 *       opacity in: begin="mouseover"
 *       opacity out: begin="mouseout+D"
 *       底图 image
 *       g(opacity 0)                     ← 详情层（独立 opacity）
 *         detail opacity in: begin="mouseover"
 *         detail opacity out: begin="mouseout"
 *         g(scale 1/zoomScale)           ← 详情图（反缩放恢复原始大小）
 *           详情 image
 *         g(translate -x,-y, opacity 0)  ← 点击区 wrapper（visibility 控制）
 *           set hidden: begin="mouseover+1s"（放大后隐藏，防误触）
 *           set visible: begin="mouseout+D"（淡出后恢复）
 *           g(translate -2000,0)         ← counter-translate（保持 rect 在画布内）
 *             counter in: begin="mouseover"
 *             counter out: begin="mouseout+D"
 *             rect（透明点击区，pointer-events:all）
 *
 * 事件全部用 mouseover/mouseout（不用 id.click），跟参考一致。
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
  const dStr = duration.toString()

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

          {/* 热区们：每个 g 子树完全独立 */}
          {items.map((item, i) => {
            const hsW = defaultTo(item.hotspotW, DEFAULT_HOTSPOT_W)
            const hsH = defaultTo(item.hotspotH, DEFAULT_HOTSPOT_H)
            const hsX = round4(item.x - hsW / 2)
            const hsY = round4(item.y - hsH / 2)

            return (
              <g key={i}>
                {/* ===== 1. off-screen wrapper（translate 2000,0）===== */}
                <g transform="translate(2000,0)">
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
                  {transformTranslate({
                    initValue: { x: 0, y: 0 },
                    timeline: [{ toAbs: { x: 2000, y: 0 }, durationSeconds: 0.001 }],
                    begin: `mouseout+${dStr}s`,
                    calcMode: "discrete",
                    isFreeze: true,
                    loopCount: 0,
                    isAdditive: false,
                    restart: "always",
                  })}

                  {/* ===== 2. 定位到热区中心 ===== */}
                  <g transform={`translate(${item.x} ${item.y})`}>
                    {/* ===== 3. 放大层（scale + 主 opacity）===== */}
                    <g opacity={0}>
                      {transformScaleRaw({
                        initValue: 1,
                        timeline: [{ toAbs: zoomScale, durationSeconds: duration, keySplines }],
                        begin: "mouseover",
                        isFreeze: true,
                        loopCount: 0,
                        isAdditive: false,
                        restart: "always",
                      })}
                      {transformScaleRaw({
                        initValue: zoomScale,
                        timeline: [{ toAbs: 1, durationSeconds: duration, keySplines }],
                        begin: "mouseout",
                        isFreeze: true,
                        loopCount: 0,
                        isAdditive: false,
                        restart: "always",
                      })}
                      {animateOpacity({
                        initValue: 0,
                        timeline: [{ toAbs: 1, durationSeconds: 0.01 }],
                        begin: "mouseover",
                        isFreeze: true,
                        loopCount: 0,
                        restart: "always",
                      })}
                      {animateOpacity({
                        initValue: 1,
                        timeline: [{ toAbs: 0, durationSeconds: 0.01 }],
                        begin: `mouseout+${dStr}s`,
                        isFreeze: true,
                        loopCount: 0,
                        restart: "always",
                      })}

                      {/* 底图（偏移使热区中心对齐 origin） */}
                      {isDefined(background) && (
                        <g transform={`translate(${-item.x} ${-item.y})`} style={{ pointerEvents: "none" }}>
                          <Content url={background.url} jsx={background.jsx} w={w} h={h} />
                        </g>
                      )}

                      {/* ===== 4. 详情层（独立 opacity）===== */}
                      <g opacity={0}>
                        {animateOpacity({
                          initValue: 0,
                          timeline: [{ toAbs: 1, durationSeconds: 0.5 }],
                          begin: "mouseover",
                          isFreeze: true,
                          loopCount: 0,
                          restart: "always",
                        })}
                        {animateOpacity({
                          initValue: 1,
                          timeline: [{ toAbs: 0, durationSeconds: 0.5 }],
                          begin: "mouseout",
                          isFreeze: true,
                          loopCount: 0,
                          restart: "always",
                        })}

                        {/* 详情图（反缩放，在放大层内恢复原始大小） */}
                        <g transform={`scale(${invScale})`}>
                          <g transform={`translate(${-item.x * zoomScale} ${-item.y * zoomScale})`}>
                            <Content url={item.url} jsx={item.jsx} w={w} h={h} />
                          </g>
                        </g>

                        {/* ===== 5. 点击区 wrapper（visibility 控制）===== */}
                        <g transform={`translate(${-item.x} ${-item.y})`} opacity={0}>
                          {setVisibility({ to: "hidden", begin: "mouseover+1s", isFreeze: true, native: { restart: "always" as never } })}
                          {setVisibility({ to: "visible", begin: `mouseout+${dStr}s`, isFreeze: true, native: { restart: "always" as never } })}

                          {/* ===== 6. counter-translate（保持 rect 始终在画布内）===== */}
                          <g transform="translate(-2000,0)">
                            {transformTranslate({
                              initValue: { x: -2000, y: 0 },
                              timeline: [{ toAbs: { x: 0, y: 0 }, durationSeconds: 0.001 }],
                              begin: "mouseover",
                              calcMode: "discrete",
                              isFreeze: true,
                              loopCount: 0,
                              isAdditive: false,
                              restart: "always",
                            })}
                            {transformTranslate({
                              initValue: { x: 0, y: 0 },
                              timeline: [{ toAbs: { x: -2000, y: 0 }, durationSeconds: 0.001 }],
                              begin: `mouseout+${dStr}s`,
                              calcMode: "discrete",
                              isFreeze: true,
                              loopCount: 0,
                              isAdditive: false,
                              restart: "always",
                            })}

                            {/* 透明点击 rect */}
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
                        </g>
                      </g>
                    </g>
                  </g>
                </g>

                {/* ===== 热区缩略图（可见标注，始终在画布内）===== */}
                <g transform={`translate(${hsX} ${hsY})`}>
                  <Content
                    url={item.thumbnail?.url ?? item.url ?? undefined}
                    jsx={item.thumbnail?.jsx}
                    w={hsW}
                    h={hsH}
                  />
                </g>
              </g>
            )
          })}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ClickZoom
