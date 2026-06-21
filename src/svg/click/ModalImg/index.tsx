import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import isNil from 'lodash/isNil'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import { resolveCanvasBg } from '@utils/svg/resolveCanvasBg'
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
      {/* 1. img 热区层（DOM 先 = 底层，被背景盖住） */}
      {props.childItems.map((item, idx) => (
        <HotAreaSection
          key={idx}
          item={item}
          canvasWidth={canvasWidth}
        />
      ))}

      {/* 2. 背景层（DOM 后 = 盖在 img 上面，pe:none 点击穿透） */}
      {isDefined(bgUrl) ? (
        <SvgEx
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          style={{
            display: 'block',
            width: '100%',
            pointerEvents: 'none',
            ...resolveCanvasBg({ url: bgUrl }),
          }}
        />
      ) : isDefined(bgJsx) ? (
        <section style={bgCoverLayerStyle}>
          {bgJsx}
        </section>
      ) : (
        <SvgEx
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          style={{ display: 'block', width: '100%', pointerEvents: 'none' }}
        />
      )}
    </SectionEx>
  )
}

/**
 * 单个热区：完全复刻参考结构
 * 零高视差层 → 占位 SVG(Y) → slide 层(overflow-x:auto) → flex 内行 → 左留白(X) + 图片容器 → <img scale>
 */
function HotAreaSection({ item, canvasWidth }: {
  item: I_ModalImgChildItem
  canvasWidth: number
}) {
  const { hotArea, imgUrl, ratio } = item
  const spacerPercent = (hotArea.x / canvasWidth) * 100
  const containerPercent = (hotArea.w / canvasWidth) * 100

  // scaleY = (期望可见高 / 容器宽) / ratio = (hotArea.h / hotArea.w) / ratio
  // 没有 ratio 则不压缩（img 按自然高渲染）
  const scaleY = isDefined(ratio) && ratio > 0
    ? (hotArea.h / hotArea.w) / ratio
    : null

  const imgStyle: CSSProperties = {
    width: '100%',
    pointerEvents: 'painted',
    height: 'auto',
    transformOrigin: 'center top',
  }
  if (isDefined(scaleY)) {
    imgStyle.transform = `scale(1, ${scaleY})`
  }

  return (
    <section style={hotAreaLayerStyle}>
      {/* Y 偏移：占位 SVG */}
      {hotArea.y > 0 && (
        <SvgEx viewBox={`0 0 ${canvasWidth} ${hotArea.y}`} style={{ display: 'inline' }} />
      )}

      {/* slide 层（参考：overflow-x:auto 允许横向滚动） */}
      <section style={slideLayerStyle}>
        {/* flex 内行 */}
        <SectionEx
          important={[['max-width', '100%']]}
          style={flexRowStyle}
        >
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
              style={imgStyle}
            />
          </section>
        </SectionEx>
      </section>
    </section>
  )
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

const slideLayerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  verticalAlign: 'top',
  overflowX: 'auto',
  boxSizing: 'border-box',
  pointerEvents: 'none',
  lineHeight: 0,
}

const flexRowStyle: CSSProperties = {
  flex: '0 0 100%',
  display: 'flex',
  overflow: 'hidden',
  boxSizing: 'border-box',
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
