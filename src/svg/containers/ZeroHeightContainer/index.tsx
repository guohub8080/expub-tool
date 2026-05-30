import type {ReactNode} from 'react';
import SectionEx from '@html/basicEx/SectionEx';
import defaultTo from 'lodash/defaultTo';
import {SPACING_ZERO, spacing} from '@css-fn/spacing';
import type {T_SpacingProps} from '@css-fn/spacing';
import {ExPubGoConfig} from '@utils/provider/ExPubGoProvider';
import {outerStyle, innerStyleMap, labelMap} from './styles';

/**
 * 零高度容器模式
 *
 * | mode              | 说明                                          |
 * |-------------------|-----------------------------------------------|
 * | default           | 普通零高度容器，overflow: visible              |
 * | through           | 事件穿透（pointer-events: none）              |
 * | through-priority  | 穿透 + 强制优先显示（transform + isolation）   |
 * | priority          | 仅强制优先，保留正常交互                        |
 * | 3d                | 3D 变换上下文（preserve-3d）                   |
 */
export type T_ZeroHeightMode = 'default' | 'through' | 'through-priority' | 'priority' | '3d'

/**
 * ZeroHeightContainer — 零高度容器
 *
 * 核心原理：内层 section 设置 height: 0，使其在文档流中不占据垂直空间，
 * 但子内容通过 overflow: visible 溢出显示。常用于 SVG/绝对定位内容的包裹场景。
 *
 * 通过 mode 选择渲染变体，各变体对应不同的 CSS 策略（事件穿透、层叠优先、3D 变换等）。
 * development 模式下，最外层会输出 expubgo-label 属性，方便 AI 审计。
 *
 * @param children - 容器内容
 * @param spacing  - margin/padding 快捷设置，默认全 0
 * @param mode     - 容器模式，默认 'default'
 */
const ZeroHeightContainer = (props: {
  children: ReactNode
  spacing?: T_SpacingProps
  mode?: T_ZeroHeightMode
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const mode = defaultTo(props.mode, 'default')
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': labelMap[mode] } : {})}
      style={{...spacingResult, ...outerStyle}}
    >
      <section style={innerStyleMap[mode]}>
        {props.children}
      </section>
    </SectionEx>
  )
}

export default ZeroHeightContainer
