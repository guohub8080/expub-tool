/**
 * 异步深度优先遍历 DOM。
 *
 * 对每个节点调用 callback,然后对其 children 按 sort 排序后递归。
 * 排序用于让 walk 的访问顺序匹配视觉堆叠顺序(按 z-index)。
 */

export type WalkSort = (a: Element, b: Element) => number

export interface WalkOptions {
  sort?: WalkSort
}

export type WalkCallback = (element: Element, depth: number, index: number) => void | Promise<void>

async function walk(
  element: Element,
  callback: WalkCallback,
  { sort = () => 1 }: WalkOptions = {},
  depth = 0,
  index = 0
): Promise<void> {
  await callback(element, depth, index)

  const children = Array.from(element.children).sort(sort)
  for (let i = 0; i < children.length; i++) {
    await walk(children[i], callback, { sort }, depth + 1, i)
  }
}

export default walk
