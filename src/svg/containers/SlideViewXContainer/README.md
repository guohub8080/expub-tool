# SlideViewXContainer — 横向滑动视口容器

将多个子组件排列在横向轨道上，用户可以左右自由滑动浏览。支持 `exposedPercent` 实现下一张部分透出效果。

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
| items | ReactNode[] | [] | 子组件数组 |
| exposedPercent | number | — | 每个 item 占视口宽度的百分比，传入后右边露出下一张 |
| isReverse | boolean | false | 是否反向排列（rtl） |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

### 等分三栏滑动

```tsx
<SlideViewXContainer items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
  <img src="img3.jpg" style={{ width: '100%' }} />,
]} />
```

### 下一张部分透出（peek）

```tsx
<SlideViewXContainer exposedPercent={80} items={[
  <img src="img1.jpg" style={{ width: '100%' }} />,
  <img src="img2.jpg" style={{ width: '100%' }} />,
  <img src="img3.jpg" style={{ width: '100%' }} />,
]} />
```

### 反向滑动（从右侧开始）

```tsx
<SlideViewXContainer isReverse items={[...]} />
```

## 注意

- `items` 为空时返回 null，不渲染任何内容
- 轨道宽度通过 `important` 强制设置，确保不被外部样式覆盖
- 与 SnapSlideViewXContainer 的区别：本组件自由滑动，不带吸附效果
