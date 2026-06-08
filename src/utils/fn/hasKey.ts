/**
 * 检查对象是否拥有指定属性（含原型链），并提供类型守卫
 *
 * 与 lodash `has` 的区别：
 * - `has` 只查自身属性，不查原型链，返回 boolean（无类型收窄）
 * - `hasKey` 使用 `in` 运算符，查原型链 + 自身属性，提供 TypeScript 类型守卫
 *
 * 适用场景：区分联合类型（discriminated union）的分支收窄
 *
 * @example
 * type Config = { x: number; y: number } | { timeline: number[] }
 * if (hasKey(value, 'timeline')) {
 *   // value.timeline 可用，类型已收窄
 * }
 */
export const hasKey = <K extends string>(value: object, key: K): value is Record<K, unknown> =>
  key in value
