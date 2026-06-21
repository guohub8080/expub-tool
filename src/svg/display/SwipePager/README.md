# SwipePager

横向可抽拉分页器。N 个 slide 排在横向轨道上，用户自由横向抽拉（滚动）浏览，不吸附。容器背景独立成一层，渲染在轨道背后。

## 最小用法

```tsx
import { SwipePager } from 'expub-tool'

<SwipePager
  canvasSize={{ w: 1080, h: 1680 }}
  canvasBg={{ url: 'https://...bg.png' }}
  items={[
    { url: 'https://...page1.png' },
    { url: 'https://...page2.png' },
    { url: 'https://...page3.png' },
  ]}
/>
```

背景与 slide 都支持 jsx（动效 / 复杂结构）：

```tsx
<SwipePager
  canvasSize={{ w: 1080, h: 1680 }}
  canvasBg={{ jsx: <BgComps /> }}
  items={[{ url: '...' }, { jsx: <SlideComps /> }]}
/>
```

代码级 peek（露出下一张，viewBox 单位）：

```tsx
<SwipePager
  canvasSize={{ w: 1080, h: 1680 }}
  peekWidth={108}            // 每个 slide 占 972，右侧露出下一张 108
  items={[{ url: '...' }, { url: '...' }, { url: '...' }]}
/>
```

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w: number; h: number }` | — | SVG viewBox 尺寸，同时决定每个 slide 的宽高比（必填） |
| `canvasBg` | `{ url?: string; jsx?: ReactNode }` | — | 容器背景层（渲染在轨道背后）；url 与 jsx 二选一，不传则无背景 |
| `items` | `{ url?: string; jsx?: ReactNode }[]` | — | 滑块数组（必填） |
| `peekWidth` | `number` | `0` | 露出下一张的宽度（viewBox 单位，同 `canvasSize.w`）；`0` = 每张满屏不露出；范围 `[0, canvasSize.w)` |
| `spacing` | `T_SpacingProps` | 全 0 | 外间距 |

## 注意事项

- `url` 与 `jsx` 二选一；都为空则该单元不渲染。
- 容器背景为零高 + `overflow: visible` 层，渲染在轨道背后——slide 不透明处会遮住背景，仅 slide 透明处可见背景。
- `peekWidth > 0` 时每个 slide 会等比缩到 `(canvasSize.w - peekWidth)` 宽（高度同步等比），腾出空间露出下一张。这是 CSS 滚动常驻 peek 的唯一干净做法。小 peek（如 `peekWidth/canvasSize.w < 20%`）几乎无感。
- 自由滚动、**不吸附**；需要吸附用 `SnapSwipeViewXContainer`。
- 不内置右侧导航栏等模板 chrome，需要自行在外层组合。
