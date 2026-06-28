import getClientRects from './range-get-client-rects'
import type { TextRect } from './range-get-client-rects'

/**
 * 收集元素内所有「文本片段」:遍历子节点,只取 Text 节点,
 * 每个文本节点调用 getClientRects 拿到它的渲染矩形 + 内容。
 *
 * 注意原版的隐含行为:
 * - Text 接口没有 .innerText,用 textContent 代替(原代码注释里也提到这点)
 * - 遇到空白开头的 Text 节点会 splitText(1),让浏览器重算布局,
 *   处理相邻节点间的隐式空格
 */
export default function getTextFragments(element: Element): TextRect[] | undefined {
  if (!element) return
  // element 是普通 Element,只有 HTMLElement 才有 innerText;此处保留原版判断
  if (!(element as HTMLElement).innerText) return
  if (!element.childNodes.length) return

  let fragments: TextRect[] = []

  for (const node of element.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    if (!node.textContent?.length) continue

    const textNode = node as Text

    // 遇到空白开头的文本节点:splitText(1) 让浏览器重算布局
    // (处理相邻 inline 元素之间的隐式空格)
    if (/^\s/.test(textNode.textContent)) {
      textNode.splitText(1)
    }

    fragments = fragments.concat(getClientRects(textNode))
  }

  return fragments
}
