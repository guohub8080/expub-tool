# AnyCarousel — 通用轨道轮播组件

多张图排列在轨道上，轨道整体平移实现中心切换，每个 slot 独立控制 scale / opacity / rotation / skewX / skewY 动画。

## 核心特点

- **角度轨道**：`angle` 支持任意方向（0° 水平，90° 垂直，45° 对角线，任意角度）
- **5 个动画通道**：scale / opacity / rotation / skewX / skewY，全部支持 origin + timeline
- **stay 阶段用户自定义**：中心停留时可固定值或自定义 timeline（呼吸、浮动等）
- **自动优化**：identity 通道不生成动画节点

## 使用

```tsx
import { AnyCarousel } from "expub-tool/svg"

<AnyCarousel
  canvasSize={{ w: 1000, h: 800 }}
  itemCanvasSize={{ w: 300, h: 500 }}
  angle={0}
  childItems={[
    { url: "a.jpg", scale: { centerValue: 1.4 } },
    { url: "b.jpg", scale: { centerValue: 1.4 } },
    { url: "c.jpg", scale: { centerValue: 1.4 } },
  ]}
/>
```

## 组件 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `canvasSize` | `{ w: number; h: number }` | — | SVG 画布尺寸（viewBox） |
| `childItems` | `I_AnyCarouselChildItem[]` | — | 子项配置数组，至少 1 项 |
| `itemCanvasSize` | `{ w: number; h: number }` | = canvasSize | 单张内容渲染尺寸 |
| `angle` | `number` | `0` | 轨道角度（度），0=水平，90=垂直，45=对角 |
| `itemGap` | `number` | `0` | 相邻 slot 间距（px） |
| `isReversed` | `boolean` | `false` | 反向播放 |
| `spacing` | `T_SpacingProps` | — | 外间距 |
| `canvasBg` | `I_CanvasBg` | — | 画布背景 |

## I_AnyCarouselChildItem — 单项配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | — | 图片地址（与 jsx 二选一） |
| `jsx` | `ReactNode` | — | 自定义内容（优先级高于 url） |
| `switchDuration` | `number` | `0.5` | 切换动画时长（秒） |
| `stayDuration` | `number` | `1.0` | 中心停留时长（秒） |
| `keySplines` | `string` | ease-in-out | 缓动曲线 |
| `scale` | `I_CarouselOriginChannel` | — | 缩放通道 |
| `opacity` | `I_CarouselAnimChannel` | — | 透明度通道 |
| `rotation` | `I_CarouselOriginChannel` | — | 旋转通道 |
| `skewX` | `I_CarouselOriginChannel` | — | skewX 通道 |
| `skewY` | `I_CarouselOriginChannel` | — | skewY 通道 |

## 动画通道

### I_CarouselAnimChannel（opacity）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sideValue` | `number` | `1` | 侧边状态值 |
| `centerValue` | `number` | `1` | 中心状态值 |
| `stay` | `number \| { timeline }` | — | stay 阶段：不传=保持 centerValue，数字=固定值，timeline=自定义 |

### I_CarouselOriginChannel（scale / rotation / skewX / skewY）

继承 `I_CarouselAnimChannel`，额外增加：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `origin` | `T_Origin` | `'Center'` | 变换原点 |

## 角度轨道

`angle` 决定 slot 排列方向和轨道平移方向：

```
angle: 0    →  水平（等同于 CoverFlowX）
angle: 90   →  垂直（等同于 CoverFlowY）
angle: 45   →  右上对角线
angle: 180  →  反向水平
angle: 270  →  反向垂直
angle: 任意  →  任意方向
```

step 计算公式：

```
stepX = (itemW + gap) × cos(angle)
stepY = (itemH + gap) × sin(angle)
```

## 4 阶段时间模型

每个 slot 在循环内经历 N 轮，每轮 4 个阶段：

```
┌──────────┬──────────┬──────────┬──────────┐
│  enter   │   stay   │   exit   │   hold   │
│ switchDur│ stayDur  │nextSwitch│  剩余    │
│ side→center│ 用户自定义 │center→side│ 侧边等待 │
└──────────┴──────────┴──────────┴──────────┘
```

总循环时长 = `Σ(switchDuration + stayDuration)`

- **enter**：sideValue → centerValue 自动插值（keySplines 缓动）
- **stay**：用户自定义（固定值或 timeline）
- **exit**：centerValue → sideValue 自动插值
- **hold**：保持 sideValue

## 常见效果

### CoverFlow

```tsx
<AnyCarousel angle={0} itemGap={100} childItems={[
  { url: "a.jpg", scale: { centerValue: 1.4, sideValue: 1 } },
  { url: "b.jpg", scale: { centerValue: 1.4 } },
  { url: "c.jpg", scale: { centerValue: 1.4 } },
]} />
```

### 淡入淡出轮播

```tsx
<AnyCarousel angle={90} childItems={[
  { url: "a.jpg", opacity: { centerValue: 1, sideValue: 0.3 } },
  { url: "b.jpg", opacity: { centerValue: 1, sideValue: 0.3 } },
]} />
```

### 3D 翻转轮播

```tsx
<AnyCarousel angle={0} childItems={[
  { url: "a.jpg", skewY: { sideValue: 15, centerValue: 0 } },
  { url: "b.jpg", skewY: { sideValue: 15, centerValue: 0 } },
  { url: "c.jpg", skewY: { sideValue: 15, centerValue: 0 } },
]} />
```

### 呼吸缩放

```tsx
<AnyCarousel angle={0} childItems={[
  {
    url: "a.jpg",
    scale: {
      centerValue: 1.4,
      stay: { timeline: [
        { durationSeconds: 0.5, toAbs: 1.3 },
        { durationSeconds: 0.5, toAbs: 1.4 },
      ]}
    }
  },
  // ...
]} />
```

### 旋转入场

```tsx
<AnyCarousel angle={45} childItems={[
  { url: "a.jpg", rotation: { sideValue: 180, centerValue: 0 } },
  { url: "b.jpg", rotation: { sideValue: 180, centerValue: 0 } },
]} />
```

## 目录结构

```
AnyCarousel/
├── README.md
├── types.ts                       类型 + 默认值常量
├── utils/
│   └── normalizer.ts              配置标准化 + 默认值填充 + 校验
└── timeline/
    └── offsetCalculator.ts        角度→step、slot 布局、scale 补偿计算
```
