export { default as svgURL } from "./svgURL"
export { validateWechatSvg, WHITELIST_DATA } from "./validateWechatSvg"
export type { IssueSeverity, ValidationIssue, ValidationResult } from "./validateWechatSvg"

export { assertNonEmptyArray, isNonEmptyArray } from "./arrayValidation"

export { getElementBounds, getOriginNumByText } from "./getElementBounds"
export type { ElementBoundsType, OriginPosition } from "./getElementBounds"

export { default as getImgSizeAsync } from "./getImgSizeAsync"

// Colors
export { default as googleColors } from "./colors/googleColors"
export { default as tailwindColors } from "./colors/tailwindColors"

// Hooks
export { default as useImgSize } from "./hooks/useImgSize"
