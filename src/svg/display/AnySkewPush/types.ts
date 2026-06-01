import type { ReactNode } from "react"
import type { T_Direction4 } from "../../types"

export interface I_SkewConfig {
  /** skewX 或 skewY，决定斜切轴方向 */
  type: 'X' | 'Y'
  /** 斜切角度（度），正负决定倾斜方向，建议 0–45 */
  angle: number
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
   * 进入时的旋转角度（度），正值=顺时针，不传则进入无旋转
   * 以画布中心为旋转原点，进入起始角度，动画结束时归零
   */
  entryRotation?: number
  /**
   * 退出时的旋转角度（度），正值=顺时针，不传则退出无旋转
   * 以画布中心为旋转原点，从零开始动画到该角度
   */
  exitRotation?: number
  /** 停留时长（秒），图片全屏静止的持续时间，默认 2 */
  stayDuration?: number
  /**
   * 切换动画时长（秒），默认 2
   * 注意：当前图的退出时长由【下一张图】的 switchDuration 决定，
   * 因为下一张图进入时会覆盖当前图的退出，两者共享同一段时间。
   */
  switchDuration?: number
}
