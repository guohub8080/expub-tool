/**
 * 把文本节点按字符逐一切片,对每片建 Range 取 clientRects,
 * 记录每片文本及其最终矩形,并打包成 DocumentFragment。
 *
 * 用于 dom-get-text-fragments:得到「每行/每段文本 → 其渲染矩形」的映射。
 * (文字的逐字位置由 index.ts 直接对每个字符建 Range 独立测量,不经过这里)
 */
export interface TextRect {
  rect: DOMRect
  text: string
  fragment: DocumentFragment
}

export default function getClientRects(
  node: Text,
  text: string = node.textContent || ''
): TextRect[] {
  const range = document.createRange()
  const rects: Array<TextRect & { text: string }> = []

  for (let i = 0; i < node.length; i++) {
    range.setStart(node, 0)
    range.setEnd(node, i + 1)

    const clientRects = range.getClientRects()
    const index = clientRects.length - 1

    rects[index] = rects[index] ?? { text: '', rect: undefined as unknown as DOMRect }
    rects[index].rect = clientRects[index]
    rects[index].text += text.charAt(i)
  }

  return rects.map(rect => {
    const fragment = new DocumentFragment()
    fragment.textContent = rect.text
    return { rect: rect.rect, text: rect.text, fragment }
  })
}
