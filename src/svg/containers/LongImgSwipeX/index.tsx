import { useMemo } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import useImgSize from '@utils/hooks/useImgSize'
import svgURL from '@utils/svg/svgURL'
import { ExPubGoConfig } from '@utils/provider/ExPubGoProvider'
import type { T_CanvasSize } from '@svg/types'

/**
 * 横向长图滑动组件
 *
 * 用于展示横向长图（宽 > 高）的可滑动组件。
 *
 * 原理：
 * 1. 用户上传前将横向长图**顺时针旋转 90°**（变成竖图，绕过微信横向图片压缩）
 * 2. 组件通过 SVG `transform="rotate(-90)"` 将图片逆时针旋转回来
 * 3. 利用 foreignObject + background-image 渲染旋转后的图片
 * 4. 外层 overflow: scroll hidden 实现横向滑动
 *
 * @param url             - 图片 URL（需预先顺时针旋转 90° 上传）
 * @param exposedPercent  - 默认露出的百分比，默认 25
 * @param isReverse       - 是否反向滑动（rtl），默认 false
 * @param canvasSize       - 图片尺寸 {w, h}，不传则自动获取
 * @param spacing         - 外边距配置
 */
const LongImgSwipeX = (props: {
  url?: string
  exposedPercent?: number
  isReverse?: boolean
  canvasSize?: T_CanvasSize
  spacing?: T_SpacingProps
}) => {
  const exposedPercent = defaultTo(props.exposedPercent, 25)
  const isReverse = defaultTo(props.isReverse, false)
  const imgURL = defaultTo(props.url, '')
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const isDev = ExPubGoConfig().mode === 'development'

  const imgSize = useImgSize(imgURL, props.canvasSize?.w, props.canvasSize?.h)

  // 露出百分比 → 滑动内容宽度
  // 例：exposedPercent=25 → slideW = 100/25*100% = 400%
  const slideW = useMemo(() => {
    if (exposedPercent > 0) {
      return `${100 / exposedPercent * 100}%`
    }
    return '400%'
  }, [exposedPercent])

  if (!imgURL) return null

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'long-img-swipe-x' } : {})}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'text',
        overflow: 'hidden',
        textAlign: 'center',
        lineHeight: 0,
        ...spacingResult,
      }}
    >
      {/* 滚动层：横向滚动 */}
      <section style={{
        display: 'flex',
        flexWrap: 'nowrap',
        overflow: 'scroll hidden',
        width: '100%',
        overscrollBehaviorX: 'none',
        WebkitOverflowScrolling: 'touch',
        margin: 0,
        direction: isReverse ? 'rtl' : 'ltr',
      }}>
        {/* 内容层：宽度由 exposedPercent 决定 */}
        <section style={{
          flex: 'none',
          minWidth: slideW,
          width: slideW,
        }}>
          <SectionEx
            important={[['min-width', '100%'], ['width', '100%']]}
            style={{
              textAlign: 'center',
              lineHeight: 0,
              pointerEvents: 'none',
              transformStyle: 'preserve-3d',
              marginTop: '0vw',
              transformOrigin: 'center center',
              minWidth: '100%',
              width: '100%',
              direction: 'ltr',
            }}
          >
            {/* 外层 SVG：viewBox 用旋转后的尺寸 (h × w) */}
            <SvgEx
              style={{ display: 'block', pointerEvents: 'none' }}
              viewBox={`0 0 ${imgSize.size.h} ${imgSize.size.w}`}
            >
              {/* 先下移 w，再逆时针旋转 90°，将竖图还原为横图 */}
              <g transform={`translate(0,${imgSize.size.w})`}>
                <g transform="rotate(-90)">
                  <foreignObject width={imgSize.size.w} height={imgSize.size.h} x="0" y="0">
                    {/* 内层 SVG：用 background-image 渲染图片 */}
                    <SvgEx
                      style={{
                        overflow: 'hidden',
                        backgroundSize: '100%',
                        backgroundRepeat: 'no-repeat',
                        pointerEvents: 'none',
                        backgroundImage: svgURL(imgURL),
                      }}
                      viewBox={`0 0 ${imgSize.size.w} ${imgSize.size.h}`}
                    />
                  </foreignObject>
                </g>
              </g>
            </SvgEx>
          </SectionEx>
        </section>
      </section>
    </SectionEx>
  )
}

export default LongImgSwipeX
