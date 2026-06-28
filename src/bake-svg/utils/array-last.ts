/** 返回数组最后一个元素,空数组返回 undefined */
export default function lastOf<T>(arr: readonly T[]): T | undefined {
  return arr[arr.length - 1]
}
