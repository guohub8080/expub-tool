# SwipeViewContainer — 滑动视口容器

横向 / 纵向自由滑动视口容器，将多个子组件排列在轨道上，用户可自由滑动浏览。

- **ContainerX** — 横向滑动（导出名 `SwipeViewXContainer`）
- **ContainerY** — 纵向滑动（导出名 `SwipeViewYContainer`）

需要吸附效果请用 `SnapSwipeViewContainer`。

## 使用

```tsx
import { SwipeViewXContainer, SwipeViewYContainer } from "expub-tool/svg"

<SwipeViewXContainer items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
  <img src="img3.jpg" style={{ width: '100%' }} />,
]} />

<SwipeViewYContainer canvasSize={{ w: 300, h: 500 }} items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
]} />
```

## 共同 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `ReactNode[]` | `[]` | 子组件数组，为空返回 null |
| `isReverse` | `boolean` | `false` | 是否反向排列 |
| `spacing` | `T_SpacingProps` | `SPACING_ZERO` | 外边距配置 |

## SwipeViewXContainer — 横向

额外 Props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `exposedPercent` | `number` | — | 每个 item 占视口宽度的百分比，传入后右边露出下一张 |

### 结构

```
┌─ 外层（overflow: hidden）──────────────────┐
│  ┌─ 滚动层（overflow: scroll hidden）─────┐ │
│  │  ┌─ 轨道（width: N×100%，flex）───────┐ │ │
│  │  │  ┌────────┐┌────────┐┌────────┐   │ │ │
│  │  │  │ comp 1 ││ comp 2 ││ comp 3 │   │ │ │
│  │  │  └────────┘└────────┘└────────┘   │ │ │
│  │  └────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
← 可自由滑动 →
```

三层：外层裁剪 → 滚动层提供横向滚动 → 轨道层 flex 横向排列。`direction: rtl` 实现反向。

### 常用场景

```tsx
// 等分滑动
<SwipeViewXContainer items={[...]} />

// peek 露出效果（每张占 80%，右边露出下一张）
<SwipeViewXContainer exposedPercent={80} items={[...]} />

// 反向（从右侧开始）
<SwipeViewXContainer isReverse items={[...]} />
```

## SwipeViewYContainer — 纵向

额外 Props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `canvasSize` | `{ w: number; h: number }` | — | 画布尺寸，用于设置 `aspect-ratio` |
| `isBottomUp` | `boolean` | `false` | 是否底部向上滑动（180° 翻转） |

### 原理

纵向高度在微信环境中无法直接获取，通过 `aspect-ratio: w / h` 从宽度反推高度：

```
aspect-ratio: 300 / 300  → 正方形视口
aspect-ratio: 300 / 500  → 恰好露出一张图
aspect-ratio: 300 / 750  → 露出 1.5 张，能看到下一张的一部分
```

两层结构（比 X 少一层滚动层）：

```
┌─ 外层（aspect-ratio: w/h，overflow: hidden scroll）─┐
│  ┌─ 轨道（flex column）──────────────────────────┐  │
│  │  item 1    item 2    item 3                   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
↑ 可自由上下滑动 ↑
```

item 高度不受容器 w/h 限制，只由内容撑开；容器的 w/h 只决定视口露出多少。

### 常用场景

```tsx
// 等高图片纵向滑动
<SwipeViewYContainer canvasSize={{ w: 300, h: 500 }} items={[...]} />

// 底部向上滑动（180° 翻转）
<SwipeViewYContainer canvasSize={{ w: 300, h: 500 }} isBottomUp items={[...]} />

// 反向（从底部开始）
<SwipeViewYContainer canvasSize={{ w: 300, h: 500 }} isReverse items={[...]} />
```

## 目录结构

```
SwipeViewContainer/
├── README.md
├── ContainerX.tsx
└── ContainerY.tsx
```
