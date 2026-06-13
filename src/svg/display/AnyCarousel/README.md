# AnyCarousel — 单向轮播（四角色 + 任意角度）

> N 个 childItem 沿 `angle` 方向单向流动；当前居中者为 **center**，依次离开/进入的两侧为 **last** / **next**，更远为 **outWindow**。每个角色一套独立的变换配置（scale / rotate / skewX / skewY / opacity），切换时按角色平滑插值。

## 角色与几何

内容沿 +angle 方向流动（angle=0 向右），入口/出口在两侧：

```
next —— center —— last —— outWindow ...
(−angle)  (正中)   (+angle)  (更远 +angle)
```

- 推进时整体沿 +angle 平移：**next 从 −angle 侧滑入 center**，center 滑向 last(+angle) 侧。
- `next` = 即将进入中心的下一个（入口侧，−angle）；`last` = 刚离开中心的上一个（出口侧，+angle）。
- 屏外（超出 last/next 之外）= `outWindow`，默认恒等。

中心 item 居中：`centerX = (canvasSize.w - childCanvasSize.w) / 2`。peek（侧图露出量）由 `childCanvasSize` + `childGap` + `canvasSize` 几何自动决定，无专门参数。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `canvasSize` | `{ w, h }` | — | SVG viewBox 尺寸 |
| `childCanvasSize` | `{ w, h }` | — | 每个 child 的画布尺寸（共用） |
| `childItems` | `I_AnyCarouselItemConfig[]` | — | 子项，≥1 |
| `childGap` | `number` | `100` | 相邻 child 间距 |
| `centerChildConfig` | `I_ChildTransform` | 恒等 | 中心角色变换 |
| `lastChildConfig` | `I_ChildTransform` | 恒等 | last 角色（+angle 出口侧）变换 |
| `nextChildConfig` | `I_ChildTransform` | 恒等 | next 角色（−angle 入口侧）变换 |
| `outWindowConfig` | `I_ChildTransform` | 恒等 | 屏外角色变换 |
| `angle` | `number` | `0` | 流动方向角度（度），即内容流动方向：0=向右，90=向上，180=向左 |
| `canvasBg` | `I_CanvasBg` | — | 画布背景 |
| `spacing` | `T_SpacingProps` | — | 外间距 |

## I_ChildTransform（5 通道）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `scale` | `number` | `1` | 缩放比 |
| `rotate` | `number` | `0` | 旋转角度（度） |
| `skewX` | `number` | `0` | X 方向倾斜（度） |
| `skewY` | `number` | `0` | Y 方向倾斜（度） |
| `opacity` | `number` | `1` | 不透明度 0-1 |

每个 config 的所有通道可选；只在某通道「跨角色存在非恒等值」时才渲染对应的 `animateTransform` / `animate`，保持输出精简。

## I_AnyCarouselItemConfig

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | — | 图片地址（与 `item` 二选一） |
| `item` | `ReactNode` | — | 自定义内容（优先级高于 `url`） |
| `switchDuration` | `number` | `0.5` | 切换时长（秒） |
| `stayDuration` | `number` | `1.0` | 中心停留时长（秒） |
| `keySplines` | `string` | ease-in-out | 缓动曲线 |

## 实现要点

- N+3 个 slot 以中心为界向 ±angle 两侧排开（next 在 −angle 入口侧、last 在 +angle 出口侧；首尾各一个 ghost 副本保证无缝循环），外层 `<g>` 用一条 `transformTranslate`（`isAdditive`）整体沿 +angle 平移，让 slot 依次滑过中心。
- 每个 slot 的内容中心置于本地原点，使 scale / rotate / skewX / skewY 自然围绕中心作用（无需手动平移补偿）。每个 `animateTransform` 独占一个 `<g>`（符合 SMIL 嵌套规则）。
- 每个 slot × 每个通道一条 timeline：`initValue` 取状态 0 的角色值，每段 `toAbs` 取段末状态的角色值；节奏由 `switchDuration` / `stayDuration` 驱动（偶数段=switch、奇数段=stay）。
- 循环靠 slot 排布的周期性 + 外层平移的周期性天然无缝（itemIdx = activeIdx mod N）。

## 目录结构

```
AnyCarousel/
├── README.md
├── index.tsx                主组件（四角色 + 多通道 timeline）
├── types.ts                 类型 + 默认值常量
└── utils/
    └── normalizer.ts        配置标准化（item + childConfig）
```
