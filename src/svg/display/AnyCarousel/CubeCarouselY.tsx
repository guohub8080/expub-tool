import AnyCarousel, { type I_AnyCarouselProps } from "./index"
import type { I_ChildTransform } from "./types"

/** 单个角色的 cube 配置：skewX 绕左边 + translate（X 交叉补偿）。缓动用 AnyCarousel 默认（ease-in-out） */
const cubeChannel = (skewValue: number, translateX: number): I_ChildTransform => ({
  skewX: { value: skewValue, childCanvasPivot: "Left" },
  translate: { x: translateX },
})

export type I_CubeCarouselYProps = Omit<
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
 * CubeCarouselY — Y 方向立方体轮播（AnyCarousel 的 cube 快捷装载，CubeCarouselX 的纵向镜像）
 *
 * 与 CubeCarouselX 对称：纵向流（angle=90），skewX 绕左边 + translate（X 交叉补偿）。
 * 用户只给 `skewAngle`，内部按「接缝对齐」自动算出每个角色的 skewX + translate：
 * - t1（next/last，与 center 接缝对齐）= (h/2)·tan(skewAngle)
 * - t2（nextOut/lastOut，与 next/last 接缝对齐）= h·tan(skewAngle) + (h/2)·tan(2·skewAngle)
 *
 * skew 值：next/last = ±skewAngle，out = ±2·skewAngle；pivot 都在 Left。
 * 强制 angle=90（纵向流）、childGap=0（面无缝）。
 * `isReversed`：翻 angle（90↔270）+ 翻 skew 符号 → 立方体反向转动；translate 不变
 * （skew 符号与接缝角同时翻转、互相抵消，接缝仍对齐）。
 * 其余全部走 AnyCarousel 默认：缓动 ease-in-out、mainChildCenter = 画布正中心、stay 默认 1.0。
 */
export const CubeCarouselY = ({ skewAngle = 15, isReversed = false, childCanvasSize, ...rest }: I_CubeCarouselYProps) => {
  const h = childCanvasSize.h
  const rad = (a: number) => (a * Math.PI) / 180
  const t1 = (h / 2) * Math.tan(rad(skewAngle))
  const t2 = h * Math.tan(rad(skewAngle)) + (h / 2) * Math.tan(rad(2 * skewAngle))
  const sign = isReversed ? -1 : 1

  return (
    <AnyCarousel
      {...rest}
      childCanvasSize={childCanvasSize}
      angle={isReversed ? 270 : 90}
      childGap={0}
      centerChildConfig={cubeChannel(0, 0)}
      nextChildConfig={cubeChannel(sign * -skewAngle, t1)}
      lastChildConfig={cubeChannel(sign * skewAngle, t1)}
      nextOutWindowConfig={cubeChannel(sign * -2 * skewAngle, t2)}
      lastOutWindowConfig={cubeChannel(sign * 2 * skewAngle, t2)}
    />
  )
}

export default CubeCarouselY
