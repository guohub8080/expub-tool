import { useEffect, useRef } from "react";
import { isEmpty } from "lodash";

/**
 * 处理 !important 样式的自定义 Hook
 *
 * 当传入 important 数组时，通过 ref 在 useEffect 中设置内联样式的 !important 优先级。
 * 返回 ref 和是否需要使用 ref 的标记。
 *
 * @param important - [属性名, 属性值] 的数组，如 [["width", "100%"], ["color", "red"]]
 * @returns { ref, hasImportant }
 *   - ref: 绑定到 DOM 元素的 ref
 *   - hasImportant: 是否有 important 需要处理
 */
export const useImportant = <T extends Element>(
    important?: [string, string | null | undefined][]
) => {
    const ref = useRef<T>(null);
    const hasImportant = !isEmpty(important);

    useEffect(() => {
        if (important && ref.current) {
            important.forEach(([key, value]) => {
                ref.current!.style.setProperty(key, value ?? "", "important");
            });
        }
    }, [important]);

    return { ref, hasImportant };
};
