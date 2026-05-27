import { isNil } from 'lodash';

/**
 * 异步获取图片尺寸
 *
 * 通过创建原生 Image 对象加载图片，在图片加载完成后返回其原始尺寸。
 * 使用 Promise 封装，支持 async/await 调用方式。
 * 如果图片加载失败（如 URL 无效、跨域、网络错误等），返回 { w: 0, h: 0, isSuccess: false, status: "error" }。
 *
 * @param url - 图片的 URL 地址，可以是绝对路径或相对路径
 * @returns Promise，resolve 后返回包含图片尺寸信息的对象
 * @returns {w: number} - 图片原始宽度（naturalWidth）
 * @returns {h: number} - 图片原始高度（naturalHeight）
 * @returns {status: string} - 状态字符串，"success" 表示成功，"error" 表示失败
 * @returns {isSuccess: boolean} - 是否成功获取尺寸
 *
 * @example
 * ```ts
 * const result = await getImgSizeAsync('https://example.com/image.png');
 * if (result.isSuccess) {
 *   console.log(`图片尺寸: ${result.w} x ${result.h}`);
 * } else {
 *   console.error('获取图片尺寸失败');
 * }
 * ```
 */
const getImgSizeAsync = (url: string): Promise<{
    w: number,
    h: number,
    status: string
    isSuccess: boolean
}> => {
    return new Promise((resolve) => {
        // 创建原生 Image 对象用于加载图片
        const img = new Image();

        // 图片加载成功回调
        // naturalWidth / naturalHeight 返回图片的原始像素尺寸，不受 CSS 缩放影响
        img.onload = () => {
            resolve({
                w: img.naturalWidth,
                h: img.naturalHeight,
                isSuccess: true,
                status: "success"
            });
        };

        // 图片加载失败回调
        // 失败原因可能包括：URL 404、跨域限制、网络断开、格式不支持等
        img.onerror = () => {
            resolve({
                w: 0,
                h: 0,
                isSuccess: false,
                status: "error"
            });
        };

        // 设置图片源地址，触发加载
        // 注意：如果 URL 与当前页面跨域，且图片服务器未设置 CORS 头，
        // 图片可能加载成功但无法获取尺寸（此时 onerror 会被触发）
        img.src = url;
    });
}

export default getImgSizeAsync
