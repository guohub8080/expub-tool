import type { CSSProperties } from 'react'
import SectionEx from '@html/basicEx/SectionEx'
import SvgEx from '@html/basicEx/SvgEx'
import { CascadeContent } from './CascadeContent'
import type { I_CascadeSwipeChildItem, I_CascadeContent } from '../types'

/**
 * 单个抽拉卡（复刻参考「零高容器 + 等分容器滑动 + 置顶框架_穿透 + 占位 + 二分栏」）：
 * - 零高视差包裹：height:0 + overflow:visible，多卡叠在同一画布
 * - 滚动层 + 轨道：content[] 为面板，轨道宽 = N×100%，向左抽拉
 * - slide-1：背景图层（零高穿透）+ overlay（置顶框架）
 *   - overlay 内：占位 placeholder（高 = tagHandle.y，把把手推到 y）+ 二分栏
 *   - 二分栏 左 (canvasW - w) 空 / 右 w = 把手列（靠右）；列内把手槽为全段唯一 pe:visible
 * - slide-2..N：纯背景图
 *
 * 把手 x 自动靠右（二分栏右列在最右），y 由 placeholder 顶到位，w/h 由把手画布决定。
 */
export function CascadeSection({ childItem, canvasWidth, canvasHeight }: {
  childItem: I_CascadeSwipeChildItem
  canvasWidth: number
  canvasHeight: number
}) {
  const { tagHandle, content } = childItem
  if (content.length === 0) return null

  const groupCount = content.length
  const trackWidthPercent = groupCount * 100
  const slideWidthPercent = 100 / groupCount

  // 把手几何（viewBox）→ 二分栏左右列比例（右列 = w，靠右）
  const handleContent: I_CascadeContent = { url: tagHandle.url, jsx: tagHandle.jsx }
  const leftColumnPercent = ((canvasWidth - tagHandle.w) / canvasWidth) * 100
  const rightColumnPercent = (tagHandle.w / canvasWidth) * 100

  const slideStyle: CSSProperties = {
    width: `${slideWidthPercent}%`,
    flex: `0 0 ${slideWidthPercent}%`,
    verticalAlign: 'top',
    lineHeight: 0,
    overflow: 'hidden',
  }

  return (
    <section style={zeroHeightWrapperStyle}>
      <section style={scrollLayerStyle}>
        <SectionEx
          important={[
            ['width', `${trackWidthPercent}%`],
            ['max-width', `${trackWidthPercent}%`],
          ]}
          style={trackStyle}
        >
          {/* slide-1：背景图 + 把手 overlay */}
          <section style={slideStyle}>
            <section style={bgLayerStyle}>
              <CascadeContent content={content[0]} width={canvasWidth} height={canvasHeight} />
            </section>

            <section style={overlayStyle}>
              {/* placeholder：高 = tagHandle.y，把下方把手推到 y */}
              {tagHandle.y > 0 && (
                <SvgEx viewBox={`0 0 ${canvasWidth} ${tagHandle.y}`} style={placeholderStyle} />
              )}

              {/* 二分栏：左 (canvasW - w) 空 / 右 w 把手（靠右） */}
              <section style={bisectionStyle}>
                <SectionEx
                  important={[['max-width', `${leftColumnPercent}%`]]}
                  style={{ ...leftColumnStyle, flex: `0 0 ${leftColumnPercent}%` }}
                >
                  <br />
                </SectionEx>
                <SectionEx
                  important={[['max-width', `${rightColumnPercent}%`]]}
                  style={{ ...rightColumnStyle, flex: `0 0 ${rightColumnPercent}%` }}
                >
                  {/* 把手槽：全段唯一 pointer-events: visible */}
                  <section style={handleSlotStyle}>
                    <CascadeContent content={handleContent} width={tagHandle.w} height={tagHandle.h} />
                  </section>
                </SectionEx>
              </section>
            </section>
          </section>

          {/* slide-2..N：纯背景图 */}
          {content.slice(1).map((slide, idx) => (
            <section key={idx} style={slideStyle}>
              <CascadeContent content={slide} width={canvasWidth} height={canvasHeight} />
            </section>
          ))}
        </SectionEx>
      </section>
    </section>
  )
}

const zeroHeightWrapperStyle: CSSProperties = {
  textAlign: 'center',
  height: 0,
  lineHeight: 0,
  width: '100%',
  margin: '0 auto',
  overflow: 'visible',
}

const scrollLayerStyle: CSSProperties = {
  overflow: 'scroll hidden',
  marginTop: 0,
  lineHeight: 0,
}

const trackStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  lineHeight: 0,
  display: 'flex',
}

const bgLayerStyle: CSSProperties = {
  textAlign: 'center',
  height: 0,
  lineHeight: 0,
  width: '100%',
  margin: '-1px auto 0px',
  pointerEvents: 'none',
}

const overlayStyle: CSSProperties = {
  textAlign: 'center',
  lineHeight: 0,
  margin: '-1px auto 0px',
  display: 'block',
  transform: 'scale(1)',
  isolation: 'isolate',
  pointerEvents: 'none',
}

const placeholderStyle: CSSProperties = {
  display: 'block',
  transform: 'scale(1)',
  pointerEvents: 'none',
}

const bisectionStyle: CSSProperties = {
  display: 'flex',
  verticalAlign: 'top',
  boxSizing: 'border-box',
  pointerEvents: 'none',
  marginTop: '-1px',
}

const leftColumnStyle: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'bottom',
  boxSizing: 'border-box',
}

const rightColumnStyle: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'bottom',
  boxSizing: 'border-box',
  marginLeft: 0,
}

const handleSlotStyle: CSSProperties = {
  display: 'block',
  marginTop: '-1px',
  textAlign: 'center',
  lineHeight: 0,
  overflow: 'hidden',
  pointerEvents: 'visible',
  width: '100%',
}
