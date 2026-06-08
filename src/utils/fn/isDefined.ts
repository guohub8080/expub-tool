import isNil from 'lodash/isNil'

/**
 * 判断值是否已定义（非 null 且非 undefined）。
 *
 * 相当于 `!isNil(value)`，提供更好的语义：用 `isDefined` 表示"非空"，
 * 用 `isNil` 表示"为空"，避免 `if (!x)` 的歧义。
 *
 * 作为 TypeScript 类型守卫使用时，会收窄为 NonNullable<T>。
 */
export const isDefined = <T>(value: T): value is NonNullable<T> => !isNil(value)
