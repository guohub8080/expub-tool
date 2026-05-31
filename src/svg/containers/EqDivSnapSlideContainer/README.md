# EqDivSnapSlideContainer — 等分吸附横向滑动容器

在 EqDivSlideXContainer 基础上增加 **scroll snap 吸附效果**，滑动松手后自动对齐到最近的子组件，实现类似轮播的"翻页"体验。

## 原理

```
┌─ 外层（overflow: hidden）──────────────────┐
│  ┌─ 滚动层（scroll-snap-type: x mandatory）┐ │
│  │  ┌─ 轨道（width: 300%，flex）────────┐ │ │
│  │  │  ┌────────┐┌────────┐┌────────┐  │ │ │
│  │  │  │ comp 1 ││ comp 2 ││ comp 3 │  │ │ │
│  │  │  │  snap  ││  snap  ││  snap  │  │ │ │
│  │  │  └────────┘└────────┘└────────┘  │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └───────────────────────────────────────┘ │
└────────────────────────────────────────────┘
← 滑动松手后自动吸附到最近的子组件 →
```

与 EqDivSlideXContainer 的三层结构相同，额外增加：
- `scrollSnapType: x mandatory` — 强制横向吸附
- `scrollBehavior: smooth` — 平滑滚动动画
- `scrollSnapAlign` — 每个子组件设置对齐方式（start / center / end）
- `pointerEvents: auto` — 确保滚动区域可交互

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | ReactNode[] | [] | 子组件数组 |
| isReverse | boolean | false | 是否反向排列（rtl） |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |
| snapAlign | 'start' \| 'center' \| 'end' | 'center' | 吸附对齐方式 |

### snapAlign 效果

- `start` — 吸附到子组件左边缘
- `center` — 吸附到子组件中心（默认）
- `end` — 吸附到子组件右边缘

## 常用场景

### 轮播翻页效果

```tsx
<EqDivSnapSlideContainer items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
  <img src="img3.jpg" style={{ width: '100%' }} />,
]} />
```

### 吸附到左边缘

```tsx
<EqDivSnapSlideContainer snapAlign="start" comps={[...]} />
```

### 反向轮播（从右侧开始）

```tsx
<EqDivSnapSlideContainer isReverse comps={[...]} />
```

## 注意

- `items` 为空时返回 null
- 需要 scroll snap 的场景用本组件，自由滑动用 EqDivSlideXContainer
