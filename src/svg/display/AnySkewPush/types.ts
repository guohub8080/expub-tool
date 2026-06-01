import type { ReactNode } from "react"
import type { T_Direction4 } from "@svg/types"

export interface I_SkewConfig {
  /** skewX 或 skewY，决定斜切轴方向 */
  type: 'X' | 'Y'
  /** 斜切角度（度），正负决定倾斜方向，建议 0–45 */
  angle: number
}

/** 旋转中心：九宫格预设 或 自定义坐标 */
export type T_RotationOrigin =
  | 'TopLeft' | 'Top' | 'TopRight'
  | 'Left'   | 'Center' | 'Right'
  | 'BottomLeft' | 'Bottom' | 'BottomRight'
  | { cx: number; cy: number }

/** 旋转配置 */
export interface I_RotationConfig {
  /** 旋转中心，默认 Center（画布中心） */
  origin?: T_RotationOrigin
  /** 旋转角度（度），正值=顺时针，默认 0（无旋转） */
  angle?: number
  /** 缓动曲线，默认 ease-in-out */
  keySplines?: string
}

export interface I_AnySkewPushChildItem {
  /** 图片地址（与 jsx 二选一） */
  url?: string
  /** 自定义 React 内容（与 url 二选一） */
  jsx?: ReactNode
  /**
   * 进入方向：图片从哪个方向推入画布，默认 T（从上方进入）
   * T = 从上方进入，B = 从下方，L = 从左，R = 从右
   */
  entryDirection?: T_Direction4
  /**
   * 退出方向：图片向哪个方向推出画布，默认与进入方向相反（T↔B，L↔R）
   * 可独立配置，例如从上进入、从右退出
   */
  exitDirection?: T_Direction4
  /**
   * 进入时的 skew 变换配置，不传则进入无 skew
   * angle 为进入起始角度，动画结束时归零（全屏静止时无 skew）
   */
  entrySkew?: I_SkewConfig
  /**
   * 退出时的 skew 变换配置，不传则退出无 skew
   * angle 为退出终止角度，从零开始动画到该角度
   */
  exitSkew?: I_SkewConfig
  /**
   * 进入时的旋转配置，不传则进入无旋转
   * angle 为旋转起始角度（正值=顺时针），动画结束时归零
   * origin 为旋转中心，默认 Center（画布中心）
   */
  entryRotation?: I_RotationConfig
  /**
   * 退出时的旋转配置，不传则退出无旋转
   * angle 为旋转终止角度（正值=顺时针），从零开始动画到该角度
   * origin 为旋转中心，默认 Center（画布中心）
   */
  exitRotation?: I_RotationConfig
  /** 停留时长（秒），图片全屏静止的持续时间，默认 2 */
  stayDuration?: number
  /**
   * 切换动画时长（秒），默认 2
   * 注意：当前图的退出时长由【下一张图】的 switchDuration 决定，
   * 因为下一张图进入时会覆盖当前图的退出，两者共享同一段时间。
   */
  switchDuration?: number
}
