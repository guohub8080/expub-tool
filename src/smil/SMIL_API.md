# SMIL 动画工具函数接口文档

所有函数均通过 `expub-tool/smil` 导入。timeline 统一使用 `I_TimelineKeyframe<T>` 格式。

---

## 核心：timeline 格式

所有动画函数共享同一个时间线格式，由 `compileTimeline` 编译为 SMIL 的 `values` / `keyTimes` / `keySplines`。

```ts
interface I_TimelineKeyframe<T> {
  /** 本段持续时长（秒），所有段的 durationSeconds 之和 = 动画总时长 */
  durationSeconds: number
  /** 本段结束时的目标值（省略则保持上一帧） */
  to?: T
  /** 贝塞尔缓动参数 "x1 y1 x2 y2"，省略则线性 "0 0 1 1" */
  keySplines?: string
}
```

**关键理解：** 每个函数接收 `initValue` + `timeline[]`，编译后生成：
- `values`: n+1 个值（initValue + 每个 timeline 段的 to）
- `keyTimes`: n+1 个时间点（0 到 1）
- `keySplines`: n 个缓动参数（每段一个）

---

## animateTransform 系列

所有 `<animateTransform>` 生成函数。对应 SVG 的 `type="translate|scale|rotate|skewX|skewY"`。

### 公共参数

所有 animateTransform 函数共享以下参数：

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `initValue` | 各函数不同 | 各函数默认 | 初始值 |
| `timeline` | `I_TimelineKeyframe<T>[]` | —（必填） | 时间线段数组 |
| `begin` | `string` | — | SMIL begin 属性（如 `"0s"`, `"click"`） |
| `calcMode` | `'spline' \| 'linear' \| 'discrete' \| 'paced'` | 自动推断 | 有 keySplines 时默认 `'spline'`，否则 `'linear'` |
| `isFreeze` | `boolean` | `false` | `true` = `fill="freeze"`（动画结束后保持），`false` = `fill="remove"` |
| `loopCount` | `number` | `1` | 重复次数，`0` = `indefinite`（无限循环） |
| `isAdditive` | `boolean` | `true`（大多数）/ `false`（scale） | `true` = `additive="sum"`（叠加到已有 transform），`false` = 替换 |
| `restart` | `'always' \| 'whenNotActive' \| 'never'` | — | 重启策略 |
| `native` | `T_NativeAnimateTransform` | — | 透传给底层 `<animateTransform>` 的额外属性 |

---

### transformTranslate

**生成标签：** `<animateTransform type="translate">`

```ts
import { transformTranslate } from 'expub-tool/smil'

transformTranslate({
  initValue: { x: 0, y: 0 },      // 初始位置
  timeline: [
    { durationSeconds: 1, to: { x: 100, y: 0 } },
    { durationSeconds: 2, to: { x: 100, y: 50 } },
  ],
  begin: '0s',
  isFreeze: true,
  loopCount: 0,                     // 无限循环
  isAdditive: false,
  isRelativeMove: false,            // true = to 是相对偏移量，false = to 是绝对坐标
  restart: 'whenNotActive',
})
```

| 特有参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `initValue` | `Partial<{ x: number; y: number }>` | `{ x: 0, y: 0 }` | 初始坐标 |
| `timeline[].to` | `Partial<{ x: number; y: number }>` | 保持上一帧 | 目标坐标（x/y 可省略） |
| `isRelativeMove` | `boolean` | `true` | `true` = to 值累加到上一帧，`false` = to 值是绝对坐标 |

**序列化格式：** `"x y"` — 如 `"100 0; 100 50"`

---

### transformScale

**生成标签：** 三个 `<animateTransform>` 元素（translate → scale → translate-back），实现以指定点为原点的缩放。

```ts
import { transformScale } from 'expub-tool/smil'

transformScale({
  initValue: 1,
  timeline: [
    { durationSeconds: 0.5, to: 1.4 },
    { durationSeconds: 0.5, to: 1 },
  ],
  origin: [150, 150],               // 缩放中心点 [cx, cy]
  begin: '0s',
  keySplines: getEaseBezier({ isIn: true, isOut: true }),
})
```

| 特有参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `initValue` | `number` | `1` | 初始缩放比例 |
| `origin` | `[number, number]` | —（必填） | 缩放中心点 `[cx, cy]` |
| `isAdditive` | `boolean` | `true` | 三个 animateTransform 均使用 additive |

---

### transformScaleRaw

**生成标签：** 单个 `<animateTransform type="scale">`，无原点补偿。适合已经通过 `<g transform="translate(cx,cy)">` 定位过原点的场景。

```ts
import { transformScaleRaw } from 'expub-tool/smil'

transformScaleRaw({
  initValue: 1,
  timeline: [
    { durationSeconds: 0.35, to: 1 },
    { durationSeconds: 0.10, to: 0.75 },
    { durationSeconds: 0.10, to: 1.5 },
    { durationSeconds: 0.10, to: 0.75 },
    { durationSeconds: 0.10, to: 1 },
    { durationSeconds: 4.25, to: 1 },
  ],
  begin: '0s',
  loopCount: 0,
  isFreeze: true,
  isAdditive: false,
})
```

| 特有参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `initValue` | `number` | `1` | 初始缩放比例 |
| `isAdditive` | `boolean` | `false` | 默认不叠加 |

**序列化格式：** `"s s"` — 如 `"1 1; 0.75 0.75; 1.5 1.5"`（x/y 等比缩放）

---

### transformRotate

**生成标签：** `<animateTransform type="rotate">`

```ts
import { transformRotate } from 'expub-tool/smil'

transformRotate({
  initValue: 0,
  timeline: [
    { durationSeconds: 1, to: 360 },
  ],
  origin: [150, 150],               // 旋转中心 [cx, cy]
  begin: '0s',
  loopCount: 0,
  isFreeze: true,
})
```

| 特有参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `initValue` | `number` | `0` | 初始角度（度） |
| `origin` | `[number, number]` | —（必填） | 旋转中心 `[cx, cy]` |
| `isRelativeRotate` | `boolean` | `false` | `true` = to 值累加到上一帧 |

**序列化格式：** `"angle cx cy"` — 如 `"0 150 150; 360 150 150"`

---

### transformSkewX / transformSkewY

**生成标签：** `<animateTransform type="skewX">` / `<animateTransform type="skewY">`

```ts
import { transformSkewX, transformSkewY } from 'expub-tool/smil'

transformSkewX({
  initValue: 0,
  timeline: [
    { durationSeconds: 0.3, to: 10 },
    { durationSeconds: 0.3, to: 0 },
  ],
  begin: '0s',
  isFreeze: true,
})
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `initValue` | `number` | `0` | 初始角度（度） |

---

## animate 系列

所有 `<animate>` 生成函数。通用底层是 `animateAttribute`，上层封装了 `animateOpacity`、`animateWidth` 等快捷函数。

### animateAttribute（通用）

**生成标签：** `<animate>`

```ts
import { animateAttribute } from 'expub-tool/smil'

animateAttribute<number>({
  attributeName: 'opacity',
  initValue: 1,
  timeline: [
    { durationSeconds: 0.5, to: 0 },
  ],
  begin: '0s',
  isFreeze: true,
})
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `attributeName` | `string` | —（必填） | SVG 属性名 |
| `initValue` | `T` | —（必填） | 初始值 |
| `timeline` | `I_TimelineKeyframe<T>[]` | —（必填） | 时间线 |
| `isFreeze` | `boolean` | `false` | `fill="freeze"` |
| `loopCount` | `number` | `1` | `0` = indefinite |
| `restart` | `'always' \| 'whenNotActive' \| 'never'` | — | 重启策略 |
| `native` | `T_NativeAnimate` | — | 透传给 `<animate>` |

---

### animateOpacity

**生成标签：** `<animate attributeName="opacity">`

```ts
import { animateOpacity } from 'expub-tool/smil'

animateOpacity({
  initValue: 1,
  timeline: [
    { durationSeconds: 0.5, to: 0 },
    { durationSeconds: 4.5, to: 0 },
  ],
  begin: '0s',
  loopCount: 0,
  isFreeze: true,
})
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `initValue` | `number` | `1` | 初始透明度 |
| `isFreeze` | `boolean` | `false` | `fill="freeze"` |

### 其他 animate 快捷函数

命名规则：`animate` + 属性名首字母大写。

| 函数 | attributeName | initValue 默认 |
|---|---|---|
| `animateWidth` | `width` | — |
| `animateHeight` | `height` | — |
| `animateX` | `x` | — |
| `animateY` | `y` | — |
| `animateFill` | `fill` | — |
| `animateStroke` | `stroke` | — |
| `animateStrokeWidth` | `stroke-width` | — |
| `animateRx` / `animateRy` | `rx` / `ry` | — |
| `animateR` | `r` | — |
| `animateCx` / `animateCy` | `cx` / `cy` | — |
| `animateD` | `d` | — |

---

## set 系列

所有 `<set>` 生成函数。`<set>` 是瞬时状态切换（无过渡动画）。

### setAttribute（通用）

```ts
import { setAttribute } from 'expub-tool/smil'

setAttribute({
  attributeName: 'visibility',
  to: 'hidden',
  begin: 'click',
  isFreeze: true,
})
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `attributeName` | `string` | —（必填） | SVG 属性名 |
| `to` | `string` | —（必填） | 目标值 |
| `begin` | `string` | — | 触发时机 |
| `isFreeze` | `boolean` | `true` | `fill="freeze"` |
| `loopCount` | `number` | `1` | `0` = indefinite |

### 快捷函数

| 函数 | attributeName | to 类型 |
|---|---|---|
| `setVisibility` | `visibility` | `'visible' \| 'hidden' \| 'collapse'` |
| `setOpacity` | `opacity` | `number` |
| `setDisplay` | `display` | `string` |
| `setFill` | `fill` | `string` |
| `setStroke` | `stroke` | `string` |
| `setStrokeWidth` | `stroke-width` | `string` |
| `setX` / `setY` | `x` / `y` | `string` |
| `setWidth` / `setHeight` | `width` / `height` | `string` |
| `setRx` / `setRy` | `rx` / `ry` | `string` |
| `setR` | `r` | `string` |
| `setCx` / `setCy` | `cx` / `cy` | `string` |
| `setHref` | `href` | `string` |

---

## bezier 缓动函数

生成 SVG `keySplines` 所需的 `"x1 y1 x2 y2"` 字符串。所有值均在 [0, 1] 范围内，SVG 安全。

```ts
import { getEaseBezier, getSineBezier } from 'expub-tool/smil'
```

### 通用接口

所有 bezier 函数共享相同的参数接口：

```ts
(options?: { isIn?: boolean; isOut?: boolean }) => string
```

| 参数组合 | 效果 |
|---|---|
| `{}` | 默认曲线 |
| `{ isIn: true }` | ease-in（慢→快） |
| `{ isOut: true }` | ease-out（快→慢） |
| `{ isIn: true, isOut: true }` | ease-in-out（两端慢） |

### SVG 安全（值在 [0,1]）

| 函数 | 说明 |
|---|---|
| `getLinearBezier` | 线性 `"0 0 1 1"` |
| `getEaseBezier` | CSS 标准 ease 系列 |
| `getSineBezier` | 正弦缓动 |
| `getCircleBezier` | 圆形缓动 |
| `getExpoBezier` | 指数缓动 |
| `getPowerBezier` | 幂次缓动 |

### 非 SVG 安全（值可能超出 [0,1]，仅用于 CSS）

| 函数 | 说明 |
|---|---|
| `getElasticBezier0_1` | 弹性效果 |
| `getBounceBezier0_1` | 弹跳效果 |
| `getBackBezier0_1` | 回弹效果 |

⚠️ SVG `keySplines` 属性要求所有 4 个值在 [0, 1] 范围内。elastic / bounce / back 会产生超出范围的值，**不能用于 SVG `keySplines`**。

---

## genSvgKeySplines（独立时间线编译器）

不依赖 React，纯函数。手动构建 `values` / `keyTimes` / `keySplines`。

```ts
import { genSvgKeySplines } from 'expub-tool/smil'

const result = genSvgKeySplines({
  initValue: 0,
  timeline: [
    { keySplines: '0.42 0 0.58 1', toValue: 100, durationSeconds: 2 },
    { keySplines: '0 0 0.58 1', toValue: 200, durationSeconds: 3 },
  ],
})
// result.keyTimes  = "0;0.4;1"
// result.keySplines = "0.42 0 0.58 1;0 0 0.58 1"
// result.values     = "0;100;200"
// result.totalDuration = 5
```

---

## compileTimeline（底层编译器）

所有 animate / animateTransform 函数的底层。一般不直接使用，除非需要自定义序列化。

```ts
import { compileTimeline } from 'expub-tool/smil'

const result = compileTimeline<number>(
  keyframes,       // I_TimelineKeyframe<number>[]
  serializer,      // (value: T) => string
  initValue,       // T
)
// => { values: string, keyTimes: string, keySplines: string, totalDuration: number }
```

---

## 常量

```ts
import { LINEAR_KEY_SPLINE } from 'expub-tool/smil'
// "0 0 1 1" — 线性缓动
```
