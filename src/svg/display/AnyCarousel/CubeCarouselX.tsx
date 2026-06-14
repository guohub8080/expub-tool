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
  /** 反向旋转（立方体反向转动），默认 false */
  isReversed?: boolean
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
 * `isReversed`：翻 angle（0↔180）+ 翻 skew 符号 → 立方体反向转动；translate 不变
 * （skew 符号与接缝角同时翻转、互相抵消，接缝仍对齐）。
 * 其余全部走 AnyCarousel 默认：缓动 ease-in-out、mainChildCenter = 画布正中心、stay 默认 1.0。
 * 用户可通过透传 props 覆盖。
 */
export const CubeCarouselX = ({ skewAngle = 15, isReversed = false, childCanvasSize, ...rest }: I_CubeCarouselXProps) => {
  const w = childCanvasSize.w
  const rad = (a: number) => (a * Math.PI) / 180
  const t1 = (w / 2) * Math.tan(rad(skewAngle))
  const t2 = w * Math.tan(rad(skewAngle)) + (w / 2) * Math.tan(rad(2 * skewAngle))
  const sign = isReversed ? -1 : 1

  return (
    <AnyCarousel
      {...rest}
      childCanvasSize={childCanvasSize}
      angle={isReversed ? 180 : 0}
      childGap={0}
      centerChildConfig={cubeChannel(0, 0)}
      nextChildConfig={cubeChannel(sign * -skewAngle, t1)}
      lastChildConfig={cubeChannel(sign * skewAngle, t1)}
      nextOutWindowConfig={cubeChannel(sign * -2 * skewAngle, t2)}
      lastOutWindowConfig={cubeChannel(sign * 2 * skewAngle, t2)}
    />
  )
}

export default CubeCarouselX
