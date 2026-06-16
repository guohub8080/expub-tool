# FlashSlideCarousel

拍照快闪轮播。N 张图循环播放，每张展示后在切换瞬间伴随 scale 抖动（快门感的 flash），同时和不透明度交叉淡化到下一张。

灵感来自 135 编辑器「多图轮播（快闪）」效果。

## 用法

```tsx
import { FlashSlideCarousel } from "expub-tool/svg"

<FlashSlideCarousel
  canvasSize={{ w: 300, h: 300 }}
  childItems={[
    { url: "https://example.com/1.jpg" },
    { url: "https://example.com/2.jpg" },
    { url: "https://example.com/3.jpg" },
    { url: "https://example.com/4.jpg" },
    { url: "https://example.com/5.jpg" },
  ]}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w, h }` | 必填 | SVG 画布尺寸（viewBox） |
| `childItems` | `FlashSlideItem[]` | 必填 | 图片数组，至少 1 项 |
| `duration` | `number` | `5` | 一个循环周期时长（秒） |
| `flashShrink` | `number` | `0.75` | 抖动收缩值（scale 低点） |
| `flashScale` | `number` | `1.5` | 抖动放大值（scale 高点） |
| `transFrac` | `number` | `0.4` | 切换宽度占每张 slot 的比例（cross-fade + 抖动窗口） |
| `canvasBg` | `I_CanvasBg` | — | 画布背景 |
| `spacing` | `T_SpacingProps` | — | 外层 margin-top 间距 |

### FlashSlideItem

| 字段 | 类型 | 说明 |
|---|---|---|
| `url` | `string` | 图片地址，与 `jsx` 二选一 |
| `jsx` | `ReactNode` | 自定义内容，优先级高于 `url` |

## 时序

一个周期 `duration` 秒内，每张图占一个 slot（`duration / N`）：

- **展示**：slot 大部分时间里 scale=1、opacity=1。
- **切换**：slot 末尾 `transFrac` 比例的窗口内，scale 抖动 `1 → flashShrink → flashScale → flashShrink → 1`，同时 opacity 从 1 淡到 0，下一张从 0 淡到 1（交叉淡化）。
- **循环**：最后一张 → 第一张在周期边界交叉淡化（无缝），第 0 张在周期末淡入、周期首已可见。

抖动（scale）只作用于「退出」的那张（切换瞬间），淡入的新图保持 scale=1。
