import { isArray, isEmpty } from 'lodash';

/**
 * 检查值是否为非空数组
 *
 * TypeScript 类型守卫函数（value is T[]），返回 boolean。
 * 与 assertNonEmptyArray 的区别：不抛错，适合条件判断。
 *
 * @param value - 要检查的值
 * @returns 如果是非空数组返回 true，否则返回 false
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return isArray(value) && !isEmpty(value);
}
