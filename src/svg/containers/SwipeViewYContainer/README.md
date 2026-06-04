# SlideViewYContainer — 纵向滑动视口容器

将多个子组件纵向排列，用户可上下自由滑动浏览。通过 `aspect-ratio` 从宽度推导容器高度，无需手动指定像素值。

## 原理

横向滑动（SlideX）的宽度是已知的——等于容器宽度。但纵向滑动的高度在微信环境中无法直接获取，因此用 `aspect-ratio: w / h` 从宽度反推高度。

```
aspect-ratio: 300 / 300        → 容器是正方形
aspect-ratio: 300 / 500        → 容器和图片等高，刚好露出一张
aspect-ratio: 300 / 750        → 容器高度 = 1.5 张图，能看到下一张的一部分
```

结构只有两层（比 SlideX 少一层滚动层）：

```
┌─ 外层（aspect-ratio: w/h，overflow: hidden scroll）─┐
│  ┌─ 轨道（flex column）──────────────────────────┐  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │  item 1（高度由内容自身决定）              │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │  item 2                                    │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
↑ 可自由上下滑动 ↑
```

1. **外层** — `aspect-ratio` 锁定视口比例，`overflow: hidden scroll` 裁剪溢出并提供纵向滚动
2. **轨道** — `flex column` 纵向排列所有 item
3. **item** — 不设 `aspect-ratio`，高度由内容自身（如 SVG viewBox）决定

关键：item 高度不受容器 w/h 限制，只由内容撑开。容器的 w/h 只决定视口露出多少内容。

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | ReactNode[] | [] | 子组件数组 |
| w | number | — | 视口宽度基准（和 h 一起决定视口比例） |
| h | number | — | 视口高度基准 |
| isReverse | boolean | false | 是否反向排列（column-reverse） |
| isBottomUp | boolean | false | 是否底部向上滑动（180° 翻转） |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

### 等高图片纵向滑动（视口 = 一张图）

```tsx
<SlideViewYContainer w={300} h={500} items={[
  <ImgSvg url={img1} w={300} h={500} />,
  <ImgSvg url={img2} w={300} h={500} />,
  <ImgSvg url={img3} w={300} h={500} />,
]} />
```

### 底部向上滑动（180° 翻转）

```tsx
<SlideViewYContainer w={300} h={500} isBottomUp items={[...]} />
```

### 反向排列（从底部开始）

```tsx
<SlideViewYContainer isReverse w={300} h={500} items={[...]} />
```

## 注意

- `items` 为空时返回 null
- 容器高度完全由 `aspect-ratio: w/h` + 容器实际宽度决定，不依赖 `height: 100%` 或绝对定位
- 与 SnapSlideViewYContainer 的区别：本组件自由滑动，不带吸附效果
