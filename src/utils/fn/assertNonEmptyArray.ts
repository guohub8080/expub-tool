import { isArray, isEmpty } from 'lodash';

/**
 * 验证值是否为非空数组，否则抛出错误
 *
 * TypeScript 断言函数（asserts value is T[]），调用后 TypeScript 编译器
 * 会收窄类型，将 value 识别为 T[] 类型。
 *
 * @param value      - 要验证的值
 * @param paramName  - 参数名称（用于错误信息），默认为 'array'
 * @throws {Error} 如果值不是数组或数组为空
 */
export function assertNonEmptyArray<T>(value: unknown, paramName: string = 'array'): asserts value is T[] {
  if (!isArray(value) || isEmpty(value)) {
    throw new Error(`${paramName} 必须是非空数组`);
  }
}
