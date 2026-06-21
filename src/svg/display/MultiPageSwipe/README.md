# MultiPageSwipe

多卡抽拉分页器。N 个抽拉卡以零高视差叠在同一画布上，每卡含一个**右侧把手**（手动 `w/h/y`，`x` 自动靠右）+ 一组横向面板 `content`（向左抽拉）。复刻 e2.cool「零高容器 + 等分容器滑动 + 置顶框架 + 占位 + 二分栏」结构。

## 最小用法

```tsx
import { MultiPageSwipe } from 'expub-tool'

<MultiPageSwipe
  canvasSize={{ w: 1080, h: 1680 }}
  canvasBg={{ url: 'https://...bg.png' }}
  childItems={[
    {
      tagHandle: { url: 'handle1.png', w: 200, h: 400, y: 0 },
      content: [{ url: 'p1.png' }, { url: 'p2.png' }],
    },
    {
      tagHandle: { url: 'handle2.png', w: 200, h: 400, y: 420 },
      content: [{ url: 'p3.png' }, { url: 'p4.png' }],
    },
  ]}
/>
```

把手、背景、面板都支持 jsx。

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w: number; h: number }` | — | SVG viewBox 尺寸（必填） |
| `canvasBg` | `{ url?: string; jsx?: ReactNode }` | — | 整体背景层（渲染在所有卡背后） |
| `childItems` | `I_MultiPageSwipeChildItem[]` | — | N 个抽拉卡（必填） |
| `spacing` | `T_SpacingProps` | 全 0 | 外间距 |

### I_MultiPageSwipeChildItem

| 字段 | 类型 | 说明 |
|---|---|---|
| `tagHandle` | `I_TagHandle` | 右侧把手 |
| `content` | `{ url?, jsx? }[]` | 向左抽拉的横向面板（至少 1 张） |

### I_TagHandle

| 字段 | 类型 | 说明 |
|---|---|---|
| `url` / `jsx` | `string` / `ReactNode` | 把手内容（二选一） |
| `w` | `number` | 宽（viewBox） |
| `h` | `number` | 高（viewBox） |
| `y` | `number` | 顶部 Y（viewBox）；`x` 自动靠右 = `canvasW - w` |

## 注意事项

- 各卡为零高视差叠加，**只有 DOM 最后一张完全可见**，其余靠面板图透明处透出——要多卡都见，面板图需自带透明区。
- 把手槽是全段唯一 `pointer-events: visible`，但**不接点击动作**（参考原样未接 SMIL）；需交互请在把手 `jsx` 内自行加 SMIL。
- 把手在 slide-1 内、随轨道横向抽拉；拽把手往左 = 抽拉出 `content` 面板。
- 单卡横向抽拉满屏、不 peek、不吸附；需要 peek 用 `SwipePager` + `peekWidth`。
