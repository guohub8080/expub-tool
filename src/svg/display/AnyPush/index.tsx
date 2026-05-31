import SectionEx from "@html/basicEx/SectionEx"
import SvgEx from "@html/basicEx/SvgEx"
import defaultTo from "lodash/defaultTo"
import { SPACING_ZERO, spacing } from "@css-fn/spacing"
import type { T_SpacingProps } from "@css-fn/spacing"
import type { T_CanvasSize } from "@svg/types"
import useImgSize from "@utils/hooks/useImgSize"
import { ExPubGoConfig } from "@utils/provider/ExPubGoProvider"
import PushingImage from "./components/PushingImage"
import type { I_PicConfig } from "./types"
import { normalizePics } from "./utils/normalizer"
import { calculateTotalCycleDuration } from "./timeline/sequenceCalculator"

/**
 * AnyPush — 多图循环"推入"切换组件
 *
 * 效果演示：
 *   图片从不同方向（左/右/上/下）滑入屏幕中心，停留片刻后
 *   沿另一个方向滑出，多张图片交替执行形成无限循环。
 *
 * 渲染结构：
 *   SectionEx（根容器 + dev label）
 *   └─ section（overflow 裁剪，隐藏屏幕外的图片）
 *      └─ SvgEx（SVG 画布，viewBox 由 canvasSize 决定）
 *         └─ PushingImage × N（每张图片独立渲染 + 动画）
 *
 * @param props.canvasSize - 画布尺寸 { w, h }，url 模式可省略（自动从图片获取），item 模式必传
 * @param props.spacing - 外间距配置（mt/mb/ml/mr）
 * @param props.pics - 图片配置数组，每项包含 url 或 item + direction / switchDuration / stayDuration / keySplines
 */
const AnyPush = (props: {
  canvasSize?: T_CanvasSize
  spacing?: T_SpacingProps
  pics?: I_PicConfig[]
}) => {
  const spacingResult = spacing(defaultTo(props.spacing, SPACING_ZERO))
  const firstPic = props.pics?.[0]
  const firstUrl = firstPic?.url

  // item 模式没有 url，必须传 canvasSize
  if (!firstUrl && !firstPic?.item) return null
  if (!firstUrl && (!props.canvasSize?.w || !props.canvasSize?.h)) {
    throw new Error("`canvasSize` is required when using `item` mode (no `url` provided).")
  }

  // 解析画布尺寸：优先用 canvasSize，否则从图片 URL 异步获取真实尺寸
  const { size: resolvedSize } = useImgSize(firstUrl!, props.canvasSize?.w, props.canvasSize?.h)
  const w = resolvedSize.w
  const h = resolvedSize.h

  // 标准化图片配置（填充默认值、校验 url/item、处理单图复制）
  const pics = normalizePics(props.pics)
  // 预计算总周期时长，传给每张 PushingImage 用于组装时间线
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
