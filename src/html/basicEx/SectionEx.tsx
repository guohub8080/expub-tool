import type { CSSProperties, ReactNode, HTMLAttributes } from "react";
import { useImportant } from "./useImportant";

const SectionEx = (props: {
    style?: CSSProperties;
    children?: ReactNode;
    important?: [string, string | null | undefined][];
    waterMark?: Record<string, any>;
} & HTMLAttributes<HTMLElement>) => {
    const { style, children, important, waterMark, ...rest } = props;
    const { ref, hasImportant } = useImportant<HTMLElement>(important);

    const commonProps = {
        style,
        ...waterMark,
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
