// Bezier
export { getLinearBezier } from "./bezier/getLinearBezier"
export { getEaseBezier } from "./bezier/getEaseBezier"
export { getPowerBezier } from "./bezier/getPowerBezier"
export { getSineBezier } from "./bezier/getSineBezier"
export { getExpoBezier } from "./bezier/getExpoBezier"
export { getCircleBezier } from "./bezier/getCircleBezier"
export { getElasticBezier0_1 } from "./bezier/getElasticBezier"
export { getBounceBezier0_1 } from "./bezier/getBounceBezier"
export { getBackBezier0_1 } from "./bezier/getBackBezier"

// KeySplines generator
export { genSvgKeySplines } from "./genSvgKeySplines"
export type { SvgTimelineSegment, SvgTimeline, SvgKeysResult } from "./genSvgKeySplines"

// Timeline compiler
export { compileTimeline } from "./timeline/compile"
export type { I_TimelineKeyframe, I_TimelineResult, T_ValueSerializer } from "./timeline/types"

// animateTransform
export { transformTranslate } from "./animateTransform/translate"
export type { I_TranslateConfig, I_TranslateValue } from "./animateTransform/translate"
export { transformScale, transformScaleRaw } from "./animateTransform/scale"
export type { I_ScaleConfig, I_ScaleRawConfig } from "./animateTransform/scale"
export { transformRotate } from "./animateTransform/rotate"
export type { I_RotateConfig } from "./animateTransform/rotate"
export { transformSkewX } from "./animateTransform/skewX"
export type { I_SkewXConfig } from "./animateTransform/skewX"
export { transformSkewY } from "./animateTransform/skewY"
export type { I_SkewYConfig } from "./animateTransform/skewY"

// animate
export { animateAttribute } from "./animate/attribute"
export type { I_AnimateAttributeConfig } from "./animate/attribute"
export { animateOpacity } from "./animate/opacity"
export type { I_OpacityConfig } from "./animate/opacity"
export { animatePathStroke, animatePathStrokeWrap } from "./animate/pathStroke"
export type { I_PathStrokeConfig, I_PathStrokeWrapConfig } from "./animate/pathStroke"
export { animateFill } from "./animate/fill"
export type { I_FillConfig } from "./animate/fill"
export { animateStroke } from "./animate/stroke"
export type { I_StrokeConfig } from "./animate/stroke"
export { animateStrokeWidth } from "./animate/strokeWidth"
export type { I_StrokeWidthConfig } from "./animate/strokeWidth"
export { animateX } from "./animate/x"
export type { I_XConfig } from "./animate/x"
export { animateY } from "./animate/y"
export type { I_YConfig } from "./animate/y"
export { animateWidth } from "./animate/width"
export type { I_WidthConfig } from "./animate/width"
export { animateHeight } from "./animate/height"
export type { I_HeightConfig } from "./animate/height"
export { animateRx } from "./animate/rx"
export type { I_RxConfig } from "./animate/rx"
export { animateRy } from "./animate/ry"
export type { I_RyConfig } from "./animate/ry"
export { animateR } from "./animate/r"
export type { I_R_Config } from "./animate/r"
export { animateCx } from "./animate/cx"
export type { I_CxConfig } from "./animate/cx"
export { animateCy } from "./animate/cy"
export type { I_CyConfig } from "./animate/cy"
export { animateD } from "./animate/d"
export type { I_DConfig } from "./animate/d"

// animateMotion
export { animateMotion } from "./animate/motion"
export type { I_PathMotionConfig, T_PathMotionRotate } from "./animate/motion"

// set
export { setAttribute, setVisibility, setOpacity, setDisplay, setFill, setStroke, setStrokeWidth, setX, setY, setWidth, setHeight, setRx, setRy, setR, setCx, setCy, setHref } from "./set"
export type { I_SetAttributeConfig, I_SetVisibilityConfig, T_VisibilityValue, I_SetOpacityConfig, I_SetDisplayConfig, I_SetFillConfig, I_SetStrokeConfig, I_SetStrokeWidthConfig, I_SetXConfig, I_SetYConfig, I_SetWidthConfig, I_SetHeightConfig, I_SetRxConfig, I_SetRyConfig, I_SetR_Config, I_SetCxConfig, I_SetCyConfig, I_SetHrefConfig } from "./set"

// SVG Utils (from @utils)
export { svgURL, validateWechatSvg, WHITELIST_DATA } from "@utils/index"
export type { IssueSeverity, ValidationIssue, ValidationResult } from "@utils/index"
