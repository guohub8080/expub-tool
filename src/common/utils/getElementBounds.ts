

/**
 * 元素边界信息类型
 *
 * 定义了二维平面上一个矩形区域的基本属性：
 * - x, y: 矩形左上角的坐标（相对于某个坐标系）
 * - w, h: 矩形的宽度和高度
 *
 * 所有尺寸单位由调用方决定（像素、百分比、视口单位等）
 */
export type ElementBoundsType = { x?: number, y?: number, w: number, h: number }

/**
 * 获取元素的规范化边界信息
 *
 * 将可能缺少 x/y 坐标的边界对象转换为完整对象，
 * 缺失的 x/y 默认填充为 0。
 *
 * @param element - 元素边界信息对象，x 和 y 为可选
 * @returns 完整的边界信息对象，包含 x, y, w, h 四个属性
 *
 * @example
 * ```ts
 * // 完整参数
 * getElementBounds({ x: 10, y: 20, w: 100, h: 200 });
 * // { x: 10, y: 20, w: 100, h: 200 }
 *
 * // 省略 x, y（常用于以原点为起点的元素）
 * getElementBounds({ w: 100, h: 200 });
 * // { x: 0, y: 0, w: 100, h: 200 }
 * ```
 */
export const getElementBounds = (element: ElementBoundsType) => {
    // 解构赋值，x 和 y 提供默认值 0
    // 如果 element.x 或 element.y 为 undefined，则使用默认值
    const { x = 0, y = 0, w, h } = element;
    return {
        x,
        y,
        w,
        h
    }
}

/**
 * 原点位置类型
 *
 * 支持 9 种快捷位置 + 2 种特殊位置：
 * - 9 种基于元素边界的快捷位置：将元素边界映射到 9 个特征点
 * - origin: 特殊位置，固定返回坐标系原点 (0, 0)
 *
 * 命名规则：
 * - 第一词表示垂直位置：top(顶部) / center(中部) / bottom(底部)
 * - 第二词表示水平位置：Left(左侧) / Center(中心) / Right(右侧)
 */
export type OriginPosition =
  | 'topLeft'       // 左上角：元素的 x, y 坐标
  | 'topCenter'     // 顶部中心：元素上边中点
  | 'topRight'      // 右上角：元素右上角坐标
  | 'centerLeft'    // 左侧中心：元素左边中点
  | 'center'        // 中心：元素几何中心
  | 'centerRight'   // 右侧中心：元素右边中点
  | 'bottomLeft'    // 左下角：元素左下角坐标
  | 'bottomCenter'  // 底部中心：元素下边中点
  | 'bottomRight'   // 右下角：元素右下角坐标
  | 'origin';       // 坐标原点 (0, 0)，与元素边界无关

/**
 * 根据快捷位置文本获取元素的具体坐标
 *
 * 将人类可读的位置名称（如 'center'、'topLeft'）转换为具体的 [x, y] 坐标值。
 * 常用于：
 * - SVG 中设置 transform-origin
 * - 计算元素锚点位置
 * - 图形对齐操作
 *
 * @param originText - 快捷位置文本，见 OriginPosition 类型定义
 * @param element - 元素边界信息，定义了矩形的 x, y, w, h
 * @returns 坐标数组 [x, y]，表示该位置在坐标系中的具体坐标
 *
 * @example
 * ```ts
 * const bounds = { x: 100, y: 50, w: 200, h: 150 };
 *
 * getOriginNumByText('topLeft', bounds);      // [100, 50]
 * getOriginNumByText('topCenter', bounds);    // [200, 50]   — 上边中点
 * getOriginNumByText('center', bounds);       // [200, 125]  — 几何中心
 * getOriginNumByText('bottomRight', bounds);  // [300, 200]  — 右下角
 * getOriginNumByText('origin', bounds);       // [0, 0]      — 坐标原点（忽略元素位置）
 * ```
 */
export const getOriginNumByText = (
  originText: OriginPosition,
  element: ElementBoundsType
): [number, number] => {
    // 特殊情况：坐标原点
    // 'origin' 是一个特殊值，始终返回 (0, 0)，与元素边界无关
    if (originText === 'origin') {
        return [0, 0];
    }

    // 获取规范化后的边界信息（确保 x, y 有值）
    const { x, y, w, h } = getElementBounds(element);

    // 预计算常用中间值，避免重复计算
    const centerX = x + w / 2;  // 元素水平中心线 x 坐标
    const centerY = y + h / 2;  // 元素垂直中心线 y 坐标
    const right = x + w;        // 元素右边缘 x 坐标
    const bottom = y + h;       // 元素下边缘 y 坐标

    // 位置映射表：将每种 OriginPosition 映射到对应的 [x, y] 坐标
    // Exclude<OriginPosition, 'origin'> 表示排除 'origin' 后的所有位置类型
    const positionMap: Record<Exclude<OriginPosition, 'origin'>, [number, number]> = {
        topLeft: [x, y],              // 左上角
        topCenter: [centerX, y],      // 上边中点
        topRight: [right, y],         // 右上角
        centerLeft: [x, centerY],     // 左边中点
        center: [centerX, centerY],   // 几何中心
        centerRight: [right, centerY],// 右边中点
        bottomLeft: [x, bottom],      // 左下角
        bottomCenter: [centerX, bottom],// 下边中点
        bottomRight: [right, bottom], // 右下角
    };

    // 从映射表中查找并返回对应坐标
    return positionMap[originText];
}
