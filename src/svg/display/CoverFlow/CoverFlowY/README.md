# CoverFlowY

纵向 CoverFlow 轮播组件。中心图放大展示，上下图片 peek 露出，自动循环播放。

## 用法

```tsx
import { CoverFlowY } from "expub-tool/svg"

<CoverFlowY
  canvasSize={{ w: 600, h: 1000 }}
  itemCanvasSize={{ w: 300, h: 300 }}
  pics={[
    { url: "https://example.com/1.jpg" },
    { url: "https://example.com/2.jpg" },
    { url: "https://example.com/3.jpg" },
  ]}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w, h }` | 必填 | SVG 画布尺寸（viewBox） |
| `itemCanvasSize` | `{ w, h }` | 必填 | 单张图片的画布尺寸 |
| `pics` | `I_CoverFlowItemConfig[]` | 必填 | 图片/内容配置数组，至少 1 项 |
| `itemGap` | `number` | `100` | 相邻图片间距（px） |
| `itemScale` | `number` | `1.4` | 中心图放大比例 |
| `itemAlign` | `'left' \| 'center' \| 'right'` | `'center'` | 图片水平对齐方式 |
| `isReversed` | `boolean` | `false` | 反向播放（从上向下） |
| `spacing` | `T_SpacingProps` | — | 外层 margin-top 间距 |

## I_CoverFlowItemConfig

与 `CoverFlowX` 共用，详见 [CoverFlowX README](../CoverFlowX/README.md#i_coverflowitemconfig)。

## 自定义内容（item 模式）

`item` 接受任意 `ReactNode`，放入 `<foreignObject>` 渲染，尺寸由 `itemCanvasSize` 控制：

```tsx
<CoverFlowY
  canvasSize={{ w: 600, h: 1000 }}
  itemCanvasSize={{ w: 300, h: 300 }}
  pics={[
    { item: <svg viewBox="0 0 300 300"><rect width="300" height="300" fill="#dc2626"/></svg> },
    { item: <svg viewBox="0 0 300 300"><rect width="300" height="300" fill="#2563eb"/></svg> },
  ]}
/>
```

## 注意

- `pics` 少于 3 项时自动补齐：1 项复制为 3 项，2 项补第 1 项为第 3 项。
- `url` 和 `item` 同时传时，`url` 被忽略并输出警告。
