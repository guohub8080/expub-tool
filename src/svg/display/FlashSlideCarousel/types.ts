import type { ReactNode } from "react"
import type { I_CanvasBg } from "@svg/types"
import type { T_SpacingProps } from "@css-fn/spacing"

/** 单张图片配置 */
export interface FlashSlideItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义内容（与 url 二选一，优先级高于 url） */
  jsx?: ReactNode
}

/** 默认一个循环周期（秒） */
export const DEFAULT_DURATION = 5
/** 默认抖动收缩值（scale 低点） */
export const DEFAULT_FLASH_SHRINK = 0.75
/** 默认抖动放大值（scale 高点） */
export const DEFAULT_FLASH_SCALE = 1.5
/** 默认切换宽度占 slot 的比例（cross-fade + 抖动窗口） */
export const DEFAULT_TRANS_FRAC = 0.4

export interface I_FlashSlideCarouselProps {
  /** SVG 画布尺寸（viewBox） */
  canvasSize: { w: number; h: number }
  /** 图片数组，至少 1 项 */
  childItems: FlashSlideItem[]
  /** 一个循环周期时长（秒），默认 5 */
  duration?: number
  /** 抖动收缩值（scale 低点），默认 0.75 */
  flashShrink?: number
  /** 抖动放大值（scale 高点），默认 1.5 */
  flashScale?: number
  /** 切换宽度占每张 slot 的比例（cross-fade + 抖动窗口），默认 0.4 */
  transFrac?: number
  /** 快门图：每次切换瞬间闪现一次（opacity 0→1→0，覆盖在图片上）。不传则无快门 */
  shutter?: FlashSlideItem
  /** 画布背景 */
  canvasBg?: I_CanvasBg
  /** 外层 margin-top 间距 */
  spacing?: T_SpacingProps
}
