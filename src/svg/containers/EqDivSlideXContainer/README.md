# EqDivSlideXContainer — 等分横向滑动容器

将多个子组件等分排列，用户可以左右自由滑动浏览。每个子组件宽度 = 容器宽度 / 子组件数量。

## 原理

```
┌─ 外层（overflow: hidden）──────────────────┐
│  ┌─ 滚动层（overflow: scroll hidden）─────┐ │
│  │  ┌─ 轨道（width: 300%，flex）────────┐ │ │
│  │  │  ┌────────┐┌────────┐┌────────┐  │ │ │
│  │  │  │ comp 1 ││ comp 2 ││ comp 3 │  │ │ │
│  │  │  │  33.3% ││  33.3% ││  33.3% │  │ │ │
│  │  │  └────────┘└────────┘└────────┘  │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └───────────────────────────────────────┘ │
└────────────────────────────────────────────┘
← 可自由滑动 →
```

三层结构：
1. **外层** — 通用容器样式，overflow: hidden 裁剪溢出
2. **滚动层** — overflow: scroll hidden，提供横向滚动能力
3. **轨道层** — width = 子组件数量 × 100%（通过 important 强制），display: flex 横向排列子组件

通过 `direction: rtl` 实现反向排列（滚动起始位置在右侧）。

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| items | ReactNode[] | [] | 子组件数组，长度决定等分数 |
| isReverse | boolean | false | 是否反向排列（rtl） |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

### 等分三栏滑动

```tsx
<EqDivSlideXContainer items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
  <img src="img3.jpg" style={{ width: '100%' }} />,
]} />
```

### 反向滑动（从右侧开始）

```tsx
<EqDivSlideXContainer isReverse comps={[...]}>
```

### 带间距控制

```tsx
<EqDivSlideXContainer spacing={{ mt: 10, mb: 10 }} comps={[...]} />
```

## 注意

- `items` 为空时返回 null，不渲染任何内容
- 轨道宽度通过 `important` 强制设置，确保不被外部样式覆盖
- 与 EqDivSnapSlideContainer 的区别：本组件自由滑动，不带吸附效果
