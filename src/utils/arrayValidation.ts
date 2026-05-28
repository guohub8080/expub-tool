/**
 * genSvgAnimate 工具函数集
 *
 * 提供数组相关的类型守卫和断言工具，用于在运行时验证数据结构的合法性。
 * 主要用于 SVG 动画配置等需要确保数组参数有效性的场景。
 */

import { isArray, isEmpty } from 'lodash';

// ============================================ 非空数组验证 ============================================

/**
 * 验证值是否为非空数组，否则抛出错误
 *
 * TypeScript 断言函数（asserts value is T[]），调用后 TypeScript 编译器
 * 会收窄类型，将 value 识别为 T[] 类型。
 *
 * 使用场景：
 * - 函数参数校验：确保传入的数组参数既存在又有内容
 * - 防御性编程：在操作数组前确保其合法性，避免后续出现空引用或越界错误
 * - 配合 TypeScript 类型收窄：调用后无需额外类型检查即可安全使用数组方法
 *
 * @param value - 要验证的值，类型为 unknown 表示接受任何值
 * @param paramName - 参数名称（用于错误信息），默认为 'array'
 * @throws {Error} 如果值不是数组或数组为空，抛出带有描述信息的错误
 *
 * @example
 * ```ts
 * function processItems(items: unknown) {
 *   assertNonEmptyArray<string>(items, 'items');
 *   // 此处 TypeScript 知道 items 是 string[] 类型
 *   items.forEach(item => console.log(item.toUpperCase()));
 * }
 *
 * assertNonEmptyArray(timeline, 'timeline')  // 通过验证，不抛错
 * assertNonEmptyArray([], 'timeline')         // 抛出 Error: timeline 必须是非空数组
 * assertNonEmptyArray(null, 'timeline')       // 抛出 Error: timeline 必须是非空数组
 * assertNonEmptyArray('not array', 'data')    // 抛出 Error: data 必须是非空数组
 * ```
 */
export function assertNonEmptyArray<T>(value: unknown, paramName: string = 'array'): asserts value is T[] {
  // 使用 lodash 的 isArray 检查是否为数组
  // 使用 lodash 的 isEmpty 检查数组是否为空（长度为 0）
  if (!isArray(value) || isEmpty(value)) {
    throw new Error(`${paramName} 必须是非空数组`);
  }
}

/**
 * 检查值是否为非空数组
 *
 * TypeScript 类型守卫函数（value is T[]），返回 boolean 的同时
 * 告诉编译器如果返回 true，则 value 可以被当作 T[] 使用。
 *
 * 与 assertNonEmptyArray 的区别：
 * - isNonEmptyArray 返回布尔值，不会抛出错误，适合条件判断
 * - assertNonEmptyArray 在验证失败时抛出错误，适合前置校验
 *
 * @param value - 要检查的值，类型为 unknown 表示接受任何值
 * @returns 如果是非空数组返回 true，否则返回 false
 * @returns {value is T[]} 类型守卫：返回 true 时，value 被识别为 T[]
 *
 * @example
 * ```ts
 * const data: unknown = fetchData();
 *
 * if (isNonEmptyArray<string>(data)) {
 *   // 此处 TypeScript 知道 data 是 string[] 类型
 *   data.forEach(str => console.log(str.length));
 * } else {
 *   console.log('数据无效');
 * }
 *
 * isNonEmptyArray([1, 2, 3])   // true
 * isNonEmptyArray([])           // false — 空数组
 * isNonEmptyArray(null)         // false — null 不是数组
 * isNonEmptyArray('string')     // false — 字符串不是数组
 * isNonEmptyArray({ length: 3 }) // false — 类数组对象不是真正数组
 * ```
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  // 同时满足两个条件：
  // 1. 是数组（使用 lodash isArray，比原生 Array.isArray 更严格，可处理跨 iframe 场景）
  // 2. 非空（使用 lodash isEmpty，对数组检查 length === 0）
  return isArray(value) && !isEmpty(value);
}
