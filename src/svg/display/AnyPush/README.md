# AnyPush — 多图循环"推入"切换组件

图片从不同方向（左/右/上/下）滑入屏幕中心，停留后沿另一方向滑出，多张图片交替执行形成无限循环。

## 使用

```tsx
import { AnyPush } from "expub-tool/svg"

<AnyPush
  canvasSize={{ w: 300, h: 500 }}
  pics={[
    { url: "https://example.com/a.jpg", direction: "R" },
    { url: "https://example.com/b.jpg", direction: "L" },
    { url: "https://example.com/c.jpg", direction: "T" },
  ]}
/>
```

## Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `pics` | `I_PicConfig[]` | 是 | 图片配置数组，至少 1 张（单张会自动复制为 2 张） |
| `canvasSize` | `T_CanvasSize` | 否 | 画布尺寸 `{ w, h }`，省略则从图片 URL 异步获取 |
| `spacing` | `T_SpacingProps` | 否 | 外间距 `{ mt, mb, ml, mr }` |

## I_PicConfig — 单张图片配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | — | 图片地址 |
| `direction` | `T_Direction` | `"R"` | 滑入方向：`"L"` 左 / `"R"` 右 / `"T"` 上 / `"B"` 下 |
| `switchDuration` | `number` | `0.5` | 滑入/滑出的时长（秒） |
| `stayDuration` | `number` | `0.5` | 在中心停留的时长（秒） |
| `keySplines` | `string` | ease-in-out | 缓动贝塞尔曲线 |

每张图独立配置，可以混用不同方向、时长和缓动。

## 动画原理

### 4 段时间线

每张图片经历 4 个阶段，循环执行：

```
┌──────────┬──────────┬──────────┬──────────┐
│  进入段   │  停留段   │  退出段   │  保持段   │
│switchDur │ stayDur  │nextSwitch│ holdTime │
└──────────┴──────────┴──────────┴──────────┘
```

1. **进入段** — 从屏幕外滑入中心（`switchDuration`）
2. **停留段** — 在中心保持静止（`stayDuration`）
3. **退出段** — 从中心滑出到屏幕外（下一张的 `switchDuration`）
4. **保持段** — 在屏幕外等待下一轮（自动计算）

所有图片共享同一个总周期时长（`Σ(switchDuration + stayDuration)`），通过 delay 错开启动时间实现无缝循环。

### 时间计算详解

循环动画最困难的部分是时间线的精确计算。核心约束：**每张图的 4 段时间之和必须等于总周期时长**，否则循环接缝处会出现跳跃。

#### 1. 总周期时长

```
totalCycleDuration = Σ(每张图的 switchDuration + stayDuration)
```

例如 2 张图，各 switch=0.5, stay=0.5：

```
total = (0.5 + 0.5) + (0.5 + 0.5) = 2.0s
```

#### 2. 延迟启动时间（delay）

delay 作为 `<animateTransform begin="...">` 的值，决定每张图何时开始自己的 4 段动画。SMIL 支持负值，表示提前开始。

```
图0: delay = -switchDuration[0]          // 提前启动，周期起点时已经滑到中心
图1: delay = stayDuration[0]             // 等图0停留结束后开始
图2: delay = stay[0] + switch[1] + stay[1]  // 累加前面的时间
图N: delay = Σ(前面所有图的 switch + stay)
```

**为什么图 0 是负数？** 因为图 0 必须在周期起点就已经在中心位置，而不是从屏幕外开始。要实现"已经在中心"，就必须提前 `switchDuration` 秒启动动画。

#### 3. 保持时间（holdTime）

每张图的 4 段时间必须精确等于 `totalCycleDuration`：

```
holdTime = totalCycleDuration - switchDuration - stayDuration - nextSwitchDuration
```

这段时间图片停在屏幕外不动，等待其他图完成它们的动画，直到自己的下一轮进入。

#### 4. 完整时序图

以 2 张图为例（各 switch=0.5, stay=0.5, total=2.0s）：

```
时间轴:  0.0       0.5       1.0       1.5       2.0
         |         |         |         |         |
图0:     [===进入===][==停留==][===退出===][===保持===]
         ←─ delay=-0.5s ─→                           (提前启动)
         
图1:               [===进入===][==停留==][===退出===][===保持===]
                    ← delay=0.5s →                    (图0停留后启动)

         |         |         |         |         |
         周期起点    图0可见    图1进入    图1可见    周期终点=下一轮起点
```

验证每张图的总时长：
- 图0: 0.5(进入) + 0.5(停留) + 0.5(退出) + 0.5(保持) = 2.0s ✓
- 图1: 0.5(进入) + 0.5(停留) + 0.5(退出) + 0.5(保持) = 2.0s ✓

循环衔接：图0 的保持段结束时刻 = 图0 的下一轮进入段开始时刻，无缝衔接。

### 3 张图混合时长示例

```
pics: [
  { switch: 0.8, stay: 0.4 },  // 图0
  { switch: 0.6, stay: 0.2 },  // 图1
  { switch: 1.0, stay: 0.5 },  // 图2
]

total = (0.8+0.4) + (0.6+0.2) + (1.0+0.5) = 3.5s

delay:
  图0: -0.8
  图1: 0.4
  图2: 0.4 + 0.6 + 0.2 = 1.2

holdTime:
  图0: 3.5 - 0.8 - 0.4 - 0.6 = 1.7
  图1: 3.5 - 0.6 - 0.2 - 1.0 = 1.7
  图2: 3.5 - 1.0 - 0.5 - 0.8 = 1.2
```

验证：
- 图0: 0.8 + 0.4 + 0.6 + 1.7 = 3.5s ✓
- 图1: 0.6 + 0.2 + 1.0 + 1.7 = 3.5s ✓
- 图2: 1.0 + 0.5 + 0.8 + 1.2 = 3.5s ✓

## 常见效果示例

### 基础推入切换（默认）

```tsx
<AnyPush pics={[
  { url: "a.jpg" },
  { url: "b.jpg" },
]} />
```

### 跑马灯（匀速穿过）

```tsx
<AnyPush pics={[
  { url: "a.jpg", direction: "R", switchDuration: 1, stayDuration: 0, keySplines: "0 0 1 1" },
  { url: "b.jpg", direction: "R", switchDuration: 1, stayDuration: 0, keySplines: "0 0 1 1" },
]} />
```

`stayDuration: 0` 不停留，`keySplines: "0 0 1 1"` 线性匀速。

### 快闪

```tsx
<AnyPush pics={[
  { url: "a.jpg", switchDuration: 0.3, stayDuration: 0.2 },
  { url: "b.jpg", switchDuration: 0.3, stayDuration: 0.2 },
  { url: "c.jpg", switchDuration: 0.3, stayDuration: 0.2 },
]} />
```

### 混合方向

```tsx
<AnyPush pics={[
  { url: "a.jpg", direction: "R", switchDuration: 0.8 },
  { url: "b.jpg", direction: "T", switchDuration: 0.6 },
  { url: "c.jpg", direction: "L", switchDuration: 1.0 },
]} />
```

## 目录结构

```
AnyPush/
├── index.tsx              # 主组件入口
├── types.ts               # 类型定义 + 默认值常量
├── README.md
├── config/
│   └── normalizer.ts      # 配置标准化（填充默认值、校验、单图复制）
├── components/
│   └── PushingImage.tsx   # 单张图片渲染 + SMIL 动画
└── timeline/
    ├── offsetCalculator.ts    # 方向→位移坐标计算
    ├── segmentAssembler.ts    # 4 段时间线组装
    └── sequenceCalculator.ts  # 总周期 / delay / holdTime 计算
```

### 各文件职责

- **`types.ts`** — 类型（`I_PicConfig`、`I_NormalizedPicConfig`、`I_TimelineSegment`）和默认值常量（`DEFAULT_DIRECTION`、`DEFAULT_SWITCH_DURATION`、`DEFAULT_STAY_DURATION`）
- **`config/normalizer.ts`** — 将用户传入的 `I_PicConfig[]` 转为 `I_NormalizedPicConfig[]`：填充默认值、空数组报错、单图复制
- **`timeline/offsetCalculator.ts`** — 根据方向和 viewBox 尺寸计算 foreignObject 的初始坐标（`getEntryOffset`）和相对位移（`getExitOffset`）
- **`timeline/sequenceCalculator.ts`** — 计算总周期时长、每张图的延迟启动时间（delay）、屏幕外保持时间（holdTime）
- **`timeline/segmentAssembler.ts`** — 组合以上两者，为每张图片生成完整的 4 段时间线
- **`components/PushingImage.tsx`** — 渲染单张图片：foreignObject + SvgEx 背景图 + animateTransform 平移动画
- **`index.tsx`** — 主组件：解析 canvasSize、调用 normalizer、预计算总时长、遍历渲染 PushingImage
