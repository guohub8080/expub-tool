# StackCarouselX

横向叠层卡牌轮播组件。卡牌分三层深度堆叠（back / mid / center），自动循环推进，支持点击跳转链接。

## 用法

```tsx
import { StackCarouselX } from "expub-tool/svg"

<StackCarouselX
  canvasSize={{ w: 1080, h: 1080 }}
  itemCanvasSize={{ w: 972, h: 972 }}
  pics={[
    { url: "https://example.com/1.jpg" },
    { url: "https://example.com/2.jpg", link: "https://baidu.com" },
    { url: "https://example.com/3.jpg" },
    { url: "https://example.com/4.jpg" },
  ]}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w, h }` | 必填 | SVG 画布尺寸（viewBox） |
| `itemCanvasSize` | `{ w, h }` | 必填 | 单张图片的画布尺寸 |
| `pics` | `I_StackCarouselItem[]` | 必填 | 图片/内容配置数组，至少 1 项 |
| `scales` | `[number, number, number]` | `[0.7, 0.8, 0.9]` | 三层缩放 [back, mid, center] |
| `backOffset` | `number` | `162` | back 位置偏移量（px），mid 自动取一半 |
| `exitOffset` | `number` | `-canvasSize.w` | 退场偏移量 |
| `backgroundColor` | `string` | `"#FFFFFF"` | 背景色 |
| `spacing` | `T_SpacingProps` | — | 外层 margin-top 间距 |

## I_StackCarouselItem

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `url` | `string` | — | 图片地址，与 `item` 二选一 |
| `item` | `ReactNode` | — | 自定义内容，优先级高于 `url` |
| `link` | `string` | — | 点击跳转链接（可选） |
| `switchDuration` | `number` | `1` | 切换动画时长（秒） |
| `stayDuration` | `number` | `1` | 停留时长（秒） |
| `keySplines` | `string` | ease-in-out | SMIL keySplines 缓动曲线 |

## 注意

- `pics` 少于 3 项时自动补齐：1 项复制为 3 项，2 项补第 1 项为第 3 项。
- 动画周期 = N × (switchDuration + stayDuration)，每张图片在 center 位停留后飞出。
