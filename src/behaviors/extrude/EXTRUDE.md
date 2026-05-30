# Extrude 挤出动画原理

## 效果

点击后，一个透明区域从 0 高度逐渐"挤出"展开，露出下方内容。

## 核心结构

```
┌─ SvgEx (pointerEvents: none) ─────────────────────┐
│  viewBox="0 0 canvasWidth initHeight"              │
│                                                     │
│  <animate attributeName="width" />   ← 撑开容器宽度 │
│                                                     │
│  ┌─ rect (pointerEvents: painted, opacity: 0) ──┐  │
│  │  <animate attributeName="height" />  ← 自毁  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 三个关键角色

### 1. 外层 SVG — 不可点击的容器

```
style={{ pointerEvents: 'none' }}
```

外层 SVG 设为 `pointerEvents: none`，自身不接收任何点击事件。它只负责：
- 通过 `viewBox` 定义坐标空间
- 通过 `width` 动画撑开自身高度

### 2. 内部 rect — 透明的点击热区

```
style={{ pointerEvents: 'painted', opacity: 0 }}
```

- `opacity: 0` — 不可见，不干扰视觉
- `pointerEvents: painted` — 虽然透明，但仍然可以接收点击事件
- 它是整个交互的"触发器"：用户实际上是在点击这个看不见的矩形

### 3. rect 的 height 动画 — 点击后自毁

```xml
<animate
  attributeName="height"
  values="initHeight;0;0"
  keyTimes="0;0.0001;1"
  dur="10s"
  fill="freeze"
/>
```

这是最精妙的部分：

- **`values="initHeight;0;0"`** — 三帧：初始高度 → 0 → 0
- **`keyTimes="0;0.0001;1"`** — 在总时长的 **0.01%** 处完成从 initHeight → 0 的跳变
- **`dur="10s"`** — 用 width 动画的总时长（不是 0.001s）

**为什么用长 dur + keyTimes，而不是短 dur？**

微信 WebView 会优化掉极短时长的动画（如 `dur="0.001s"`），认为它是无意义的。使用长 dur + keyTimes trick：
- 系统认为这是一个正常的 10s 动画，不会被丢弃
- 但实际上在 0.01% 处（约 0.001s）就已经完成跳变，视觉上等同于瞬间塌缩

## 交互流程

```
用户点击 rect
    │
    ├─→ width 动画开始：SVG 容器从初始宽度逐渐撑开
    │
    └─→ height 动画开始：rect 瞬间塌缩为 height: 0
         │
         └─→ rect 变为 height: 0 后不再阻挡点击
              后续点击穿透到下方内容
```

## 为什么需要自毁？

如果 rect 不自毁（保持 height: 100%），它永远挡在内容上方。即使视觉上看不见（opacity: 0），`pointerEvents: painted` 意味着它仍然拦截所有点击事件。自毁后 height 变为 0，不再有可点击区域，事件自然穿透到下层。

## 与 smil animateHeight 的结合

rect 的 height 动画通过 smil 的 `animateHeight` + `native` 覆盖实现：

```tsx
animateHeight({
  initValue: initHeight,
  timeline: [{ to: 0, durationSeconds: totalDuration }],  // 提供 dur 计算
  begin,
  isFreeze: true,
  native: {
    values: `${initHeight};0;0`,
    keyTimes: '0;0.0001;1',
    calcMode: 'spline',
    keySplines: '0.42 0 0.58 1; 0.42 0 0.58 1',
    restart: 'never',
  },
})
```

`timeline` 提供 `dur` 的正确时长，`native` 精确覆盖 `values`、`keyTimes` 等属性。
