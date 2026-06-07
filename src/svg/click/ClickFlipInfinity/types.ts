import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

/** 卡牌单面内容 */
export interface I_FaceContent {
	url?: string
	jsx?: ReactNode
}

export interface I_ClickFlipInfinityProps {
	/** SVG viewBox 尺寸 */
	canvasSize: { w: number; h: number }
	/** 画布背景色，默认 #FFFFFF */
	canvasBg?: string
	/** 正面内容 */
	frontSide: I_FaceContent
	/** 反面内容 */
	backSide: I_FaceContent
	/** 翻转时长（秒），默认 1 */
	flipDuration?: number
	/** 缩放效果时长（秒），默认 1 */
	switchDuration?: number
	/** 外层 margin-top 间距 */
	spacing?: T_SpacingProps
}
