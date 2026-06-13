# AnyCarousel — 通用单向 Stack 轮播组件

多张图沿单一方向排列成 stack/deck，依次经过 **back → mid → center → exit** 四个位置，只有当前位于 center 的 item 完全展示，退出时沿同一方向飞出。

## 核心特点

- **任意单向角度**：`angle` 支持任意方向（0° 水平向右，90° 垂直向下，45° 对角线，180° 水平向左等）
- **三层独立系统**：
  1. **主轨道位置**：组件自动根据 `angle` + `itemGap` 推算 back/mid/center/exit 位置
  2. **叠加 translate**：每个 item 的 `translate.stay` 可独立叠加在主轨道上，实现 center 阶段浮动等效果
  3. **动画通道**：scale / opacity / rotation / skewX / skewY 按 4 个 slot 位置插值
- **中间三个正常显示**：back、mid、center 三个 slot 始终正常显示，只有 exit 阶段飞出场外
- **无 direction 概念**：所有移动都沿 `angle` 方向，进来、出去都是同一个方向

## 使用

```tsx
import { AnyCarousel } from "expub-tool/svg"

<AnyCarousel
  canvasSize={{ w: 800, h: 600 }}
  itemCanvasSize={{ w: 300, h: 500 }}
  angle={0}
  itemGap={60}
  childItems={[
    { url: "a.jpg", scale: { sideValue: 0.78, centerValue: 1 } },
    { url: "b.jpg", scale: { sideValue: 0.78, centerValue: 1 } },
    { url: "c.jpg", scale: { sideValue: 0.78, centerValue: 1 } },
  ]}
/>
```

## 组件 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `canvasSize` | `{ w: number; h: number }` | — | SVG 画布尺寸（viewBox） |
| `childItems` | `I_AnyCarouselChildItem[]` | — | 子项配置数组，至少 1 项 |
| `itemCanvasSize` | `{ w: number; h: number }` | = canvasSize | 单张内容渲染尺寸 |
| `angle` | `number` | `0` | 单向角度（度），0=水平向右，90=垂直向下 |
| `itemGap` | `number` | `0` | 相邻 slot 之间的间距（px） |
| `isReversed` | `boolean` | `false` | 整体方向反向（等价于 angle + 180°） |
| `spacing` | `T_SpacingProps` | — | 外间距 |
| `canvasBg` | `I_CanvasBg` | — | 画布背景 |

## I_AnyCarouselChildItem — 单项配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | — | 图片地址（与 jsx 二选一） |
| `jsx` | `ReactNode` | — | 自定义内容（优先级高于 url） |
| `switchDuration` | `number` | `0.5` | 切换动画时长（秒） |
| `stayDuration` | `number` | `1.0` | 在 center 停留时长（秒） |
| `keySplines` | `string` | ease-in-out | 缓动曲线 |
| `translate` | `I_CarouselTranslateChannel` | — | 仅用于叠加在主轨道上的 stay 阶段位移 |
| `scale` | `I_CarouselOriginChannel` | — | 缩放通道 |
| `opacity` | `I_CarouselAnimChannel` | — | 透明度通道 |
| `rotation` | `I_CarouselOriginChannel` | — | 旋转通道 |
| `skewX` | `I_CarouselOriginChannel` | — | skewX 通道 |
| `skewY` | `I_CarouselOriginChannel` | — | skewY 通道 |

## 动画通道

### I_CarouselAnimChannel（opacity）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sideValue` | `number` | `identity` | back / mid 位置的目标值 |
| `centerValue` | `number` | `identity` | center 位置的目标值 |
| `exitValue` | `number` | = centerValue | exit 位置的目标值 |
| `stay` | `number \| { timeline }` | — | center 停留期间：不传=保持 centerValue，数字=固定值，timeline=自定义 |

### I_CarouselOriginChannel（scale / rotation / skewX / skewY）

继承 `I_CarouselAnimChannel`，额外增加：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `origin` | `T_Origin` | `'Center'` | 变换原点 |

### I_CarouselTranslateChannel

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `stay` | `{ x, y } \| { timeline }` | — | center 停留期间叠加在主轨道 center 位置上的偏移 |

## Stack 位置模型

每个 slot 在周期内依次经过 4 个位置：

```
back ──> mid ──> center ──> exit
```

- `back`：最远离中心的一侧
- `mid`：back 与 center 之间
- `center`：屏幕中心，完全展示
- `exit`：沿 `angle` 方向飞出屏幕

位置由 `angle` 和 `itemGap` 自动计算，相邻 slot 间距 = `itemW + itemGap`（沿 angle 方向投影）。

## 常见效果

### 基础 Stack（缩放深度）

```tsx
<AnyCarousel angle={0} itemGap={60} childItems={[
  { url: "a.jpg", scale: { sideValue: 0.78, centerValue: 1 } },
  { url: "b.jpg", scale: { sideValue: 0.78, centerValue: 1 } },
  { url: "c.jpg", scale: { sideValue: 0.78, centerValue: 1 } },
]} />
```

### 垂直淡入淡出

```tsx
<AnyCarousel angle={90} itemGap={60} childItems={[
  { url: "a.jpg", opacity: { sideValue: 0.4, centerValue: 1 } },
  { url: "b.jpg", opacity: { sideValue: 0.4, centerValue: 1 } },
]} />
```

### 中心浮动 + 呼吸缩放

```tsx
<AnyCarousel angle={0} itemGap={60} childItems={[
  {
    url: "a.jpg",
    scale: {
      sideValue: 0.78,
      centerValue: 1,
      stay: { timeline: [
        { durationSeconds: 0.6, toAbs: 1.05 },
        { durationSeconds: 0.6, toAbs: 1 },
      ]},
    },
    translate: {
      stay: { timeline: [
        { durationSeconds: 0.6, toAbs: { x: 0, y: -8 } },
        { durationSeconds: 0.6, toAbs: { x: 0, y: 8 } },
      ]},
    },
  },
]} />
```

## 目录结构

```
AnyCarousel/
├── README.md
├── types.ts                       类型 + 默认值常量
├── utils/
│   ├── normalizer.ts              配置标准化 + 默认值填充 + 校验
│   └── rotationOrigin.ts          九宫格 origin → 局部坐标
└── timeline/
    └── offsetCalculator.ts        角度 → slot 位置 / exit 屏外偏移
```
