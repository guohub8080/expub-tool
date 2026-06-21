import type { CSSProperties, ReactNode, HTMLAttributes } from "react";
import { useImportant } from "@utils/hooks/useImportant";
import { resolveWatermark } from "@utils/html/resolveWatermark";

const SectionEx = (props: {
  style?: CSSProperties;
  children?: ReactNode;
  important?: [string, string | null | undefined][];
  watermark?: Record<string, any>;
  noWatermark?: boolean;
} & HTMLAttributes<HTMLElement>) => {
  const { style, children, important, watermark, noWatermark, ...rest } = props;
  const { ref, hasImportant } = useImportant<HTMLElement>(important);

  const commonProps = {
    style,
    ...resolveWatermark(watermark, noWatermark),
    ...rest,
  };

  if (!hasImportant) {
    return <section {...commonProps}>{children}</section>;
  }

  return (
    <section ref={ref} {...commonProps}>
      {children}
    </section>
  );
};
export default SectionEx;
