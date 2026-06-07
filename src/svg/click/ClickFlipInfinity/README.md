# ClickFlipCard — 无限点击翻转卡牌

通过 SMIL 动画实现无限点击翻转的卡牌组件，支持正反面自定义内容。

## 原理

- **水平翻转**：`translate(中心) → scale(-1,1) → translate(-中心)` 以卡片水平中线为轴翻转
- **双镜像背面**：反面预先 `scale(-1,1)` 镜像，翻转后双重镜像 = 正常方向
- **状态机**：mousedown/touchstart 翻回 ↔ mouseup/click 翻转，双事件对交替
- **缩放联动**：width 100%↔200% + scale 0.5↔1，给翻转加"缩小→弹开"的 3D 感

## 导入

```ts
import { ClickFlipCard } from "expub-tool/svg"
import type { I_ClickFlipProps, I_FaceContent } from "expub-tool/svg"
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w: number; h: number }` | — | SVG viewBox 尺寸（必填） |
| `canvasBg` | `string` | `"#FFFFFF"` | 画布背景色 |
| `frontSide` | `I_FaceContent` | — | 正面内容（必填） |
| `backSide` | `I_FaceContent` | — | 反面内容（必填） |
| `flipDuration` | `number` | `1` | 翻转时长（秒），范围 0.3–1.5 |
| `spacing` | `T_SpacingProps` | — | 外层 margin-top 间距 |

### I_FaceContent

```ts
interface I_FaceContent {
  url?: string    // 图片地址（与 jsx 二选一）
  jsx?: ReactNode // 自定义 SVG 内容（优先级高于 url）
}
```

- 传 `url`：生成带背景图的 SVG
- 传 `jsx`：直接渲染用户提供的 ReactNode，可包含任意复杂 SVG + 动画

## 用法

### 图片模式

```tsx
<ClickFlipCard
  canvasSize={{ w: 750, h: 850 }}
  frontSide={{ url: "https://example.com/front.png" }}
  backSide={{ url: "https://example.com/back.png" }}
/>
```

### 自定义 SVG 内容

```tsx
<ClickFlipCard
  canvasSize={{ w: 750, h: 850 }}
  canvasBg="#f0f0f0"
  flipDuration={1}
  frontSide={{
    jsx: (
      <svg viewBox="0 0 750 850" style={{ width: "100%", background: "url(...) 0 0 / 100% 100% no-repeat" }}>
        {/* 任意复杂的 SVG 内容 + SMIL 动画 */}
      </svg>
    )
  }}
  backSide={{
    jsx: (
      <svg viewBox="0 0 750 850" style={{ width: "100%", background: "url(...) 0 0 / 100% 100% no-repeat" }}>
        {/* 反面内容 */}
      </svg>
    )
  }}
/>
```

## flipDuration 限制

`flipDuration` 被限制在 **0.3s – 1.5s** 范围内，超出部分会被自动 clamp。

**原因**：翻转动画使用 mousedown/mouseup 双事件状态机驱动。每次点击两个事件都会触发，各自定义了绝对起始值。如果翻转速度太慢，用户在动画进行中再次点击会导致可见的闪烁（动画被强制跳到绝对起始值）。≤1.5s 时动画足够快，闪烁不可感知。

## 目录结构

```
src/svg/click/ClickFlipCard/
├── index.tsx           # 主组件
├── types.ts            # Props 类型定义
├── FaceContent.tsx     # 正/反面内容渲染（url 或 jsx）
└── smil/
    ├── index.ts
    ├── widthToggle.tsx       # SVG width 100%↔200% 离散切换
    ├── scaleToggle.tsx       # 外层 scale 0.5↔1 离散切换
    ├── flipScaleAnim.tsx     # scale(-1,1)↔(1,1) 缓动翻转
    ├── opacityAnim.tsx       # 正面 opacity 0↔1 切换
    └── clickResetAnim.tsx    # translate ±10000 点击目标管理
```
