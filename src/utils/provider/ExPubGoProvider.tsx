import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

/**
 * 运行模式，模仿 Vite 的 mode 概念
 *
 * - development — 开发模式，组件输出 expubgo-label 等调试属性
 * - production  — 生产模式，不输出调试信息
 */
export type T_ExPubGoMode = 'development' | 'production'

/**
 * ExPubGo 全局配置
 *
 * @property mode      - 运行模式，默认 'production'
 * @property watermark - 全局水印属性，会展开到所有 xxxEx 组件的根元素上（如 powered-by、copyright 等）
 */
export interface I_ExPubGoConfig {
  mode: T_ExPubGoMode
  watermark?: Record<string, any>
}

const ExpubContext = createContext<I_ExPubGoConfig>({ mode: 'production' })

/**
 * ExPubGoProvider — 全局配置 Provider
 *
 * 在 App 最外层包裹，为所有 expub-tool 组件提供共享配置。
 *
 * @param mode      - 运行模式：'development' 输出调试属性（expubgo-label），'production' 不输出
 * @param watermark - 全局水印属性（如 powered-by、copyright），展开到所有 xxxEx 组件根元素上
 *
 * @example
 * ```tsx
 * <ExPubGoProvider mode="development" watermark={{ 'powered-by': 'expubgo' }}>
 *   <App />
 * </ExPubGoProvider>
 * ```
 */
export const ExPubGoProvider = ({ mode = 'production', watermark, children }: {
  mode?: T_ExPubGoMode
  watermark?: Record<string, any>
  children: ReactNode
}) => (
  <ExpubContext.Provider value={{ mode, watermark }}>
    {children}
  </ExpubContext.Provider>
)

/**
 * ExPubGoConfig — 获取当前 expub-tool 全局配置
 *
 * 在任意 expub-tool 组件内部调用，读取 ExPubGoProvider 注入的配置。
 * 未包裹 Provider 时返回默认值 `{ mode: 'production' }`。
 */
export const ExPubGoConfig = () => useContext(ExpubContext)
