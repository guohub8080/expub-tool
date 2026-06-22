import type { CSSProperties, ReactNode } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import svgURL from '@utils/svg/svgURL'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import { isDefined } from '@utils/fn/isDefined'
import type { I_ModalImgProps, I_ModalImgChildItem } from './types'

export type { I_ModalImgProps, I_ModalImgChildItem, I_ModalImgHotArea, I_ModalImgContent } from './types'

/**
 * ModalImg — 热区点击弹出图片（微信原生预览）
 *
 * 原理（完全复刻普拉达参考）：
 * 1. <img> 热区在 DOM **前面**（底层，被背景盖住，pe:painted 可点）
 * 2. canvasBg 在 DOM **后面**（盖在 img 上面，pe:none 点击穿透 → 打到 img → 微信预览）
 * 3. 长图用 ratio + transform:scale(1, scaleY) 压缩成可见条
 *
 * 用户看到的是 canvasBg（报纸/动画暗示），看不到 img。
 * 点击 canvasBg → pe:none 穿透 → 打到 img → 微信弹出全图。
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
        display: 'block',
        width: '100%',
        lineHeight: 0,
        overflow: 'hidden',
        textAlign: 'center',
        ...spacingResult,
      }}
    >
      {/* 1. img 热区层（DOM 先 = 底层，被背景盖住） */}
      {props.childItems.map((item, idx) => (
        <HotAreaSection key={idx} item={item} canvasWidth={canvasWidth} />
      ))}

      {/* 2. 背景层（DOM 后 = 盖在 img 上面，pe:none 点击穿透） */}
      {renderCanvasBg({ canvasBg: props.canvasBg, canvasWidth, canvasHeight })}
    </SectionEx>
  )
}

/**
 * 渲染背景层。
 * - url → <svg background-image cover no-repeat pe:none>（和参考一致）
 * - jsx → 用户的整个 svg，包一层 pe:none
 * - 都不传 → 透明占位 svg 撑出画布高度
 */
function renderCanvasBg({ canvasBg, canvasWidth, canvasHeight }: {
  canvasBg: I_ModalImgProps['canvasBg']
  canvasWidth: number
  canvasHeight: number
}): ReactNode {
  if (isDefined(canvasBg?.url)) {
    return (
      <SvgEx
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={canvasBgUrlStyle({ backgroundImageUrl: svgURL(canvasBg.url) })}
      />
    )
  }

  if (isDefined(canvasBg?.jsx)) {
    return <section style={bgCoverLayerStyle}>{canvasBg.jsx}</section>
  }

  return (
    <SvgEx
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      style={{ display: 'block', width: '100%', pointerEvents: 'none' }}
    />
  )
}

/** url 背景的 <svg> 样式（和参考的报纸背景逐字一致） */
function canvasBgUrlStyle({ backgroundImageUrl }: { backgroundImageUrl: string }): CSSProperties {
  return {
    display: 'block',
    width: '100%',
    lineHeight: 0,
    transform: 'scale(1)',
    pointerEvents: 'none',
    backgroundImage: backgroundImageUrl,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  }
}

/**
 * 单个热区：完全复刻参考结构
 * 零高视差层 → 占位 SVG(Y) → flex 内行 → 左留白(X) + 图片容器 → <img scale>
 */
function HotAreaSection({ item, canvasWidth }: {
  item: I_ModalImgChildItem
  canvasWidth: number
}) {
  const { hotArea, imgUrl, ratio } = item
  const spacerPercent = (hotArea.x / canvasWidth) * 100
  const containerPercent = (hotArea.w / canvasWidth) * 100

  return (
    <section style={hotAreaLayerStyle}>
      {/* Y 偏移：占位 SVG */}
      {hotArea.y > 0 && (
        <SvgEx viewBox={`0 0 ${canvasWidth} ${hotArea.y}`} style={{ display: 'inline' }} />
      )}

      {/* flex 内行 */}
      <SectionEx important={[['max-width', '100%']]} style={flexRowStyle}>
        {/* 左留白 */}
        <SectionEx
          important={[['max-width', `${spacerPercent}%`]]}
          style={{ ...spacerStyle, flex: `0 0 ${spacerPercent}%` }}
        >
          <SvgEx viewBox="0 0 404 404" style={{ verticalAlign: 'top' }} />
        </SectionEx>

        {/* 图片容器 */}
        <section style={{ verticalAlign: 'top', width: `${containerPercent}%`, height: '99999px' }}>
          <img
            src={imgUrl}
            data-ratio={isDefined(ratio) ? String(ratio) : undefined}
            style={buildImgStyle({ hotArea, ratio })}
          />
        </section>
      </SectionEx>
    </section>
  )
}

/** 构建 <img> 的 style：有 ratio 加 scale 压缩，无 ratio 按自然高渲染 */
function buildImgStyle({ hotArea, ratio }: { hotArea: { w: number; h: number }; ratio?: number }): CSSProperties {
  const style: CSSProperties = {
    width: '100%',
    pointerEvents: 'painted',
    height: 'auto',
    transformOrigin: 'center top',
  }

  if (isDefined(ratio) && ratio > 0) {
    const scaleY = (hotArea.h / hotArea.w) / ratio
    style.transform = `scale(1, ${scaleY})`
  }

  return style
}

export default ModalImg

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
  flex: '0 0 100%',
  display: 'flex',
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

const bgCoverLayerStyle: CSSProperties = {
  pointerEvents: 'none',
  lineHeight: 0,
}
