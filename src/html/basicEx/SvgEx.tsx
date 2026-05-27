import React from "react";
import { defaultTo } from "lodash";
import { useImportant } from "./useImportant";

interface SvgExProps extends React.SVGProps<SVGSVGElement> {
  /** 需要添加 !important 的样式属性 */
  important?: [string, string | null | undefined][];
  /** 水印属性 */
  waterMark?: Record<string, any>;
}

const SvgEx: React.FC<SvgExProps> = ({ children, important, style, waterMark, ...rest }) => {
  const { ref, hasImportant } = useImportant<SVGSVGElement>(important);

  const commonProps = {
    ...waterMark,
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    style,
    ...rest,
  };

  if (!hasImportant) {
    return <svg {...commonProps}>{children}</svg>;
  }

  return (
    <svg ref={ref} {...commonProps}>
      {children}
    </svg>
  );
};

export default SvgEx;
