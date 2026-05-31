/**
 * AnyPush 组件的类型定义
 *
 * AnyPush 实现多图循环"推入"切换效果：
 * 每张图片从指定方向滑入屏幕中心，停留后沿另一方向滑出，
 * 多张图片交替执行形成无限循环的推入动画。
 *
 * 动画时间线（每张图片经历 4 个阶段）：
 *   进入段 → 停留段 → 退出段 → 保持段（在屏幕外等待自己的下一轮）
 *
 * 所有图片共享同一个总周期时长 (totalCycleDuration)，
 * 通过 delay 错开各自的启动时间，实现无缝循环。
 */

/** 滑入方向：L=左, R=右, T=上, B=下 */
export type T_Direction = "L" | "R" | "T" | "B";

/** 默认方向：从右侧滑入 */
export const DEFAULT_DIRECTION: T_Direction = "R";
/** 默认切换时长（秒） */
export const DEFAULT_SWITCH_DURATION = 0.5;
/** 默认停留时长（秒） */
export const DEFAULT_STAY_DURATION = 0.5;

/** 二维坐标点 */
export interface I_Point {
    x: number;
    y: number;
}

/**
 * 用户传入的单张图片配置
 * 所有字段均可选，缺失值由 normalizer 填充默认值
 */
export interface I_PicConfig {
    url: string;
    /** 滑入方向，默认 "R" */
    direction?: T_Direction;
    /** 从屏幕外滑入到中心的时长（秒），默认 0.5 */
    switchDuration?: number;
    /** 在中心停留的时长（秒），默认 0.5 */
    stayDuration?: number;
    /** 缓动贝塞尔曲线，默认 ease-in-out */
    keySplines?: string;
}

/**
 * 标准化后的图片配置 — 所有可选字段已填充默认值
 * 由 normalizer.ts 的 normalizePic() 生成
 */
export interface I_NormalizedPicConfig extends I_PicConfig {
    direction: T_Direction;
    switchDuration: number;
    stayDuration: number;
    keySplines: string;
}

/**
 * 时间线段 — 描述动画的一个阶段
 * 对应 transformTranslate 的一个 keyframe
 */
export interface I_TimelineSegment {
    /** 本段结束时的目标位移坐标（相对位移，因为 isRelativeMove=true） */
    to: I_Point;
    /** 本段持续时间（秒） */
    durationSeconds: number;
    /** 本段的缓动曲线 */
    keySpline: string;
}

/** 完整的时间线 = 有序的时间线段数组 */
export type T_AnimationTimeline = I_TimelineSegment[];

/** 时间计算结果集合（预留接口） */
export interface I_TimingCalculations {
    totalCycleDuration: number;
    delayTimeByIndex: (index: number) => number;
    holdTimeByIndex: (index: number) => number;
}
