import isNil from 'lodash/isNil'
import SvgEx from "@html/basicEx/SvgEx"
import svgURL from "@utils/svg/svgURL"
import type { I_NormalizedStackItem } from "../StackCarouselX/types"

type ItemImageProps = {
  item: I_NormalizedStackItem
  imageW: number
  imageH: number
}

const buildLinkRect = (item: I_NormalizedStackItem, imageW: number, imageH: number) => {
  if (isNil(item.link)) return null
  return (
    <a
      href={item.link}
      target="_blank"
      style={{ display: "inline-block", width: "100%", height: "100%", color: "transparent" }}
    >
      <rect x={0} y={0} width={imageW} height={imageH} opacity={0} fill="transparent" style={{ pointerEvents: "painted" }} />
    </a>
  )
}

export const ItemImage = ({ item, imageW, imageH }: ItemImageProps) => {
  if (item.useItem) {
    return <>{item.jsx}</>
  }

  return (
    <SvgEx
      viewBox={`0 0 ${imageW} ${imageH}`}
      style={{
        backgroundImage: svgURL(item.url!),
        backgroundSize: "cover",
        pointerEvents: "visible",
        width: "100%",
      }}
    >
      {buildLinkRect(item, imageW, imageH)}
    </SvgEx>
  )
}
