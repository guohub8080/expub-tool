import type { CSSProperties, ReactNode, HTMLAttributes } from "react";
import { useImportant } from "./useImportant";
import { resolveWatermark } from "./resolveWatermark";

const SpanEx = (props: {
  style?: CSSProperties;
  children?: ReactNode;
  important?: [string, string | null | undefined][];
  watermark?: Record<string, any>;
  noWatermark?: boolean;
} & HTMLAttributes<HTMLSpanElement>) => {
  const { style, children, important, watermark, noWatermark, ...rest } = props;
  const { ref, hasImportant } = useImportant<HTMLSpanElement>(important);

  const commonProps = {
    style,
    ...resolveWatermark(watermark, noWatermark),
    ...rest,
  };

  if (!hasImportant) {
    return <span {...commonProps}>{children}</span>;
  }

  return (
    <span ref={ref} {...commonProps}>
      {children}
    </span>
  );
};
export default SpanEx;
