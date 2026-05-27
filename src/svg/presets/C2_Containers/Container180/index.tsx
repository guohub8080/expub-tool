/* eslint-disable no-mixed-spaces-and-tabs */
import type { CSSProperties, ReactNode } from "react";
import SectionEx from "@html/basicEx/SectionEx";
import { defaultTo } from "lodash-es";
import { spacing, spacingZero } from "@css-fn/spacing";
import type { T_SpacingProps } from "@css-fn/spacing";

/**
 * 180° 旋转容器
 * 将内部内容旋转 180 度显示（上下颠倒）
 * 
 * @description
 * 适用于需要将内容倒置显示的场景，例如：
 * - 镜像效果
 * - 倒置的分隔线
 * - 特殊的装饰效果
 */
const Container180 = (props: {
	children?: ReactNode
	spacing?: T_SpacingProps
}) => {
	const spacingResult = spacing(defaultTo(props.spacing, spacingZero))

	const rootStyle: CSSProperties = {
		...rootBaseStyle,
		...spacingResult
	};

	return (
		<SectionEx data-label="container-180" style={rootStyle}>
			<section style={rotateStyle}>
				{props.children}
			</section>
		</SectionEx>
	);
};

export default Container180;


/** ================================================== Styles ===================================================== */
const rootBaseStyle: CSSProperties = {
	WebkitTouchCallout: "none",
	userSelect: "text",
	overflow: "hidden",
	textAlign: "center",
	lineHeight: 0,
};

const rotateStyle: CSSProperties = {
	display: "block",
	transform: "rotate(180deg)",
	transformOrigin: "center",
};

