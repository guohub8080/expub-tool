import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import type { I_ModalImgProps } from './types'

export type { I_ModalImgProps, I_ModalImgChildItem, I_ModalImgHotArea } from './types'

/**
 * ModalImg — 热区点击弹出图片（微信原生预览）
 *
 * 在背景图上放 N 个热区（`<img pointer-events: painted>`），用户点击热区 →
 * 微信自动弹出图片原生预览（全屏 / 双指缩放）。组件不处理弹出/关闭/动画——
 * 那是微信原生行为。
 */
const ModalImg = (props: I_ModalImgProps) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'
  const canvasWidth = props.canvasSize.w
  const canvasHeight = props.canvasSize.h

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'modal-img' } : {})}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        lineHeight: 0,
        overflow: 'hidden',
        ...spacingResult,
      }}
    >
      {/* 背景层：canvasBg 满铺 + viewBox 撑出画布高度 */}
      <SvgEx
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{ display: 'block', width: '100%', ...resolveCanvasBg(props.canvasBg) }}
      />

      {/* 热区图片：绝对定位到各自热区，pointer-events: painted → 点击触发微信原生预览 */}
      {props.childItems.map((item, idx) => {
        const { hotArea, imgUrl } = item
        const imgStyle: CSSProperties = {
          position: 'absolute',
          left: `${(hotArea.x / canvasWidth) * 100}%`,
          top: `${(hotArea.y / canvasHeight) * 100}%`,
          width: `${(hotArea.w / canvasWidth) * 100}%`,
          height: `${(hotArea.h / canvasHeight) * 100}%`,
          pointerEvents: 'painted',
        }
        return <img key={idx} src={imgUrl} style={imgStyle} />
      })}
    </SectionEx>
  )
}

export default ModalImg
