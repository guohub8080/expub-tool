import type { ReactNode } from 'react'
import type { T_SpacingProps } from '@css-fn/spacing'

/** 弹窗单面内容 */
export interface I_FaceContent {
	url?: string
	jsx?: ReactNode
}

export interface I_ClickPopupProps {
	/** SVG viewBox 尺寸 */
	canvasSize: { w: number; h: number }
	/** 画布背景色，默认 #FFFFFF */
	canvasBg?: string
	/** 底层背景内容 */
	cover: I_FaceContent
	/** 弹出内容 */
	popup: I_FaceContent
	/** 弹跳动画时长（秒），默认 0.6，上限 1.5 */
	bounceDuration?: number
	/** 外层 margin-top 间距 */
	spacing?: T_SpacingProps
}
