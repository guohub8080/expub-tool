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
 * 原理（完全复刻普拉达参考）：
 * 1. <img> 热区在 DOM **前面**（底层，被背景盖住，pe:painted 可点）
 * 2. canvasBg 在 DOM **后面**（盖在 img 上面，pe:none 点击穿透 → 打到 img → 微信预览）
 *
 * 用户看到的是 canvasBg（报纸图案/动画暗示），看不到 img。
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

              {/* 图片容器：height 99999px 给 img 足够渲染空间 */}
              <section style={{ verticalAlign: 'top', width: `${containerPercent}%`, height: '99999px' }}>
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

      {/* 2. 背景层（DOM 后 = 盖在 img 上面，pe:none 让点击穿透到 img） */}
      {/* url → <svg background-image pe:none>；jsx → 用户自己的 svg，包一层 pe:none */}
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
        /* 无背景时用透明占位 svg 撑出画布高度 */
        <SvgEx
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          style={{ display: 'block', width: '100%', pointerEvents: 'none' }}
        />
      )}
    </SectionEx>
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

/** jsx 背景的包裹层：pe:none 确保点击穿透到下面的 img */
const bgCoverLayerStyle: CSSProperties = {
  pointerEvents: 'none',
  lineHeight: 0,
}
