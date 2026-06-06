# 硬编码 SVG → React 组件 逆向工程流程

本文档描述将硬编码 SVG/HTML 参考代码还原为参数驱动 React 组件的标准流程。
以 `CoverFlow` 系列为参考案例。

## 核心思路

参考代码是**写死数据的最终产物**，组件是**能生成任意参数下同类产物的模板**。
逆向工程的目标：找出参考代码中所有的魔法数字，推导它们背后的计算公式，用 props 替换。

---

## 第一步：读懂参考代码的结构

先不管数字，搞清楚 DOM/SVG 树的层级关系：

- 最外层是什么容器？
- 每一层 `<g>` / `<div>` 的职责是什么？
- 动画加在哪一层？（位移在外层，缩放在内层，还是反过来？）

把层级用注释标出来，例如：

```
<g>                          <!-- 外层：整体平移（轮播驱动） -->
  <g transform="translate(x,y)">  <!-- slot 定位 -->
    <g>                      <!-- 缩放层 -->
      <g>                    <!-- 内容层 -->
        <foreignObject />
        <animateTransform /> <!-- scale 动画 -->
      </g>
      <animateTransform />   <!-- translate 补偿动画 -->
    </g>
  </g>
  <animateTransform />       <!-- 外层平移动画 -->
</g>
```

### 零高度容器（前后遮挡 / 视差叠层）

特征：`section` 带 `height: 0; display: block; pointer-events: none`，内部 SVG 正常渲染但不占文档流高度。下一个 `section` 上移覆盖，实现视觉叠加。

```html
<section style="height: 0; display: block; pointer-events: none;">
  <svg viewBox="0 0 300 300">...</svg>   <!-- 背景层，不占高度 -->
</section>
<section>                                <!-- 内容层，覆盖在背景上 -->
  ...
</section>
```

对应组件：`ZeroHeightContainer`（背景层）+ `spacing` prop 控制内容层的上移量。

### 远端定位热区

微信 SVG 不支持 JS，只能靠 SMIL 动画 + 极端坐标模拟"点击开关"。详见 [附录：热区模式](#附录热区模式)。

---

## 第二步：提取魔法数字，推导公式

把参考代码里所有写死的数值列出来，逐一问：**这个数字是怎么来的？**

常见模式：

| 写死的值 | 可能的公式 |
|---|---|
| `translate(350, 0)` | `centerX = (viewBoxW - imageW) / 2` |
| `translate(-150, 0)` | `scaleDx = -imageW * (scale - 1) / 2` |
| `values="1;1.4;1.4;1"` | `initValue`, `fullScale`, timeline 段数 |
| `dur="0.5s"` | `switchDuration` |
| `dur="1s"` | `stayDuration` |
| `repeatCount="3"` | `N`（图片数量） |

验证方法：把公式代入参考代码的具体数值，看是否吻合。

---

## 第三步：识别重复模式 → 循环/函数

参考代码里通常有 N 份几乎相同的结构（N = 图片数量）。
找出它们的差异规律，抽象为循环索引 `i` 的函数。

例如 CoverFlow 的 slot 定位：

```
// 参考代码（N=3，写死）
translate(700, 0)   // slot[0]
translate(350, 0)   // slot[1]  ← 中心
translate(0, 0)     // slot[2]
translate(-350, 0)  // slot[3]

// 推导公式
x = centerX + step - i * step   // step = imageW + gap
```

动画 `values` 的规律同理——找出每个 slot 在哪一段放大、哪一段缩回，抽象为 `buildSlotScale(activeIdx, N, ...)` 函数。

---

## 第四步：提取工具函数到独立文件

当 `index.tsx` 里出现以下情况时，把相关逻辑提取到子目录：

**提取到 `utils/`**：输入标准化、默认值填充、校验逻辑。

**提取到 `timeline/`**：纯数学计算，输入是 props 推导值，输出是动画所需的坐标序列或时长。

判断标准：
- 函数是**纯函数**（无副作用、无 JSX）→ 可以提取
- 函数超过 **15 行**或被**多处调用** → 应该提取
- 函数只在 `index.tsx` 里用一次且很短 → 留在 `index.tsx` 底部即可

提取后 `index.tsx` 只负责：读 props → 调用计算函数 → 组装 JSX。

---

## 第五步：确定 props 边界

不是所有魔法数字都要变成 prop，只有**用户合理需要调整**的才暴露：

| 应该是 prop | 应该是内部常量或计算值 |
|---|---|
| `canvasSize`、`itemCanvasSize` | slot 数量（`N + 3`，内部逻辑） |
| `itemGap`、`itemScale` | `scaleDx`、`scaleDy`（由其他 props 推导） |
| `switchDuration`、`stayDuration` | `step = imageW + gap`（推导值） |
| `itemAlign`、`isReversed` | `centerX`、`centerY`（推导值） |

### childItem 字段规范

- `url` 和 `jsx` 二选一，都为空则报错
- 每个 childItem 自带全部可配属性（`fadeDuration`、`keySplines` 等），**不要在组件 props 上设全局兜底**
- 不传则使用组件内部的 `DEFAULT_` 常量

**统一渲染路径**：不要根据 JSX/URL 走不同的渲染逻辑分支，统一用 `renderContent()` 函数。

---

## 第六步：判断是否需要拆分为多个组件

完成单个组件后，判断是否存在方向/模式变体需要拆分：

**应该拆分**（独立组件）：
- 两个变体的核心计算逻辑不同（如 X 轴平移 vs Y 轴平移），共用一个组件需要大量 `if (direction === 'x')` 分支
- 两个变体的 props 语义不同

**不需要拆分**（加 prop 即可）：
- 差异只是一个布尔值（如 `isReversed`）
- 差异只影响样式，不影响计算逻辑

拆分规范：
- 命名：横向 `FooX`，纵向 `FooY`
- 共享的 types、utils、timeline 放在主变体目录下，次变体直接 import
- `src/svg/index.ts` 中分别导出两个组件，共享类型只导出一次

---

## 第七步：验证

用参考代码的原始参数值实例化组件，对比输出的 HTML/SVG 是否与参考一致。

重点检查：
1. 初始帧（`initValue`）是否正确
2. 动画 `values` 序列是否与参考一致
3. 边界情况：N=1、N=2 时是否自动补齐

---

## 第八步：写 README

README 只需包含：
- 一句话描述
- 最小用法示例
- Props 表格
- 注意事项（边界情况）

不需要解释内部计算逻辑——那是代码注释的职责。

---

## 编码规范

### 默认值

一律用 `defaultTo(prop, fallback)`，不用解构默认值：

```ts
// ✅ 正确
const gap = defaultTo(props.itemGap, DEFAULT_ITEM_GAP)

// ❌ 错误
const { itemGap = DEFAULT_ITEM_GAP } = props
```

### spacing 替换规则

参考代码中的 `margin-top: -1px` 不硬编码，改用 `spacing` prop + `T_SpacingProps` 系统。其他 `margin` 值（`margin: 0 auto`、`margin-top: 0` 等）保持与参考一致，不替换。

### SVG 翻译三原则

1. **仅 `margin-top: -1px` 用 spacing 替换**，其余 margin 保持原样
2. **生成结果必须与参考代码完全一致**，除 spacing 和水印外
3. **开发模式标注组件身份** — `ExPubGoConfig().mode === 'development'` 时输出 `expubgo-label` 属性

### Object 参数风格

所有函数一律使用 Object 参数（不接受位置参数）：

```ts
// ✅ 正确
const foo = (props: { w: number; h: number }) => { ... }

// ❌ 错误
const foo = (w: number, h: number) => { ... }
```

### lodash 优先

类型判断、空判断、数学函数优先用 lodash 单包导入：

```ts
import max from 'lodash/max'
import min from 'lodash/min'
import isNil from 'lodash/isNil'
import defaultTo from 'lodash/defaultTo'
```

| 原生 Math | lodash 单包 | 说明 |
|---|---|---|
| `Math.max(a, b)` | `max([a, b])` | |
| `Math.min(a, b)` | `min([a, b])` | |
| `Math.floor(n)` | `floor(n)` | |
| `Math.round(n)` | `round(n)` | |
| `Math.sqrt(n)` | — | 无 lodash 等价物，保留 `Math.sqrt` |
| `Math.PI` | — | 无 lodash 等价物，保留 `Math.PI` |

### 方向常量

方向字符串一律使用 `DIRECTION_8` / `DIRECTION_4` 常量，禁止硬编码：

```ts
import { DIRECTION_8 } from '@svg/types'

// ✅ 正确
case DIRECTION_8.Left: ...
const defaultDir = DIRECTION_8.Top

// ❌ 错误
case "L": ...
const defaultDir = "T"
```

### 变量命名

变量名必须可读、自解释，禁止无意义缩写：

```ts
// ✅ 正确
const exitDistance = defaultTo(item.exit.distance, defaultExitDistance)
const totalCycleDuration = calculateTotalCycleDuration(items)

// ❌ 错误
const d = distance
const tot = calc(items)
```

例外：循环索引可用 `i`、`idx`。常量可在函数顶部用短名赋值一次，但参数名和接口字段必须全称。

### 目录结构

每个组件按职责拆分到独立文件：

```
src/svg/<category>/<ComponentName>/
├── index.tsx           # 主组件（读 props → 调用计算 → 组装 JSX）
├── types.ts            # Props 类型、子项类型
├── README.md           # 原理 + Props 文档
└── <subdir>/
    ├── utils/          # 标准化、校验、默认值填充
    ├── timeline/       # 动画时间轴计算（纯函数）
    ├── smil/           # SMIL 动画生成函数（JSX 片段）
    └── components/     # 子渲染组件
```

判断标准：
- 函数超过 **15 行**或被**多处调用** → 必须提取
- 函数是**纯函数**（无 JSX）→ `utils/` 或 `timeline/`
- 函数返回 **JSX 片段**（SMIL 动画）→ `smil/`
- 函数是**独立渲染逻辑** → `components/`
- 函数只在 `index.tsx` 里用一次且很短 → 留在 `index.tsx` 底部

---

## 附录：热区模式

微信 SVG 不支持 JS，只能靠 SMIL 动画 + 极端坐标模拟"点击开关"。
核心原理：把可点击的 `<rect>` 放到极端坐标（屏幕外），通过动画在"可达"和"不可达"之间切换。

极端值计算统一用 `outOfView`：

```ts
const outOfView = max([viewBoxW, viewBoxH]) * 100  // lodash/max，不用 Math.max
```

### ① 永久禁用

点击后热区飞走，不可重复触发（`HotArea`、`ClickSwitchLayer`、`ClickPopup`）：

```xml
<rect opacity="0" style="pointer-events: painted">
  <animate attributeName="x" begin="click+0s" dur="1ms" values={outOfView} fill="freeze" />
  <set attributeName="visibility" to="hidden" begin="click+0s" fill="freeze" restart="never" />
</rect>
```

### ② 按压状态机

两组热区轮流切换，按住翻转/松开翻回（`ClickFlipCard`、`InfinityFlipCard`）：

```xml
<!-- 主热区：按住时从 -10000 移到 0（可见） -->
<animateTransform type="translate" values="-10000 0;-10000 0;0 0;0 0"
  begin="mousedown" calcMode="discrete" keyTimes="0;0.6;0.6;1" fill="freeze" />
<!-- 松开：主热区从 0 移回 -10000（消失） -->
<animateTransform type="translate" values="0 0;0 0;-10000 0;-10000 0"
  begin="mouseup" calcMode="discrete" keyTimes="0;0.5;0.5;1" fill="freeze" />
```

隐藏的复位触发器（初始在 `translate(10000, 0)` 离屏）：

```xml
<animateTransform type="translate" values="10000 0;10000 0;10000 0"
  begin="mousedown" fill="remove" />
<!-- touchmove 时移到 0（进入视野，可被点击来复位） -->
<animateTransform type="translate" values="0 0;0 0;0 0"
  begin="touchmove" fill="remove" />
```

### ③ 离屏暂存入场

内容初始在 `translate(-outOfView)`，点击时 `additive="sum"` 平移回可见区（`ClickCascade`）：

```xml
<g transform={`translate(-${outOfView} 0)`}>
  <animateTransform additive="sum" type="translate"
    values={`${outOfView} 0`} begin="click" fill="freeze" restart="never" />
</g>
```

---

## 参考案例

- `src/svg/display/CoverFlowX/` — 横向轮播
- `src/svg/display/CoverFlowY/` — 纵向变体，复用 CoverFlowX 的类型和 normalizer
- `src/svg/click/ClickCascade/` — 点击逐层渐显
