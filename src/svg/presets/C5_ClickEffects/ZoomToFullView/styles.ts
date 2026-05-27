import type { CSSProperties } from "react";
import svgURL from "@svg/utils/svgURL";

export const rootStyle = (spacingResult: CSSProperties): CSSProperties => ({
	WebkitTouchCallout: "none",
	userSelect: "text",
	overflow: "hidden",
	textAlign: "center",
	lineHeight: 0,
	...spacingResult,
});

export const imgStyle = (url: string): CSSProperties => ({
	backgroundImage: svgURL(url),
	backgroundRepeat: "no-repeat",
	backgroundSize: "100%",
	display: "block",
});

export const wrapperStyle: CSSProperties = {
	display: "inline-block",
	width: "100%",
	lineHeight: 0,
};
