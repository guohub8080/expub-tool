import type { CSSProperties } from 'react'
import type { T_ZeroHeightMode } from './index'

/**
 * 外层容器通用样式
 *
 * 所有 ZeroHeightContainer 变体共享的外层样式：
 * - 禁用 iOS 长按呼出菜单（WebkitTouchCallout）
 * - 允许文本选择（用于文章阅读场景）
 * - 居中对齐 + 行高置 0（消除垂直方向意外间距）
 * - overflow: hidden（裁剪超出外层边界的内容）
 */
export const outerStyle: CSSProperties = {
  WebkitTouchCallout: 'none',
  userSelect: 'text',
  overflow: 'hidden',
  textAlign: 'center',
  lineHeight: 0,
}

/**
 * 内层容器基础样式
 *
 * 核心原理：height: 0 使容器在文档流中不占据垂直高度，
 * 配合外层的 overflow: hidden，实现"隐形容器"效果。
 * 子内容通过 overflow: visible 溢出显示。
 */
const baseInnerStyle: CSSProperties = {
  textAlign: 'center',
  height: 0,
  lineHeight: 0,
  width: '100%',
}

/**
 * 各模式的内层样式
 *
 * | mode              | 差异属性                                          | 说明                     |
 * |-------------------|--------------------------------------------------|--------------------------|
 * | default           | overflow: visible                                | 普通模式                  |
 * | through           | overflow: visible, pointerEvents: none           | 事件穿透                  |
 * | through-priority  | transform: scale(1), pointerEvents: none, isolation: isolate | 穿透 + 强制优先 |
 * | priority          | transform: scale(1), isolation: isolate          | 仅强制优先                |
 * | 3d                | overflow: visible, transformStyle: preserve-3d   | 3D 变换                  |
 */
export const innerStyleMap: Record<T_ZeroHeightMode, CSSProperties> = {
  default: {
    ...baseInnerStyle,
    margin: '0 auto',
    overflow: 'visible',
  },
  through: {
    ...baseInnerStyle,
    margin: '0 auto',
    pointerEvents: 'none',
  },
  'through-priority': {
    ...baseInnerStyle,
    transform: 'scale(1)',
    pointerEvents: 'none',
    isolation: 'isolate',
  },
  priority: {
    ...baseInnerStyle,
    transform: 'scale(1)',
    isolation: 'isolate',
  },
  '3d': {
    ...baseInnerStyle,
    margin: '0 auto',
    overflow: 'visible',
    transformStyle: 'preserve-3d',
  },
}

/**
 * 各模式的 expubgo-label 值（仅 development 模式下使用）
 */
export const labelMap: Record<T_ZeroHeightMode, string> = {
  default: 'zero-height-container',
  through: 'zero-height-container-through',
  'through-priority': 'zero-height-container-through-priority',
  priority: 'zero-height-container-priority',
  '3d': 'zero-height-container-3d',
}
