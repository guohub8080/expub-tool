# SnapSwipeViewContainer — 吸附滑动视口容器

横向 / 纵向吸附滑动视口容器，在 SwipeViewContainer 基础上增加 **scroll snap 吸附效果**，滑动松手后自动对齐到最近的子组件，实现轮播翻页或抖音式"刷视频"体验。

- **SnapSwipeViewXContainer** — 横向吸附滑动
- **SnapSwipeViewYContainer** — 纵向吸附滑动（抖音效果）

## 使用

```tsx
import { SnapSwipeViewXContainer, SnapSwipeViewYContainer } from "expub-tool/svg"

// 横向吸附翻页
<SnapSwipeViewXContainer exposedPercent={80} items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
  <img src="img3.jpg" style={{ width: '100%' }} />,
]} />

// 纵向抖音式翻页
<SnapSwipeViewYContainer canvasSize={{ w: 300, h: 500 }} items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
  <img src="img3.jpg" style={{ width: '100%' }} />,
]} />
```

## 共同 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `ReactNode[]` | `[]` | 子组件数组，为空返回 null |
| `isReverse` | `boolean` | `false` | 是否反向排列 |
| `snapAlign` | `'start' \| 'center' \| 'end'` | 见下 | 吸附对齐方式 |
| `spacing` | `T_SpacingProps` | `SPACING_ZERO` | 外边距配置 |

### snapAlign 效果

| 值 | 效果 |
|----|------|
| `'start'` | 吸附到子组件起始边缘（横向=左，纵向=上） |
| `'center'` | 吸附到子组件中心 |
| `'end'` | 吸附到子组件末尾边缘 |

**默认值**：X 轴默认 `'center'`，Y 轴默认 `'start'`（适合抖音式翻页）。

## SnapSwipeViewXContainer — 横向

额外 Props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `exposedPercent` | `number` | — | 每个 item 占视口宽度的百分比，传入后右边露出下一张 |

### 结构

```
┌─ 外层（overflow: hidden）──────────────────┐
│  ┌─ 滚动层（scroll-snap-type: x mandatory）┐ │
│  │  ┌─ 轨道（width: N*exposedPercent%，flex）┐│ │
│  │  │  ┌────────┐┌────────┐┌────────┐  ││ │
│  │  │  │ comp 1 ││ comp 2 ││ comp 3 │  ││ │
│  │  │  │  snap  ││  snap  ││  snap  │  ││ │
│  │  │  └────────┘└────────┘└────────┘  ││ │
│  │  └──────────────────────────────────┘│ │
│  └───────────────────────────────────────┘ │
└────────────────────────────────────────────┘
← 滑动松手后自动吸附到最近的子组件 →
```

### 常用场景

```tsx
// 基础轮播翻页
<SnapSwipeViewXContainer items={[...]} />

// peek 露出效果（每张占 80%，右边露出下一张）
<SnapSwipeViewXContainer exposedPercent={80} items={[...]} />

// 吸附到左边缘
<SnapSwipeViewXContainer snapAlign="start" items={[...]} />

// 反向轮播（从右侧开始）
<SnapSwipeViewXContainer isReverse items={[...]} />
```

## SnapSwipeViewYContainer — 纵向

额外 Props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `canvasSize` | `{ w: number; h: number }` | — | 画布尺寸，用于设置 `aspect-ratio` |
| `isBottomUp` | `boolean` | `false` | 是否底部向上滑动（180° 翻转） |

### 结构

```
┌─ 外层（aspect-ratio: w/h，scroll-snap-type: y mandatory）─┐
│  ┌─ 轨道（flex column）───────────────────────────────┐   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │  item 1（scrollSnapAlign: start）             │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │  item 2（scrollSnapAlign: start）             │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │  item 3（scrollSnapAlign: start）             │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
↑ 滑动松手后自动吸附到最近的 item 边缘 ↑
```

### 常用场景

```tsx
// 抖音式纵向翻页
<SnapSwipeViewYContainer canvasSize={{ w: 300, h: 500 }} items={[...]} />

// 底部向上吸附滑动（180° 翻转）
<SnapSwipeViewYContainer canvasSize={{ w: 300, h: 500 }} isBottomUp items={[...]} />

// 吸附到中心
<SnapSwipeViewYContainer snapAlign="center" canvasSize={{ w: 300, h: 500 }} items={[...]} />

// 反向（从最后一页开始）
<SnapSwipeViewYContainer isReverse canvasSize={{ w: 300, h: 500 }} items={[...]} />
```

## 注意

- `items` 为空时返回 null
- 需要 scroll snap 的场景用本组件，自由滑动用 `SwipeViewXContainer` / `SwipeViewYContainer`
- Y 轴当 `w/h` 比例与图片实际比例一致时，每次恰好吸附到一整张图

## 目录结构

```
SnapSwipeViewContainer/
├── README.md                      本文档
├── SnapSwipeViewXContainer.tsx    横向吸附滑动组件
└── SnapSwipeViewYContainer.tsx    纵向吸附滑动组件
```
