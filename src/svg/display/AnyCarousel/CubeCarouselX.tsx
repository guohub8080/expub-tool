import AnyCarousel, { type I_AnyCarouselProps } from "./index"
import type { I_ChildTransform } from "./types"

/** 单个角色的 cube 配置：skewY 绕底边 + translate（Y 交叉补偿）。缓动用 AnyCarousel 默认（ease-in-out） */
const cubeChannel = (skewValue: number, translateY: number): I_ChildTransform => ({
  skewY: { value: skewValue, childCanvasPivot: "Bottom" },
  translate: { y: translateY },
})

export type I_CubeCarouselXProps = Omit<
  I_AnyCarouselProps,
  | "centerChildConfig" | "lastChildConfig" | "nextChildConfig"
  | "outWindowConfig" | "nextOutWindowConfig" | "lastOutWindowConfig"
  | "angle" | "childGap"
> & {
  /** 立方体斜切角度（度），默认 15；越大面越斜 */
  skewAngle?: number
}

/**
 * CubeCarouselX — X 方向立方体轮播（AnyCarousel 的 cube 快捷装载）
 *
 * 用户只给 `skewAngle`，内部按「接缝对齐」自动算出每个角色的 skewY + translate（Y 交叉补偿）：
 * - t1（next/last，与 center 接缝对齐）= (w/2)·tan(skewAngle)
 * - t2（nextOut/lastOut，与 next/last 接缝对齐）= w·tan(skewAngle) + (w/2)·tan(2·skewAngle)
 *
 * skew 值：next/last = ±skewAngle，out = ±2·skewAngle；pivot 都在 Bottom。
 * 强制 angle=0（横向流）、childGap=0（面无缝）。
 * 其余全部走 AnyCarousel 默认：缓动 ease-in-out、mainChildCenter = 画布正中心、stay 默认 1.0。
 * 用户可通过透传 props 覆盖（如 globalSlideKeySplines、mainChildCenter、各 item 的 stayDuration 等）。
 */
export const CubeCarouselX = ({ skewAngle = 15, childCanvasSize, ...rest }: I_CubeCarouselXProps) => {
  const w = childCanvasSize.w
  const rad = (a: number) => (a * Math.PI) / 180
  const t1 = (w / 2) * Math.tan(rad(skewAngle))
  const t2 = w * Math.tan(rad(skewAngle)) + (w / 2) * Math.tan(rad(2 * skewAngle))

  return (
    <AnyCarousel
      {...rest}
      childCanvasSize={childCanvasSize}
      angle={0}
      childGap={0}
      centerChildConfig={cubeChannel(0, 0)}
      nextChildConfig={cubeChannel(-skewAngle, t1)}
      lastChildConfig={cubeChannel(skewAngle, t1)}
      nextOutWindowConfig={cubeChannel(-2 * skewAngle, t2)}
      lastOutWindowConfig={cubeChannel(2 * skewAngle, t2)}
    />
  )
}

export default CubeCarouselX
