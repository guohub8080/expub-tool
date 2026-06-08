import { useEffect, useRef } from "react";
import isEmpty from "lodash/isEmpty";
import defaultTo from 'lodash/defaultTo'

export const useImportant = <T extends Element = Element>(
    important?: [string, string | null | undefined][]
) => {
    const ref = useRef<T>(null);
    const hasImportant = !isEmpty(important);

    useEffect(() => {
        if (important && ref.current) {
            const el = ref.current as unknown as HTMLElement
            important.forEach(([key, value]) => {
                el.style.setProperty(key, defaultTo(value, ""), "important");
            });
        }
    }, [important]);

    return { ref, hasImportant };
};
