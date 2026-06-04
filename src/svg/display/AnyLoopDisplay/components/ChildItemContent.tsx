import SvgEx from "@html/basicEx/SvgEx"
import svgURL from "@utils/svg/svgURL"
import type { I_NormalizedChildItem } from "../utils/normalizer"

/**
 * ChildItemContent — 渲染单个子项的图片内容（url 模式或 jsx 模式）。
 *
 * 坐标系以画布中心为原点，这里通过 translate 平移回左上角，
 * 使 foreignObject 内的内容正确对齐。
 */
export const renderChildItemContent = ({
  item,
  contentWidth,
  contentHeight,
}: {
  /** 当前子项的标准化配置 */
  item: I_NormalizedChildItem
  /** 内容区域宽度（已扣除 itemGap） */
  contentWidth: number
  /** 内容区域高度（已扣除 itemGap） */
  contentHeight: number
}) => (
  <g transform={`translate(${-contentWidth / 2}, ${-contentHeight / 2})`}>
    <foreignObject x={0} y={0} width={contentWidth + 1} height={contentHeight + 1}>
      {item.jsx
        ? item.jsx
        : <SvgEx viewBox={`0 0 ${contentWidth + 1} ${contentHeight + 1}`}
          style={{
            backgroundImage: svgURL(item.url!), backgroundSize: "cover",
            backgroundPosition: "50% 50%", backgroundRepeat: "no-repeat",
            width: "100%", display: "block", boxSizing: "border-box",
          }} />
      }
    </foreignObject>
  </g>
)
