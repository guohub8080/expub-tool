import type { I_NormalizedItemConfig } from "../types";

/** 总周期时长 = Σ(switch + stay) */
export const calculateTotalCycleDuration = (items: I_NormalizedItemConfig[]): number => {
    return items.reduce((total, item) => total + item.switchDuration + item.stayDuration, 0);
}

/**
 * item[index] 的 begin 偏移（秒）
 * = sum(item[0..index-1] 的 switch + stay)
 */
export const calculateBeginOffset = (index: number, items: I_NormalizedItemConfig[]): number => {
    let offset = 0
    for (let i = 0; i < index; i++) {
        offset += items[i].switchDuration + items[i].stayDuration
    }
    return offset
}
