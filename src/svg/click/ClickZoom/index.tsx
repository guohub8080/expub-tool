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

/** 详情内容渲染：jsx 直接返回；url 用 <image>（跟参考一致，不用 foreignObject） */
const DetailContent = ({ url, jsx, w, h }: { url?: string; jsx?: ReactNode; w: number; h: number }) => {
  if (isDefined(jsx)) return <>{jsx}</>
  if (isNil(url)) return null
  return (
    <image
      href={url}
      x={0}
      y={0}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid slice"
      style={{ pointerEvents: "none" }}
    />
  )
}

/**
 * ClickZoom — 点击热区放大详情（严格还原 参考实现 参考）
 *
 * 时序固定 1s（跟参考一致），duration 仅控制 scale 动画速度。
 * 所有延迟用固定 1s（visibility hidden/restore、translate/counter out）。
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
          {/* 画布背景 */}
          <g>
            <foreignObject x={0} y={0} width={w} height={h}>
              <svg viewBox={`0 0 ${w} ${h}`} style={{ ...resolveCanvasBg(props.canvasBg), width: "100%" }} />
            </foreignObject>
          </g>

          {/* 画布前景（children） */}
          {children}

          {/* ===== 共享 off-screen g（所有热区共用，跟参考一致）===== */}
          <g transform="translate(2000,0)">
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
            {transformTranslate({
              initValue: { x: 0, y: 0 },
              timeline: [
                { toAbs: { x: 2000, y: 0 }, durationSeconds: 0.0001 },
                { toAbs: { x: 2000, y: 0 }, durationSeconds: 99.9999 },
              ],
              begin: "mouseout+1s",
              calcMode: "discrete",
              isFreeze: true,
              loopCount: 1,
              isAdditive: false,
              restart: "always",
            })}

            {items.map((item, i) => {
              const hsW = defaultTo(item.hotspotW, DEFAULT_HOTSPOT_W)
              const hsH = defaultTo(item.hotspotH, DEFAULT_HOTSPOT_H)
              const hsX = round4(item.x - hsW / 2)
              const hsY = round4(item.y - hsH / 2)

              return (
                <g key={i}>
                  <g transform={`translate(${item.x} ${item.y})`}>
                    {/* ===== 放大层（scale + 主 opacity）===== */}
                    <g opacity={0}>
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
                      {animateOpacity({
                        initValue: 1,
                        timeline: [
                          { toAbs: 0, durationSeconds: 0.005 },
                          { toAbs: 0, durationSeconds: 0.995 },
                        ],
                        begin: "mouseout+1s",
                        isFreeze: true,
                        loopCount: 1,
                        restart: "always",
                      })}

                      {/* 底图（放大镜效果），用 <image> 不用 foreignObject */}
                      {isDefined(props.canvasBg?.url) && (
                        <image
                          href={props.canvasBg!.url}
                          x={-item.x}
                          y={-item.y}
                          width={w}
                          height={h}
                          preserveAspectRatio="xMidYMid slice"
                          style={{ pointerEvents: "none" }}
                        />
                      )}

                      {/* ===== 详情层（独立 opacity）===== */}
                      <g opacity={0}>
                        {animateOpacity({
                          initValue: 0,
                          timeline: [
                            { toAbs: 1, durationSeconds: 0.005 },
                            { toAbs: 1, durationSeconds: 99.995 },
                          ],
                          begin: "mouseover",
                          isFreeze: true,
                          loopCount: 1,
                          restart: "always",
                        })}
                        {animateOpacity({
                          initValue: 1,
                          timeline: [
                            { toAbs: 0, durationSeconds: 0.005 },
                            { toAbs: 0, durationSeconds: 99.995 },
                          ],
                          begin: "mouseout",
                          isFreeze: true,
                          loopCount: 1,
                          restart: "always",
                        })}

                        {/* 详情图 */}
                        <g transform={`scale(${invScale})`}>
                          <g transform={`translate(${-item.x} ${-item.y})`}>
                            <DetailContent url={item.url} jsx={item.jsx} w={w} h={h} />
                          </g>
                        </g>

                        {/* ===== 点击区 wrapper ===== */}
                        <g transform={`translate(${-item.x} ${-item.y})`} opacity={0}>
                          {setVisibility({ to: "hidden", begin: "mouseover+1s", isFreeze: true, native: { from: "visible", dur: "0.01s", restart: "always" as never } })}
                          {setVisibility({ to: "visible", begin: "mouseout+1s", isFreeze: true, native: { from: "hidden", dur: "0.01s", restart: "always" as never } })}

                          {/* ===== counter-translate ===== */}
                          <g transform="translate(-2000,0)">
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
                            {transformTranslate({
                              initValue: { x: 0, y: 0 },
                              timeline: [
                                { toAbs: { x: -2000, y: 0 }, durationSeconds: 0.0001 },
                                { toAbs: { x: -2000, y: 0 }, durationSeconds: 99.9999 },
                              ],
                              begin: "mouseout+1s",
                              calcMode: "discrete",
                              isFreeze: true,
                              loopCount: 1,
                              isAdditive: false,
                              restart: "always",
                            })}

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
              )
            })}
          </g>
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default ClickZoom
