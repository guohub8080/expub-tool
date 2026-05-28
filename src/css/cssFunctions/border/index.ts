import type {CSSProperties} from "react";

/** 边框宽度 - 水平方向 (左右平分) */
export const borderX = (value: number): CSSProperties => ({
    borderLeftWidth: value / 2,
    borderRightWidth: value / 2
})

/** 边框宽度 - 垂直方向 (上下平分) */
export const borderY = (value: number): CSSProperties => ({
    borderTopWidth: value / 2,
    borderBottomWidth: value / 2
})

/** 圆角 - 顶部 (左上 + 右上) */
export const roundedT = (value: number): CSSProperties => ({
    borderTopLeftRadius: value,
    borderTopRightRadius: value
})

/** 圆角 - 右侧 (右上 + 右下) */
export const roundedR = (value: number): CSSProperties => ({
    borderTopRightRadius: value,
    borderBottomRightRadius: value
})

/** 圆角 - 底部 (左下 + 右下) */
export const roundedB = (value: number): CSSProperties => ({
    borderBottomLeftRadius: value,
    borderBottomRightRadius: value
})

/** 圆角 - 左侧 (左上 + 左下) */
export const roundedL = (value: number): CSSProperties => ({
    borderTopLeftRadius: value,
    borderBottomLeftRadius: value
})
