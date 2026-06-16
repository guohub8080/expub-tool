import type { CSSProperties } from "react";
import defaultTo from "lodash/defaultTo";;

// ============================================ 间距工具 (Spacing) ============================================

export type T_SpacingProps = {
  mt?: number | string; // margin-top
  mb?: number | string; // margin-bottom
  ml?: number | string; // margin-left
  mr?: number | string; // margin-right
  pt?: number | string; // padding-top
  pb?: number | string; // padding-bottom
  pl?: number | string; // padding-left
  pr?: number | string; // padding-right
};

/**
 * 零间距 Props（spacing 的默认值）
 */
export const SPACING_ZERO: T_SpacingProps = {
  mt: 0,
  mb: 0,
  ml: 0,
  mr: 0,
  pt: 0,
  pb: 0,
  pl: 0,
  pr: 0,
};

/**
 * 间距工具函数
 * 将简写的 margin/padding 配置转换为 CSSProperties。缺省（undefined）按 SPACING_ZERO 处理（显式 0）。
 *
 * @param props - 间距配置对象，缺省为 SPACING_ZERO
 * @returns CSSProperties 对象，可直接展开到 style 属性
 *
 * @example
 * ```tsx
 * <div style={spacing({ mt: 10, mb: 20, px: 15 })} />
 * // 等价于
 * <div style={{ marginTop: 10, marginBottom: 20, paddingLeft: 15, paddingRight: 15 }} />
 * ```
 */
export const spacing = (props: T_SpacingProps = SPACING_ZERO): CSSProperties => {
  return {
    marginTop: defaultTo(props?.mt, undefined),
    marginBottom: defaultTo(props?.mb, undefined),
    marginLeft: defaultTo(props?.ml, undefined),
    marginRight: defaultTo(props?.mr, undefined),
    paddingTop: defaultTo(props?.pt, undefined),
    paddingBottom: defaultTo(props?.pb, undefined),
    paddingLeft: defaultTo(props?.pl, undefined),
    paddingRight: defaultTo(props?.pr, undefined),
  };
};

/**
 * 零间距 CSS（用于 style 直接展开）
 */
export const SPACING_ZERO_CSS: CSSProperties = {
  margin: 0,
  padding: 0,
};

/** 水平内边距 (padding-left + padding-right) */
export const px = (value: number | string): CSSProperties => ({
  paddingLeft: value,
  paddingRight: value,
});

/** 垂直内边距 (padding-top + padding-bottom) */
export const py = (value: number | string): CSSProperties => ({
  paddingTop: value,
  paddingBottom: value,
});

/** 水平外边距 (margin-left + margin-right) */
export const mx = (value: number | string): CSSProperties => ({
  marginLeft: value,
  marginRight: value,
});

/** 垂直外边距 (margin-top + margin-bottom) */
export const my = (value: number | string): CSSProperties => ({
  marginTop: value,
  marginBottom: value,
});
