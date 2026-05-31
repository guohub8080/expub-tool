import type { I_NormalizedItemConfig } from "../types";

/** 总周期时长 = Σ(switch + stay) */
export const calculateTotalCycleDuration = (items: I_NormalizedItemConfig[]): number => {
    return items.reduce((total, item) => total + item.switchDuration + item.stayDuration, 0);
}
