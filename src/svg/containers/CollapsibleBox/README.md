# CollapsibleBox — 坍塌盒子

点击后内容消失。展示层叠在交互层（SVG）之上，点击透明热区触发 SVG width/height 坍塌为 0。

## 原理

```
┌─ root（overflow: hidden）─────────────────┐
│  ┌─ outer ───────────────────────────────┐ │
│  │  ┌─ topContainer（height:0, visible）┐│ │
│  │  │  children ← 展示层，溢出可见       ││ │
│  │  └───────────────────────────────────┘│ │
│  │  ┌─ mainContainer ───────────────────┐│ │
│  │  │  <svg>                            ││ │
│  │  │    <animate width>  click→0       ││ │
│  │  │    <rect hotArea>                 ││ │
│  │  │      <animate height> click→0    ││ │
│  │  │    </rect>                        ││ │
│  │  │  </svg>                           ││ │
│  │  └───────────────────────────────────┘│ │
│  └───────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

- topContainer `height:0 + overflow:visible` — 不占空间，children 溢出显示
- mainContainer `pointer-events:none` — 整体不可交互，只有 rect 热区 `pointer-events:visiblePainted` 可点击
- 点击 rect → SVG width 瞬间变 0 + rect height 平滑缩至 0 → 展示层随之消失

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | — | 展示内容（图片、组件等） |
| viewBoxW | number | 100 | SVG viewBox 宽度 |
| viewBoxH | number | 300 | SVG viewBox 高度 |
| hotAreaX | number | 0 | 热区 X 坐标 |
| hotAreaY | number | 0 | 热区 Y 坐标 |
| hotAreaW | number | 50 | 热区宽度 |
| hotAreaH | number | 50 | 热区高度 |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

```tsx
<CollapsibleBox viewBoxW={450} viewBoxH={750} hotAreaW={450} hotAreaH={750}>
  <img src={pic} style={{ width: '100%' }} />
</CollapsibleBox>
```

## 注意

- 热区（rect）默认 50x50，通常需要设为整个内容区域才能方便点击
- 动画 `fill="freeze"` 确保坍塌后保持终态，`restart="never"` 防止重复触发
- 如需坍塌后显示替换图片，用 CollapsibleBoxGif 或 CollapsibleBoxFade
