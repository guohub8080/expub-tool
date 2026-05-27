import { useState, useEffect } from "react"
import { defaultTo } from "lodash-es"
import getImgSizeAsync from "../utils/getImgSizeAsync"

/**
 * React Hook：获取图片尺寸，优先使用传入的默认值，其次异步加载获取
 *
 * 同步返回初始值，同时后台异步加载图片真实尺寸。
 * 加载完成后自动更新状态，触发组件重新渲染。
 *
 * 优先级：
 * 1. 传入的 w/h（任一 > 0）→ 直接使用，不发起网络请求
 * 2. 未传入 → 异步加载图片获取原始尺寸
 * 3. 加载失败 → 保持默认值 0
 *
 * @param url - 图片 URL
 * @param w - 默认宽度
 * @param h - 默认高度
 * @returns { size, loading, error }
 *   - size: 当前尺寸 { w, h }，加载成功后会自动更新
 *   - loading: 是否正在加载
 *   - error: 是否加载失败
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { size, loading } = useImgSize('https://example.com/img.png')
 *   return <svg><image href="..." width={size.w} height={size.h} /></svg>
 * }
 * ```
 */
const useImgSize = (url: string, w?: number, h?: number) => {
    const imgW = defaultTo(w, 0)
    const imgH = defaultTo(h, 0)
    const hasDefault = imgW + imgH > 0

    const [size, setSize] = useState({ w: imgW, h: imgH })
    const [loading, setLoading] = useState(!hasDefault)
    const [error, setError] = useState(false)

    useEffect(() => {
        // 有默认值，不需要异步加载
        if (hasDefault) {
            setSize({ w: imgW, h: imgH })
            setLoading(false)
            setError(false)
            return
        }

        // 无默认值，异步加载
        setLoading(true)
        setError(false)

        getImgSizeAsync(url).then(result => {
            if (result.isSuccess) {
                setSize({ w: result.w, h: result.h })
                setError(false)
            } else {
                setError(true)
            }
            setLoading(false)
        })
    }, [url, w, h])

    return { size, loading, error }
}

export default useImgSize
