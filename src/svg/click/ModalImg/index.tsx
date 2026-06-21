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
 * 在背景（url 或 jsx）上放 N 个热区 `<img pointer-events: painted>`，
 * 点击热区 → 微信原生图片预览。不处理弹出/关闭/动画。
 *
 * 定位方式（无 absolute，微信兼容）：
 * - 背景：url → SvgEx 的 background-image；jsx → SvgEx 的 children（SVG 内容）
 * - 热区 Y 偏移：零高视差层 + 占位 SVG（viewBox 高 = hotArea.y，把 img 顶下去）
 * - 热区 X 偏移：marginLeft 百分比
 * - 热区宽：width 百分比
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
      {/* 背景层：viewBox 撑高 + url 铺图 或 jsx 作为 <svg> children */}
      <SvgEx
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{
          display: 'block',
          width: '100%',
          ...(isDefined(bgUrl) ? resolveCanvasBg({ url: bgUrl }) : {}),
        }}
      >
        {isDefined(bgJsx) ? bgJsx : undefined}
      </SvgEx>

      {/* 热区：每个 childItem 一个零高视差层，无 absolute */}
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
            {/* Y 偏移：占位 SVG（viewBox 高 = hotArea.y，把 img 顶到正确高度） */}
            {hotArea.y > 0 && (
              <SvgEx
                viewBox={`0 0 ${canvasWidth} ${hotArea.y}`}
                style={{ display: 'block', width: '100%' }}
              />
            )}

            {/* 热区 <img>：marginLeft 做 X 偏移，width 控宽，pointer-events: painted → 点击触发微信原生预览 */}
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

      {/* 底部占位（维持 viewBox 高度） */}
      <SvgEx
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{ display: 'block', width: '100%', pointerEvents: 'none' }}
      />
    </SectionEx>
  )
}

export default ModalImg
