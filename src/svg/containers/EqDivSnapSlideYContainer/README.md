# EqDivSnapSlideYContainer — 等分吸附纵向滑动容器（抖音效果）

在 EqDivSlideYContainer 基础上增加 **scroll snap 吸附效果**，滑动松手后自动对齐到最近的子组件，实现类似抖音的"刷视频"体验。

## 原理

与 EqDivSlideYContainer 相同的 `aspect-ratio` 方案，额外增加 scroll snap：

```
┌─ 外层（aspect-ratio: w/h，scroll-snap-type: y mandatory）─┐
│  ┌─ 轨道（flex column）───────────────────────────────┐   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │  item 1（snap align: start）                  │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │  item 2（snap align: start）                  │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │  item 3（snap align: start）                  │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
↑ 滑动松手后自动吸附到最近的 item 边缘 ↑
```

与 EqDivSlideYContainer 的区别仅在外层额外增加：
- `scrollSnapType: y mandatory` — 强制纵向吸附
- `scrollBehavior: smooth` — 平滑滚动过渡
- 每个 item 的 `scrollSnapAlign` — 控制吸附对齐位置

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | ReactNode[] | [] | 子组件数组 |
| w | number | — | 视口宽度基准 |
| h | number | — | 视口高度基准 |
| isReverse | boolean | false | 是否反向排列 |
| snapAlign | 'start' \| 'center' \| 'end' | 'start' | 吸附对齐方式 |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

### snapAlign 效果

- `start` — 吸附到 item 顶部（默认，适合抖音式翻页）
- `center` — 吸附到 item 中心
- `end` — 吸附到 item 底部

## 常用场景

### 抖音式纵向翻页

```tsx
<EqDivSnapSlideYContainer w={300} h={500} items={[
  <ImgSvg url={img1} w={300} h={500} />,
  <ImgSvg url={img2} w={300} h={500} />,
  <ImgSvg url={img3} w={300} h={500} />,
]} />
```

每次滑动松手后自动对齐到一整张图，不会停在半截。

### 吸附到中心

```tsx
<EqDivSnapSlideYContainer snapAlign="center" w={300} h={500} items={[...]} />
```

### 反向（从最后一页开始）

```tsx
<EqDivSnapSlideYContainer isReverse w={300} h={500} items={[...]} />
```

## 注意

- `items` 为空时返回 null
- 当 `w/h` 比例与图片实际比例一致时，每次恰好吸附到一整张图
- 当 `w/h` < 图片比例时，视口小于图片，每次吸附到图片顶部，图片底部超出部分需继续滑动
- 需要自由滑动（不吸附）用 EqDivSlideYContainer
