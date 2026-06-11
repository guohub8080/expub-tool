# Cover — 层层覆盖滑入/滑出组件

多张图片按 z 轴层叠，依次滑入覆盖（CoverIn）或依次滑出退场（CoverOut），形成层层刷新效果。

- **CoverIn**：后渲染的 DOM 元素在 SVG z 轴上方，新图从屏外滑入覆盖当前画面。
- **CoverOut**：渲染顺序倒序（图 N 在最下，图 0 在最上），顶层图依次滑出，露出下层图片。

## 使用

```tsx
import { CoverIn, CoverOut } from "expub-tool/svg"

<CoverIn
  canvasSize={{ w: 300, h: 400 }}
  childItems={[
    { url: "https://example.com/a.jpg" },
    { url: "https://example.com/b.jpg", direction: "T" },
    { url: "https://example.com/c.jpg", direction: "R", switchDuration: 0.8 },
  ]}
/>

<CoverOut
  canvasSize={{ w: 300, h: 400 }}
  childItems={[
    { url: "https://example.com/a.jpg" },
    { url: "https://example.com/b.jpg", direction: "T" },
    { url: "https://example.com/c.jpg", direction: "R", switchDuration: 0.8 },
  ]}
/>
```

## Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `canvasSize` | `{ w: number; h: number }` | 是 | SVG 画布尺寸 |
| `childItems` | `I_CoverChildItem[]` | 是 | 图片/内容配置数组，至少 1 张（单张会自动复制为 2 张） |
| `spacing` | `T_SpacingProps` | 否 | 外间距 |
| `canvasBg` | `I_CanvasBg` | 否 | 画布背景 |

## I_CoverChildItem — 单项配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | — | 图片地址（与 `jsx` 二选一） |
| `jsx` | `ReactNode` | — | 自定义内容（优先级高于 `url`） |
| `switchDuration` | `number` | `0.5` | 滑入/滑出时长（秒） |
| `stayDuration` | `number` | `0.5` | 停留时长（秒） |
| `direction` | `T_Direction8` | `"B"` | 滑入/滑出方向 |
| `keySplines` | `string` | `"0.42 0 0.58 1"` | 缓动贝塞尔曲线（ease-in-out） |

### T_Direction8 方向值

| 值 | 含义 | 值 | 含义 |
|----|------|----|------|
| `"L"` | 左 | `"R"` | 右 |
| `"T"` | 上 | `"B"` | 下 |
| `"TL"` | 左上 | `"TR"` | 右上 |
| `"BL"` | 左下 | `"BR"` | 右下 |

每张图可独立配置不同方向、时长和缓动。

## 动画原理

### 两阶段设计

两个组件共享相同的两阶段动画架构，保证首尾相接无缝循环：

- **阶段 1 — 首轮（`repeatCount=1`, `fill=freeze`）**：一次性播放，结束时画面停留在最终状态。
- **阶段 2 — 循环（`repeatCount=indefinite`）**：阶段 1 结束时立即接管（`begin = firstRoundDuration`），无限循环。

### CoverIn 的时间轴

```
底层静态图 0（无动画，始终在最底层，被动画层覆盖）
阶段 1 — 图 1..N-1 依次从屏外滑入覆盖（一次性）
阶段 2 — 图 0..N-1 全部循环滑入（无限）
```

静态图 0 在最底层；循环重置时动画图 0 回到中心盖住静态图 0，视觉无缝衔接。

每张图的 3 段时间线：

```
┌──────────┬──────────┬──────────┐
│  等待段   │  滑入段   │  保持段   │
│  wait    │ switchDur │ after    │
└──────────┴──────────┴──────────┘
```

- **等待段**：foreignObject 在屏外不动（translate 保持初始偏移）
- **滑入段**：通过 additive translate 滑到中心，覆盖前一张
- **保持段**：在中心停留（fill=freeze 保持最终状态），直到所有图完成首轮

### CoverOut 的时间轴

```
底层静态图 0（最后一张滑走后露出）
阶段 1 — 所有图在中心，依次滑出退场（一次性，渲染顺序倒序）
阶段 2 — 所有图循环滑出（无限）
```

渲染顺序倒序（图 N-1 在最下，图 0 在最上），利用 SVG painter's algorithm，顶层图先滑出走，露出下层。

每张图的 3 段时间线：

```
┌──────────┬──────────┬──────────┐
│  可见段   │  滑出段   │  等待段   │
│  visible │ switchDur │  hold    │
└──────────┴──────────┴──────────┘
```

- **可见段**：foreignObject 在中心静止
- **滑出段**：通过 additive translate 滑到屏外
- **等待段**：在屏外等待下一轮循环

### 方向偏移计算

`offsetCalculator.ts` 提供两个函数：

- **`getEntryOffset(direction, w, h)`** — foreignObject 的 x/y 初始坐标（屏外位置）
- **`getExitOffset(direction, w, h)`** — 从屏外滑到中心所需的相对位移

以 `direction = "L"`（从左侧进入）为例：

```
getEntryOffset("L", 300, 400) → { x: 300, y: 0 }     // 放在右侧屏外
getExitOffset("L", 300, 400)  → { x: -300, y: 0 }    // 向左滑 300px 到达中心
```

对角线方向同时偏移两个轴：

```
getEntryOffset("TL", 300, 400) → { x: 300, y: 400 }   // 右下屏外
getExitOffset("TL", 300, 400)  → { x: -300, y: -400 } // 向左上滑到中心
```

## 常见效果示例

### 默认覆盖（从下方滑入）

```tsx
<CoverIn
  canvasSize={{ w: 300, h: 400 }}
  childItems={[
    { url: "a.jpg" },
    { url: "b.jpg" },
    { url: "c.jpg" },
  ]}
/>
```

### 混合方向

```tsx
<CoverIn
  canvasSize={{ w: 300, h: 400 }}
  childItems={[
    { url: "a.jpg", direction: "R" },
    { url: "b.jpg", direction: "T" },
    { url: "c.jpg", direction: "BR" },
  ]}
/>
```

### 自定义 JSX 内容

```tsx
<CoverIn
  canvasSize={{ w: 300, h: 300 }}
  childItems={[
    { jsx: <MySvgContent /> },
    { url: "b.jpg", direction: "L" },
  ]}
/>
```

### CoverOut 退场效果

```tsx
<CoverOut
  canvasSize={{ w: 300, h: 400 }}
  childItems={[
    { url: "a.jpg", switchDuration: 0.8, direction: "T" },
    { url: "b.jpg", switchDuration: 0.3, direction: "R" },
    { url: "c.jpg", direction: "B" },
  ]}
/>
```

## 目录结构

```
Cover/
├── README.md                  本文档
├── types.ts                   类型定义 + 默认值常量
├── utils/
│   └── normalizer.ts          配置标准化（填充默认值、校验、单图复制、总时长计算）
├── timeline/
│   └── offsetCalculator.ts    方向→位移坐标计算（getEntryOffset / getExitOffset）
├── CoverIn/
│   └── index.tsx              CoverIn 组件（层层覆盖滑入）
└── CoverOut/
    └── index.tsx              CoverOut 组件（层层覆盖滑出）
```

### 各文件职责

- **`types.ts`** — 类型（`I_CoverChildItem`、`I_NormalizedCoverItem`）和默认值常量（`DEFAULT_SWITCH_DURATION`、`DEFAULT_STAY_DURATION`、`DEFAULT_DIRECTION`、`DEFAULT_KEY_SPLINES`）
- **`utils/normalizer.ts`** — 将用户传入的 `I_CoverChildItem[]` 转为 `I_NormalizedCoverItem[]`：填充默认值、空数组报错、单图复制为 2 张；提供 `calcTotalDuration` 计算总周期时长
- **`timeline/offsetCalculator.ts`** — 根据方向和画布尺寸计算 foreignObject 的初始屏外坐标（`getEntryOffset`）和滑入/滑出的相对位移（`getExitOffset`）
- **`CoverIn/index.tsx`** — CoverIn 主组件：解析配置，渲染底层静态图 + 首轮滑入层 + 循环滑入层
- **`CoverOut/index.tsx`** — CoverOut 主组件：解析配置，渲染倒序图层 + 首轮滑出层 + 循环滑出层
