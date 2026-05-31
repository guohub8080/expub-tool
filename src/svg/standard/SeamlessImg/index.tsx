import defaultTo from 'lodash/defaultTo'
import { spacing, SPACING_ZERO } from '@css-fn/spacing'
import type { T_SpacingProps } from '@css-fn/spacing'
import type { T_CanvasSize } from '@svg/types'
import SeamlessImg1 from './components/SeamlessImg1'
import SeamlessImg2 from './components/SeamlessImg2'
import SeamlessImg3 from './components/SeamlessImg3'
import SeamlessImg4 from './components/SeamlessImg4'
import SeamlessImg5 from './components/SeamlessImg5'
import SeamlessImg6 from './components/SeamlessImg6'
import SeamlessImg7 from './components/SeamlessImg7'

const CANVAS_SIZE_DEFAULT: Required<T_CanvasSize> = { w: 0, h: 0 }

interface SeamlessImgProps {
    url: string
    canvasSize?: T_CanvasSize
    spacing?: T_SpacingProps
    isNaturalPriority?: boolean
    isEventThrough?: boolean
    isPopable?: boolean
    isTouchForced?: boolean
    isReplaceableAfterPublish?: boolean
    isLongPressOnly?: boolean
}

const SeamlessImg = (props: SeamlessImgProps) => {
    const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
    const w = defaultTo(props.canvasSize?.w, CANVAS_SIZE_DEFAULT.w)
    const h = defaultTo(props.canvasSize?.h, CANVAS_SIZE_DEFAULT.h)

    const commonProps = { w, h, url: props.url, spacingResult }

    if (props.isLongPressOnly) return <SeamlessImg7 {...commonProps} />
    if (props.isReplaceableAfterPublish) return <SeamlessImg6 {...commonProps} />
    if (props.isTouchForced) return <SeamlessImg5 {...commonProps} />
    if (props.isPopable) return <SeamlessImg4 {...commonProps} />
    if (props.isEventThrough) return <SeamlessImg3 {...commonProps} />
    if (props.isNaturalPriority) return <SeamlessImg2 {...commonProps} />
    return <SeamlessImg1 {...commonProps} />
}

export default SeamlessImg
