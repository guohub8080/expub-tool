import type { CSSProperties, ReactNode, HTMLAttributes } from "react";
import { useImportant } from "./useImportant";

const SpanEx = (props: {
    style?: CSSProperties;
    children?: ReactNode;
    important?: [string, string | null | undefined][];
    waterMark?: Record<string, any>;
} & HTMLAttributes<HTMLSpanElement>) => {
    const { style, children, important, waterMark, ...rest } = props;
    const { ref, hasImportant } = useImportant<HTMLSpanElement>(important);

    const commonProps = {
        style,
        ...waterMark,
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
