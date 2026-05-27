import {CSSProperties} from "react";

// ============================================ 内边距 (Padding) ============================================

/**
 * 内边距 - 所有方向
 */
export const p = (value: number): CSSProperties => ({
    padding: value
})

/**
 * 内边距 - 水平方向 (左右)
 */
export const px = (value: number): CSSProperties => ({
    paddingLeft: value / 2,
    paddingRight: value / 2
})

/**
 * 内边距 - 垂直方向 (上下)
 */
export const py = (value: number): CSSProperties => ({
    paddingTop: value / 2,
    paddingBottom: value / 2
})

/**
 * 内边距 - 上
 */
export const pt = (value: number): CSSProperties => ({
    paddingTop: value
})

/**
 * 内边距 - 右
 */
export const pr = (value: number): CSSProperties => ({
    paddingRight: value
})

/**
 * 内边距 - 下
 */
export const pb = (value: number): CSSProperties => ({
    paddingBottom: value
})

/**
 * 内边距 - 左
 */
export const pl = (value: number): CSSProperties => ({
    paddingLeft: value
})

// ============================================ 外边距 (Margin) ============================================

/**
 * 外边距 - 所有方向
 */
export const m = (value: number): CSSProperties => ({
    margin: value
})

/**
 * 外边距 - 水平方向 (左右)
 */
export const mx = (value: number): CSSProperties => ({
    marginLeft: value / 2,
    marginRight: value / 2
})

/**
 * 外边距 - 垂直方向 (上下)
 */
export const my = (value: number): CSSProperties => ({
    marginTop: value / 2,
    marginBottom: value / 2
})

/**
 * 外边距 - 上
 */
export const mt = (value: number): CSSProperties => ({
    marginTop: value
})

/**
 * 外边距 - 右
 */
export const mr = (value: number): CSSProperties => ({
    marginRight: value
})

/**
 * 外边距 - 下
 */
export const mb = (value: number): CSSProperties => ({
    marginBottom: value
})

/**
 * 外边距 - 左
 */
export const ml = (value: number): CSSProperties => ({
    marginLeft: value
})

// ============================================ mp 组合工具 ============================================

import { defaultTo } from "lodash";

export type mpProps = {
    mt?: number | string;
    mb?: number | string;
    ml?: number | string;
    mr?: number | string;
    pt?: number | string;
    pb?: number | string;
    pl?: number | string;
    pr?: number | string;
};

export const mpGet = (props?: mpProps): CSSProperties => {
    return {
        marginTop: defaultTo(props?.mt, 0),
        marginBottom: defaultTo(props?.mb, 0),
        marginLeft: defaultTo(props?.ml, 0),
        marginRight: defaultTo(props?.mr, 0),
        paddingTop: defaultTo(props?.pt, 0),
        paddingBottom: defaultTo(props?.pb, 0),
        paddingLeft: defaultTo(props?.pl, 0),
        paddingRight: defaultTo(props?.pr, 0),
    };
};

export const mpBlankCss = {
    margin: 0,
    padding: 0,
};

export const mpBlank = {
    mt: 0,
    mb: 0,
    ml: 0,
    mr: 0,
    pt: 0,
    pb: 0,
    pl: 0,
    pr: 0,
};
