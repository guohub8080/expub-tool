// Provider
export { ExPubGoProvider, ExPubGoConfig } from "./provider/ExPubGoProvider"
export type { T_ExPubGoMode, I_ExPubGoConfig } from "./provider/ExPubGoProvider"

// Hooks
export { default as useImgSize } from "./hooks/useImgSize"

// SVG utilities
export { default as svgURL } from "./svg/svgURL"
export { validateWechatSvg, WHITELIST_DATA } from "./svg/validateWechatSvg"
export type { IssueSeverity, ValidationIssue, ValidationResult } from "./svg/validateWechatSvg"
export { getRotationPivot } from "./svg/getRotationPivot"

// DOM utilities
export { getElementBounds, getOriginNumByText } from "./dom/getElementBounds"
export type { ElementBoundsType, OriginPosition } from "./dom/getElementBounds"
export { default as getImgSizeAsync } from "./dom/getImgSizeAsync"

// Pure functions
export { assertNonEmptyArray } from "./fn/assertNonEmptyArray"
export { isNonEmptyArray } from "./fn/isNonEmptyArray"
export { isDefined } from "./fn/isDefined"
export { hasKey } from "./fn/hasKey"
