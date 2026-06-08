import React from 'react'
import isNil from 'lodash/isNil'
import defaultTo from 'lodash/defaultTo'
import { genAnimateExtrude } from '@behaviors/extrude'
import SectionEx from '@html/basicEx/SectionEx'
import { SPACING_ZERO, spacing } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'

import type { T_CanvasSize } from '@svg/types'

/** ExtrudeShowcase 要求 canvasSize 的 w/h 必填 */
type RequiredCanvasSize = Required<T_CanvasSize>

type ExtrudeShowcaseProps = {
  /** SVG 画布尺寸（= 封面/Before 组件的尺寸），w/h 必填 */
  canvasSize: RequiredCanvasSize
  /** 展开后需要露出的总高度（Before 高度 + After 高度） */
  totalHeight: number
  /** 触发方式，默认 'click' */
  begin?: string
  /** 展开/挤出动画时长（秒），默认 1 */
  durationSeconds?: number
  /** 展开动画缓动曲线 */
  keySplines?: string
  /** 间距 */
  spacing?: T_SpacingProps
  children?: React.ReactNode
}

/**
 * ExtrudeShowcase — 点击展开组件
 *
 * 三层结构：
 * 1. 零高度内容区 (After) — 展开后露出的新内容，被外层 overflow:hidden 裁住
 * 2. Extrude SVG — 正常流，撑住外层高度，点击后撑开
 * 3. Before 层 — 零高度，最上面，放交互组件（轮播/ClickCascade 等）
 *
 * 用法：
 * ```tsx
 * <ExtrudeShowcase canvasSize={{ w: 300, h: 300 }} totalHeight={831}>
 *   <ExtrudeShowcase.After>
 *     <img src="revealed.jpg" />
 *   </ExtrudeShowcase.After>
 *   <ExtrudeShowcase.Before>
 *     <ClickCascade ... />
 *   </ExtrudeShowcase.Before>
 * </ExtrudeShowcase>
 * ```
 */
const ExtrudeShowcase = (props: ExtrudeShowcaseProps) => {
  const { canvasSize, totalHeight, children } = props
  const W = canvasSize.w
  const H = canvasSize.h
  const begin = defaultTo(props.begin, 'click')
  const durationSeconds = defaultTo(props.durationSeconds, 1)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))

  // 从 children 中提取 Before 和 After
  let beforeNode: React.ReactNode = null
  let afterNode: React.ReactNode = null

  const extractSlot = (
    child: React.ReactNode,
    matcher: (c: React.ReactNode) => c is React.ReactElement,
    setter: (node: React.ReactNode) => void,
  ) => {
    if (matcher(child)) {
      const slotProps = child.props as { children: React.ReactNode }
      setter(slotProps.children)
    }
  }

  React.Children.forEach(children, (child) => {
    extractSlot(child, isBeforeElement, (node) => { beforeNode = node })
    extractSlot(child, isAfterElement, (node) => { afterNode = node })
  })

  return (
    <SectionEx
      data-label="extrude-showcase"
      style={{ ...outerStyle, ...spacingResult }}
    >
      {/* 零高度内容区：After 内容被外层 overflow:hidden 裁住 */}
      <section style={zeroHeightStyle}>
        {afterNode}
      </section>

      {/* Extrude SVG：正常流，撑住外层高度 */}
      {genAnimateExtrude({
        canvasWidth: W,
        initHeight: H,
        timeline: [
          { toHeight: totalHeight, durationSeconds, ...(props.keySplines ? { keySplines: props.keySplines } : {}) },
        ],
        begin,
      })}

      {/* Before 层：零高度，负 margin 拉回与 Extrude SVG 重合，DOM 在后所以绘制在最上面 */}
      {!isNil(beforeNode) && (
        <section style={{
          ...beforeLayerBaseStyle,
          marginTop: -H,
        }}>
          {beforeNode}
        </section>
      )}
    </SectionEx>
  )
}

// ──────────────────────────── Compound Component Slots ────────────────────────────

const Before = (props: { children: React.ReactNode }) => <>{props.children}</>
Before.displayName = 'ExtrudeShowcase.Before'

const After = (props: { children: React.ReactNode }) => <>{props.children}</>
After.displayName = 'ExtrudeShowcase.After'

ExtrudeShowcase.Before = Before
ExtrudeShowcase.After = After

export default ExtrudeShowcase

// ──────────────────────────── Helpers ────────────────────────────

const BEFORE_DISPLAY_NAME = 'ExtrudeShowcase.Before'
const AFTER_DISPLAY_NAME = 'ExtrudeShowcase.After'

function isBeforeElement(child: React.ReactNode): child is React.ReactElement {
  return React.isValidElement(child) && (child.type as any).displayName === BEFORE_DISPLAY_NAME
}

function isAfterElement(child: React.ReactNode): child is React.ReactElement {
  return React.isValidElement(child) && (child.type as any).displayName === AFTER_DISPLAY_NAME
}

// ──────────────────────────── Styles ────────────────────────────

const outerStyle: React.CSSProperties = {
  overflow: 'hidden',
  lineHeight: 0,
  fontSize: 0,
  display: 'block',
  textAlign: 'center',
  WebkitTouchCallout: 'none',
  userSelect: 'none',
}

const zeroHeightStyle: React.CSSProperties = {
  height: 0,
  lineHeight: 0,
  overflow: 'visible',
}

const beforeLayerBaseStyle: React.CSSProperties = {
  height: 0,
  lineHeight: 0,
  isolation: 'isolate',
}
