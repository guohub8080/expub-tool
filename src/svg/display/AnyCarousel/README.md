# AnyCarousel — 单向 CoverFlow 轮播（CoverFlow 架构基座）

> 当前为从 `CoverFlow/CoverFlowX` 抄过来的基座版本，待在此之上改造为「单向 + 中间允许 stay」的目标形态。

## 架构

N+3 个 slot 横向排开（首尾各一个 ghost 副本，不做动画），外层 `<g>` 用一条 `transformTranslate`（`isAdditive`）整体平移，让 slot 依次滑过中心；每个非首尾 slot 自带 `transformScaleRaw` + `transformTranslate` 两条 timeline，在到达中心段时放大、离开时缩回。

- 无 `getSlotPosition` 那套 boundary 数学，节奏由 `switchDuration` / `stayDuration` 直接驱动（偶数段=switch，奇数段=stay）。
- 当前是纯横向（X）版；垂直版参考 `CoverFlow/CoverFlowY`。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `canvasSize` | `{ w, h }` | — | SVG viewBox 尺寸 |
| `itemCanvasSize` | `{ w, h }` | — | 单张图渲染尺寸 |
| `childItems` | `I_CoverFlowItemConfig[]` | — | 子项，≥1 |
| `itemGap` | `number` | `100` | 相邻 slot 间距 |
| `itemScale` | `number` | `1.4` | 中心放大比 |
| `itemAlign` | `'top'\|'center'\|'bottom'` | `'center'` | 垂直对齐 |
| `isReversed` | `boolean` | `false` | 反向（左进右出 ↔ 右进左出） |
| `canvasBg` | `I_CanvasBg` | — | 画布背景 |
| `spacing` | `T_SpacingProps` | — | 外间距 |

## I_CoverFlowItemConfig

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | — | 图片地址（与 `item` 二选一） |
| `item` | `ReactNode` | — | 自定义内容（优先级高于 `url`） |
| `switchDuration` | `number` | `0.5` | 切换时长（秒） |
| `stayDuration` | `number` | `1.0` | 中心停留时长（秒） |
| `keySplines` | `string` | ease-in-out | 缓动曲线 |

## 目录结构

```
AnyCarousel/
├── README.md
├── index.tsx                       主组件（CoverFlowX 架构）
├── types.ts                        类型 + 默认值常量
├── utils/
│   └── normalizer.ts               配置标准化 + 默认值 + 校验
└── timeline/
    ├── sequenceCalculator.ts       总周期时长
    └── positionCalculator.ts       peek/center 布局（当前未被主组件直接使用，备用）
```
