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
    <foreignObject x={0} y={0} width={w} height={h} style={{ pointerEvents: "none" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ backgroundImage: svgURL(url), backgroundSize: "cover", backgroundPosition: "50% 50%", width: "100%", pointerEvents: "none" }} />
    </foreignObject>
  )
}

/**
 * ClickZoom — 点击热区放大详情（精确还原 参考实现 参考）
 *
 * 关键：所有动画 loopCount=1（播放一次 + freeze 保持，不循环）。
 * 参考用 values="A;B;B" keyTimes="0;ε;1" dur="长" 三点格式：动画段 + 保持段。
 * 用 2-segment timeline 匹配（seg1=动画, seg2=长保持）。
 *
 * 每个热区 6 层嵌套 g：
 * off-screen(translate 2000,0) → 定位(x,y) → 放大层(scale+opacity) → 底图 + 详情层(opacity) → 详情图(scale) + 点击区(visibility) → counter-translate(-2000,0) → rect
 */
const ClickZoom = (props: I_ClickZoomProps) => {
  const { canvasSize, items, children } = props
  const zoomScale = defaultTo(props.zoomScale, DEFAULT_ZOOM_SCALE)
  const duration = defaultTo(props.duration, DEFAULT_DURATION)
  const keySplines = defaultTo(props.keySplines, DEFAULT_KEY_SPLINES)
  const spacingResult = spacing(props.spacing)
  const isDev = ExPubGoConfig().mode === "development"
  const { w, h } = canvasSize
  const invScale = round4(1 / zoomScale)
  const holdSplines = "0 0 1 1"

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
          {/* 画布背景（canvasBg.url 同时作为放大底图） */}
          <g>
            <foreignObject x={0} y={0} width={w} height={h}>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ ...resolveCanvasBg(props.canvasBg), width: "100%" }} />
            </foreignObject>
          </g>

          {/* 画布前景（children，mouseover 时隐藏避免重影，mouseout+延迟 后恢复） */}
          {isDefined(children) && (
            <g>
              {animateOpacity({
                initValue: 1,
                timeline: [
                  { toAbs: 0, durationSeconds: 0.005 },
                  { toAbs: 0, durationSeconds: 99.995 },
                ],
                begin: "mouseover",
                isFreeze: true,
                loopCount: 1,
                restart: "always",
              })}
              {animateOpacity({
                initValue: 0,
                timeline: [
                  { toAbs: 1, durationSeconds: 0.005 },
                  { toAbs: 1, durationSeconds: 99.995 },
                ],
                begin: `mouseout+${duration}s`,
                isFreeze: true,
                loopCount: 1,
                restart: "always",
              })}
              {children}
            </g>
          )}

          {items.map((item, i) => {
            const hsW = defaultTo(item.hotspotW, DEFAULT_HOTSPOT_W)
            const hsH = defaultTo(item.hotspotH, DEFAULT_HOTSPOT_H)
            const hsX = round4(item.x - hsW / 2)
            const hsY = round4(item.y - hsH / 2)

            return (
              <g key={i}>
                {/* ===== 1. off-screen wrapper ===== */}
                <g transform="translate(2000,0)">
                  {/* in: mouseover → 2000,0 → 0,0（discrete 瞬间 + 保持 100s）*/}
                  {transformTranslate({
                    initValue: { x: 2000, y: 0 },
                    timeline: [
                      { toAbs: { x: 0, y: 0 }, durationSeconds: 0.0001 },
                      { toAbs: { x: 0, y: 0 }, durationSeconds: 99.9999 },
                    ],
                    begin: "mouseover",
                    calcMode: "discrete",
                    isFreeze: true,
                    loopCount: 1,
                    isAdditive: false,
                    restart: "always",
                  })}
                  {/* out: mouseout+D → 0,0 → 2000,0 */}
                  {transformTranslate({
                    initValue: { x: 0, y: 0 },
                    timeline: [
                      { toAbs: { x: 2000, y: 0 }, durationSeconds: 0.0001 },
                      { toAbs: { x: 2000, y: 0 }, durationSeconds: 99.9999 },
                    ],
                    begin: `mouseout+${duration}s`,
                    calcMode: "discrete",
                    isFreeze: true,
                    loopCount: 1,
                    isAdditive: false,
                    restart: "always",
                  })}

                  {/* ===== 2. 定位到热区中心 ===== */}
                  <g transform={`translate(${item.x} ${item.y})`}>
                    {/* ===== 3. 放大层（scale + 主 opacity）===== */}
                    <g opacity={0}>
                      {/* scale in: 1→4, spline ease-out */}
                      {transformScaleRaw({
                        initValue: 1,
                        timeline: [
                          { toAbs: zoomScale, durationSeconds: duration, keySplines },
                          { toAbs: zoomScale, durationSeconds: 200 - duration, keySplines: holdSplines },
                        ],
                        begin: "mouseover",
                        isFreeze: true,
                        loopCount: 1,
                        isAdditive: false,
                        restart: "always",
                      })}
                      {/* scale out: 4→1 */}
                      {transformScaleRaw({
                        initValue: zoomScale,
                        timeline: [
                          { toAbs: 1, durationSeconds: duration, keySplines },
                          { toAbs: 1, durationSeconds: 200 - duration, keySplines: holdSplines },
                        ],
                        begin: "mouseout",
                        isFreeze: true,
                        loopCount: 1,
                        isAdditive: false,
                        restart: "always",
                      })}
                      {/* opacity in: 0→1（瞬间 + 保持）*/}
                      {animateOpacity({
                        initValue: 0,
                        timeline: [
                          { toAbs: 1, durationSeconds: 0.005 },
                          { toAbs: 1, durationSeconds: 0.995 },
                        ],
                        begin: "mouseover",
                        isFreeze: true,
                        loopCount: 1,
                        restart: "always",
                      })}
                      {/* opacity out: 1→0（mouse+延迟）*/}
                      {animateOpacity({
                        initValue: 1,
                        timeline: [
                          { toAbs: 0, durationSeconds: 0.005 },
                          { toAbs: 0, durationSeconds: 0.995 },
                        ],
                        begin: `mouseout+${duration}s`,
                        isFreeze: true,
                        loopCount: 1,
                        restart: "always",
                      })}

                      {/* 底图（canvasBg.url，放大该区域 = 放大镜效果） */}
                      {isDefined(props.canvasBg?.url) && (
                        <g transform={`translate(${-item.x} ${-item.y})`} style={{ pointerEvents: "none" }}>
                          <Content url={props.canvasBg!.url} w={w} h={h} />
                        </g>
                      )}

                      {/* children 副本（跟着 scale 放大，pointer-events:none 防干扰） */}
                      {isDefined(children) && (
                        <g transform={`translate(${-item.x} ${-item.y})`} style={{ pointerEvents: "none" }}>
                          {children}
                        </g>
                      )}

                      {/* ===== 4. 详情层（独立 opacity）===== */}
                      <g opacity={0}>
                        {/* detail opacity in: mouseover */}
                        {animateOpacity({
                          initValue: 0,
                          timeline: [
                            { toAbs: 1, durationSeconds: 0.5 },
                            { toAbs: 1, durationSeconds: 99.5 },
                          ],
                          begin: "mouseover",
                          isFreeze: true,
                          loopCount: 1,
                          restart: "always",
                        })}
                        {/* detail opacity out: mouseout */}
                        {animateOpacity({
                          initValue: 1,
                          timeline: [
                            { toAbs: 0, durationSeconds: 0.5 },
                            { toAbs: 0, durationSeconds: 99.5 },
                          ],
                          begin: "mouseout",
                          isFreeze: true,
                          loopCount: 1,
                          restart: "always",
                        })}

                        {/* 详情图（反缩放 scale(1/zoomScale)），偏移和底图一致（不乘 zoomScale） */}
                        <g transform={`scale(${invScale})`}>
                          <g transform={`translate(${-item.x} ${-item.y})`}>
                            <Content url={item.url} jsx={item.jsx} w={w} h={h} />
                          </g>
                        </g>

                        {/* ===== 5. 点击区 wrapper（visibility 控制）===== */}
                        <g transform={`translate(${-item.x} ${-item.y})`} opacity={0}>
                          {setVisibility({ to: "hidden", begin: "mouseover+1s", isFreeze: true, native: { from: "visible", dur: "0.01s", restart: "always" as never } })}
                          {setVisibility({ to: "visible", begin: `mouseout+${duration}s`, isFreeze: true, native: { from: "hidden", dur: "0.01s", restart: "always" as never } })}

                          {/* ===== 6. counter-translate ===== */}
                          <g transform="translate(-2000,0)">
                            {/* counter in: mouseover → -2000→0 */}
                            {transformTranslate({
                              initValue: { x: -2000, y: 0 },
                              timeline: [
                                { toAbs: { x: 0, y: 0 }, durationSeconds: 0.0001 },
                                { toAbs: { x: 0, y: 0 }, durationSeconds: 99.9999 },
                              ],
                              begin: "mouseover",
                              calcMode: "discrete",
                              isFreeze: true,
                              loopCount: 1,
                              isAdditive: false,
                              restart: "always",
                            })}
                            {/* counter out: mouseout+D → 0→-2000 */}
                            {transformTranslate({
                              initValue: { x: 0, y: 0 },
                              timeline: [
                                { toAbs: { x: -2000, y: 0 }, durationSeconds: 0.0001 },
                                { toAbs: { x: -2000, y: 0 }, durationSeconds: 99.9999 },
                              ],
                              begin: `mouseout+${duration}s`,
                              calcMode: "discrete",
                              isFreeze: true,
                              loopCount: 1,
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
              </g>
            )
          })}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ClickZoom
