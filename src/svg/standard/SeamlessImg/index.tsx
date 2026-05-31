import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import type { T_CanvasSize } from '@svg/types'
import SeamlessImgDefault from './components/SeamlessImgDefault'
import SeamlessImgNatural from './components/SeamlessImgNatural'
import SeamlessImgPassthrough from './components/SeamlessImgPassthrough'
import SeamlessImgPopable from './components/SeamlessImgPopable'
import SeamlessImgTouchable from './components/SeamlessImgTouchable'
import SeamlessImgReplaceable from './components/SeamlessImgReplaceable'
import SeamlessImgLongPress from './components/SeamlessImgLongPress'

export type T_SeamlessImgMode =
  | 'default'
  | 'natural'
  | 'passthrough'
  | 'popable'
  | 'touchable'
  | 'replaceable'
  | 'longPress'

const MODE_MAP = {
  default: SeamlessImgDefault,
  natural: SeamlessImgNatural,
  passthrough: SeamlessImgPassthrough,
  popable: SeamlessImgPopable,
  touchable: SeamlessImgTouchable,
  replaceable: SeamlessImgReplaceable,
  longPress: SeamlessImgLongPress,
} as const

const CANVAS_SIZE_DEFAULT: Required<T_CanvasSize> = { w: 0, h: 0 }

interface SeamlessImgProps {
  url: string
  canvasSize?: T_CanvasSize
  spacing?: T_SpacingProps
  mode?: T_SeamlessImgMode
}

const SeamlessImg = (props: SeamlessImgProps) => {
  const w = defaultTo(props.canvasSize?.w, CANVAS_SIZE_DEFAULT.w)
  const h = defaultTo(props.canvasSize?.h, CANVAS_SIZE_DEFAULT.h)
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const mode = defaultTo(props.mode, 'default' as T_SeamlessImgMode)

  const Component = MODE_MAP[mode]
  return <Component w={w} h={h} url={props.url} spacingResult={spacingResult} />
}

export default SeamlessImg
