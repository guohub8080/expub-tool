# CollapsibleBox — 坍塌盒子

点击后内容消失，可选延迟坍塌 + 替换内容淡入。

## 原理

```
┌─ root（overflow: hidden）───────────────────┐
│  ┌─ outer ────────────────────────────────┐ │
│  │  ┌─ topContainer（height:0, visible）─┐│ │
│  │  │  children ← 展示层，溢出可见        ││ │
│  │  └────────────────────────────────────┘│ │
│  │  ┌─ mainContainer ────────────────────┐│ │
│  │  │  <svg>                             ││ │
│  │  │    <animate width>  click→0        ││ │
│  │  │    <g>                             ││ │
│  │  │      [afterContent] ← foreignObj   ││ │
│  │  │      <rect hotArea>                ││ │
│  │  │        <animate height> click→0   ││ │
│  │  │      </rect>                       ││ │
│  │  │    </g>                            ││ │
│  │  │  </svg>                            ││ │
│  │  └────────────────────────────────────┘│ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

- topContainer `height:0 + overflow:visible` — 不占空间，children 溢出显示
- mainContainer `pointer-events:none` — 只有 rect 热区 `pointer-events:visiblePainted` 可点击
- 点击 rect → SVG width→0 + height→0 → 展示层随之消失

### 三种模式

| Props | 行为 |
|-------|------|
| 无 afterContent | 纯坍塌消失，height 用 spline 缓动 |
| afterContent | 坍塌后显示替换内容，foreignObject + translate 移入 |
| afterContent + collapseDelay | 延迟 width 坍塌 + 替换内容 opacity 淡入 |

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | — | 初始展示内容 |
| viewBoxW | number | 100 | SVG viewBox 宽度 |
| viewBoxH | number | 300 | SVG viewBox 高度 |
| hotArea | T_HotArea | {x:0,y:0,w:100,h:100} | 点击热区 |
| afterContent | ReactNode | — | 坍塌后显示的替换内容 |
| collapseDelay | number | — | 延迟坍塌时长（秒），同时启用淡入 |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

### 纯坍塌消失

```tsx
<CollapsibleBox viewBoxW={450} viewBoxH={750} hotArea={{ w: 450, h: 750 }}>
  <img src={pic} style={{ width: '100%' }} />
</CollapsibleBox>
```

### GIF 播放后坍塌 + 替换图片

```tsx
<CollapsibleBox
  viewBoxW={450} viewBoxH={750}
  hotArea={{ w: 450, h: 750 }}
  collapseDelay={2}
  afterContent={<svg viewBox="0 0 450 750" style={{ ... }} />}
>
  <NormalSvgImg url={gifUrl} w={450} h={750} />
</CollapsibleBox>
```

### 淡入替换内容

```tsx
<CollapsibleBox
  viewBoxW={450} viewBoxH={750}
  hotArea={{ w: 450, h: 750 }}
  collapseDelay={0.8}
  afterContent={<img src={newPic} style={{ width: '100%' }} />}
>
  <img src={oldPic} style={{ width: '100%' }} />
</CollapsibleBox>
```

## 注意

- 热区默认 100x100，通常需要设为内容完整区域才能方便点击
- `afterContent` 放在 foreignObject 内，支持 HTML 和 SVG 内容
- 动画 `fill="freeze"` 保持终态，`restart="never"` 防重复触发
