import svgURL from "@utils/svg/svgURL"
import type { I_CanvasBg, T_CanvasBgPosition } from "@svg/types"
import defaultTo from 'lodash/defaultTo'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import { isDefined } from '@utils/fn/isDefined'

/**
 * 九宫格 position → CSS backgroundPosition 映射
 */
const POSITION_MAP: Record<T_CanvasBgPosition, string> = {
  center: 'center center',
  left: 'left center',
  right: 'right center',
  top: 'center top',
  bottom: 'center bottom',
  topLeft: 'left top',
  topRight: 'right top',
  bottomLeft: 'left bottom',
  bottomRight: 'right bottom',
}

/**
 * 校验颜色值是否为合法的 hex / rgb / rgba 格式
 *
 * 合法示例：#fff, #ffffff, #ffffffff, rgb(0,0,0), rgba(0,0,0,0.5)
 */
const COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/

const isValidColor = (color: string): boolean => COLOR_RE.test(color.trim())

/**
 * 解析画布背景配置，返回 CSS style 对象。
 *
 * 适配规则：
 * - stretch（默认）: backgroundSize: '100% 100%'，position 无意义，忽略
 * - cover:  backgroundSize: 'cover'，position 决定裁剪锚点
 * - contain: backgroundSize: 'contain'，position 决定留白位置
 * - tile:   backgroundRepeat: 'repeat'，自然尺寸平铺，position 决定起始对齐
 *
 * 校验：
 * - canvasBg 未传 / 空对象 → 无背景，返回 {}
 * - 传了但既没有 url 也没有 color → 报错
 * - color 必须符合 hex (#xxx / #xxxxxx / #xxxxxxxx) 或 rgb/rgba 格式，否则报错
 */
export const resolveCanvasBg = (canvasBg?: I_CanvasBg): Record<string, string> => {
  if (isEmpty(canvasBg)) return {}

  if (isDefined(canvasBg.url) && isDefined(canvasBg.color)) {
    throw new Error('resolveCanvasBg: canvasBg can only provide one of "url" or "color", not both')
  }

  if (isNil(canvasBg.url) && isNil(canvasBg.color)) {
    throw new Error('resolveCanvasBg: canvasBg must provide one of "url" or "color"')
  }

  const style: Record<string, string> = {}

  if (isDefined(canvasBg.color)) {
    if (!isValidColor(canvasBg.color)) {
      throw new Error(`resolveCanvasBg: invalid color format "${canvasBg.color}". Expected hex (#fff, #ffffff, #ffffffff) or rgb/rgba (rgb(0,0,0), rgba(0,0,0,0.5))`)
    }
    style.backgroundColor = canvasBg.color
  }

  // 背景图
  if (isDefined(canvasBg.url)) {
    style.backgroundImage = svgURL(canvasBg.url)

    const fit = defaultTo(canvasBg.fit, 'stretch')
    const pos = defaultTo(canvasBg.position, 'center')

    switch (fit) {
      case 'stretch':
        style.backgroundSize = '100% 100%'
        // stretch 铺满，position 无意义，忽略
        break
      case 'cover':
        style.backgroundSize = 'cover'
        style.backgroundPosition = POSITION_MAP[pos]
        break
      case 'contain':
        style.backgroundSize = 'contain'
        style.backgroundPosition = POSITION_MAP[pos]
        break
      case 'tile':
        style.backgroundRepeat = 'repeat'
        style.backgroundPosition = POSITION_MAP[pos]
        break
    }
  }

  return style
}
