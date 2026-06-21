import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { isDefined } from '@utils/fn/isDefined'
import type { I_ModalImgProps } from './types'

export type { I_ModalImgProps, I_ModalImgChildItem, I_ModalImgHotArea, I_ModalImgContent } from './types'

/**
 * ModalImg — 热区点击弹出图片（微信原生预览）
 *
 * canvasBg（url 自动铺 background-image，或 jsx 用户自己写整个 svg）
 * + N 个热区（每个按参考结构放置 `<img pointer-events: painted>`）。
 *
 * 热区放置结构（完全复刻参考「零高容器 + 占位 SVG + flex 内行 + 左留白 + 图片容器」）：
 * - Y 偏移：占位 SVG（viewBox 高 = hotArea.y）
 * - X 偏移：flex 左留白（flex: 0 0 x%）
 * - 宽度：图片容器（width: w%）
 * - `<img>`：pointer-events: painted，点击触发微信原生预览
 */
const ModalImg = (props: I_ModalImgProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'
  const canvasWidth = props.canvasSize.w
  const canvasHeight = props.canvasSize.h
  const bgUrl = props.canvasBg?.url
  const bgJsx = props.canvasBg?.jsx

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'modal-img' } : {})}
      style={{
        display: 'block',
        width: '100%',
        lineHeight: 0,
        overflow: 'hidden',
        textAlign: 'center',
        ...spacingResult,
      }}
    >
      {/* 背景层（零高视差）：url → 自动 svg+background-image；jsx → 用户自己的整个 svg */}
      <section style={bgLayerStyle}>
        {isDefined(bgUrl) ? (
          <SvgEx
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            style={{ display: 'block', width: '100%', ...resolveCanvasBg({ url: bgUrl }) }}
          />
        ) : isDefined(bgJsx) ? (
          bgJsx
        ) : null}
      </section>

      {/* 热区：按参考结构放置每个 <img> */}
      {props.childItems.map((item, idx) => {
        const { hotArea, imgUrl } = item
        const spacerPercent = (hotArea.x / canvasWidth) * 100
        const containerPercent = (hotArea.w / canvasWidth) * 100

        return (
          <section key={idx} style={hotAreaLayerStyle}>
            {/* Y 偏移：占位 SVG（viewBox 高 = hotArea.y） */}
            {hotArea.y > 0 && (
              <SvgEx viewBox={`0 0 ${canvasWidth} ${hotArea.y}`} style={{ display: 'inline' }} />
            )}

            {/* flex 内行 */}
            <section style={flexRowStyle}>
              <SectionEx
                important={[['max-width', `${spacerPercent}%`]]}
                style={{ ...spacerStyle, flex: `0 0 ${spacerPercent}%` }}
              >
                <SvgEx viewBox="0 0 404 404" style={{ verticalAlign: 'top' }} />
              </SectionEx>

              {/* 图片容器 */}
              <section style={{ verticalAlign: 'top', width: `${containerPercent}%` }}>
                <img
                  src={imgUrl}
                  style={{
                    width: '100%',
                    pointerEvents: 'painted',
                    height: 'auto',
                  }}
                />
              </section>
            </section>
          </section>
        )
      })}

      {/* 底部占位：维持画布高度 */}
      <SvgEx
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{ display: 'block', width: '100%', pointerEvents: 'none' }}
      />
    </SectionEx>
  )
}

export default ModalImg

const bgLayerStyle: CSSProperties = {
  textAlign: 'center',
  height: 0,
  lineHeight: 0,
  width: '100%',
  margin: '0 auto',
  overflow: 'visible',
}

const hotAreaLayerStyle: CSSProperties = {
  textAlign: 'center',
  height: 0,
  lineHeight: 0,
  width: '100%',
  margin: '-1px auto 0px',
  overflow: 'visible',
  pointerEvents: 'none',
}

const flexRowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  verticalAlign: 'top',
  overflow: 'hidden',
  boxSizing: 'border-box',
  pointerEvents: 'none',
  lineHeight: 0,
}

const spacerStyle: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'bottom',
  boxSizing: 'border-box',
}
