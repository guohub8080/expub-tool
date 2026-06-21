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
 * - canvasBg 为 url：组件自动渲染 `<svg background-image>`（和原代码一致）
 * - canvasBg 为 jsx：整个 `<svg>` 由用户提供，组件直接渲染、不包裹
 * - 热区 `<img>`：零高视差层定位（占位 SVG 做 Y 偏移、marginLeft 做 X 偏移），无 absolute
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
      <section style={{
        textAlign: 'center',
        height: 0,
        lineHeight: 0,
        width: '100%',
        margin: '0 auto',
        overflow: 'visible',
      }}>
        {isDefined(bgUrl) ? (
          <SvgEx
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            style={{ display: 'block', width: '100%', ...resolveCanvasBg({ url: bgUrl }) }}
          />
        ) : isDefined(bgJsx) ? (
          bgJsx
        ) : null}
      </section>

      {/* 热区：零高视差层，无 absolute */}
      {props.childItems.map((item, idx) => {
        const { hotArea, imgUrl } = item
        const leftPercent = (hotArea.x / canvasWidth) * 100
        const widthPercent = (hotArea.w / canvasWidth) * 100

        return (
          <section key={idx} style={{
            textAlign: 'center',
            height: 0,
            lineHeight: 0,
            width: '100%',
            margin: '0 auto',
            overflow: 'visible',
          }}>
            {/* Y 偏移：占位 SVG（viewBox 高 = hotArea.y） */}
            {hotArea.y > 0 && (
              <SvgEx
                viewBox={`0 0 ${canvasWidth} ${hotArea.y}`}
                style={{ display: 'block', width: '100%' }}
              />
            )}

            {/* 热区 <img>：marginLeft 做 X 偏移，width 控宽，pointer-events: painted */}
            <img
              src={imgUrl}
              style={{
                marginLeft: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: 'auto',
                pointerEvents: 'painted',
                verticalAlign: 'top',
              }}
            />
          </section>
        )
      })}

      {/* 底部占位：维持 viewBox 高度 */}
      <SvgEx
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{ display: 'block', width: '100%', pointerEvents: 'none' }}
      />
    </SectionEx>
  )
}

export default ModalImg
