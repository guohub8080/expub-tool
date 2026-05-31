import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import type { T_CanvasSize } from "@svg/types"
import useImgSize from "@utils/hooks/useImgSize"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import PushingImage from "./components/PushingImage"
import type { PicConfig } from "./types"
import { normalizePics } from "./config/normalizer"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"

const AnyPush = (props: {
  canvasSize?: T_CanvasSize
  spacing?: T_SpacingProps
  pics?: PicConfig[]
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstUrl = props.pics?.[0]?.url
  if (!firstUrl) return null

  const { size: resolvedSize } = useImgSize(firstUrl, props.canvasSize?.w, props.canvasSize?.h)
  const w = resolvedSize.w
  const h = resolvedSize.h

  const pics = normalizePics(props.pics)
  const totalCycleDuration = calculateTotalCycleDuration(pics)
  const isDev = ExPubGoConfig().mode === 'development'

  return (
    <SectionEx
      {...(isDev ? { 'expubgo-label': 'any-push' } : {})}
      style={{
        WebkitTouchCallout: "none", userSelect: "text", overflow: "hidden",
        textAlign: "center", lineHeight: 0, ...spacingResult
      }}
    >
      <section style={{ overflow: "hidden", lineHeight: 0, margin: 0 }}>
        <SvgEx viewBox={`0 0 ${w} ${h}`}
          style={{ display: "block", margin: "0 auto" }}
          width="100%">
          {pics.map((pic, index) => (
            <PushingImage key={index} pic={pic}
              index={index} pics={pics}
              viewBoxW={w}
              viewBoxH={h}
              totalCycleDuration={totalCycleDuration} />
          ))}
        </SvgEx>
      </section>
    </SectionEx>
  )
}

export default AnyPush
