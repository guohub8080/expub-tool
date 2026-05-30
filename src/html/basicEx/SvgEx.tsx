import React from "react";
import { useImportant } from "./useImportant";
import { resolveWatermark } from "./resolveWatermark";

interface SvgExProps extends React.SVGProps<SVGSVGElement> {
  important?: [string, string | null | undefined][];
  watermark?: Record<string, any>;
  noWatermark?: boolean;
}

const SvgEx: React.FC<SvgExProps> = ({ children, important, style, watermark, noWatermark, ...rest }) => {
  const { ref, hasImportant } = useImportant<SVGSVGElement>(important);

  const commonProps = {
    style,
    ...resolveWatermark(watermark, noWatermark),
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
