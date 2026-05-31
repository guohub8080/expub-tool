import type { I_NormalizedPicConfig } from "../types";

/**
 * 序列时间计算器
 *
 * 负责计算动画周期内的时间分配：
 * - 总周期时长
 * - 每张图片的延迟启动时间
 * - 每张图片在屏幕外的保持时间
 *
 * 总周期 = Σ(每张图的 switchDuration + stayDuration)
 * 例如 2 张图各 0.5+0.5 = 总周期 2.0 秒
 */

/** 总周期时长 = 所有图片的 (切换 + 停留) 之和 */
export const calculateTotalCycleDuration = (pics: I_NormalizedPicConfig[]): number => {
    return pics.reduce((total, pic) => total + pic.switchDuration + pic.stayDuration, 0);
};

/**
 * 计算第 index 张图片的延迟启动时间
 *
 * delay 作为 <animateTransform begin="..."> 的值。
 * 负值表示动画提前开始（SMIL 支持 begin 为负数）。
 *
 * 时序示例（2 张图，各 switch=0.5 stay=0.5，总周期=2.0s）：
 *   图0: delay = -0.5s  → 在周期 0.5s 处开始可见（进入完成）
 *   图1: delay = 0.5s   → 在图0停留结束后开始进入
 *
 * @param index - 图片索引
 * @param pics - 图片数组
 * @returns 延迟时间（秒），负数表示提前开始
 */
export const calculateDelayTime = (index: number, pics: I_NormalizedPicConfig[]): number => {
    if (index === 0) {
        // 第一张图需要"提前"启动，让它在周期起点就已到达中心
        return -pics[0].switchDuration;
    }

    // 后续图片：累加前面所有图的 (切换 + 停留)
    let delay = pics[0].stayDuration;
    for (let i = 1; i < index; i++) {
        delay += pics[i].switchDuration + pics[i].stayDuration;
    }

    return delay;
};

/**
 * 计算第 index 张图片的保持时间（在屏幕外等待的时间）
 *
 * 保持时间 = 总周期 - 自己的切换 - 自己的停留 - 下一张的切换
 * 这段时间图片停在屏幕外，等待自己的下一轮循环开始。
 *
 * @param index - 图片索引
 * @param pics - 图片数组
 * @param totalDuration - 总周期时长
 * @returns 保持时间（秒）
 */
export const calculateHoldTime = (
    index: number,
    pics: I_NormalizedPicConfig[],
    totalDuration: number
): number => {
    const currentPic = pics[index];
    const nextPic = pics[(index + 1) % pics.length];

    return (
        totalDuration
        - currentPic.switchDuration
        - currentPic.stayDuration
        - nextPic.switchDuration
    );
};
