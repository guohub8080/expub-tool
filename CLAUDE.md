# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 项目概述

`expub-tool` 是一个 TypeScript 库，用于微信公众号 HTML/SVG 内容生成。主要模块：

- **SMIL 动画生成器** (`src/smil/`) — 底层 SMIL 动画原语（animate, animateTransform, animateMotion, set）
- **组合动画** (`src/behaviors/`) — 由 SMIL 原语组合而成的高级动画（闪烁、呼吸、浮动、挤压）
- **SVG 组件** (`src/svg/`) — 零高度容器等 SVG 包裹组件
- **SVG 工具** (`src/svg-utils/`) — 贝塞尔曲线、keySplines 生成器、svgURL、微信 SVG 校验器
- **HTML 组件** (`src/html/`) — 输出静态 HTML/SVG 字符串的 React 组件（SectionEx, SvgEx, ImgEx 等）
- **CSS 工具** (`src/css/`) — 间距、边框、弹性布局辅助函数
- **工具函数** (`src/utils/`) — Provider、hooks、SVG/DOM 工具、纯函数

构建工具：Vite + TypeScript + React（仅开发环境），发布为 ESM/CJS，开启 preserveModules 实现真正的 tree-shaking。

## 常用命令

```bash
pnpm dev              # 启动 React playground 预览组件
pnpm build            # 构建库（ESM + CJS，preserveModules）
pnpm typecheck        # 仅类型检查，不输出文件
pnpm test             # 运行 vitest 测试（watch 模式）
pnpm test:run         # 运行测试一次
```

## NPM 子路径导出

```ts
// 主入口 — CSS 工具 + Provider
import { spacing, ExPubGoProvider, ExPubGoConfig } from "expub-tool"

// CSS 工具
import { px, py, mx, my, borderX, roundedT } from "expub-tool/css"

// SMIL 动画生成器
import { animateOpacity, transformScale, setVisibility } from "expub-tool/smil"

// 组合动画
import { animateSoftBlink, transformBreathe, genAnimateExtrude } from "expub-tool/behaviors"

// HTML 组件
import { SvgEx, SectionEx, ImgEx } from "expub-tool/html"

// SVG 组件
import { ZeroHeightContainer } from "expub-tool/svg"

// SVG 工具
import { svgURL, getEaseBezier, validateWechatSvg } from "expub-tool/svg-utils"
```

## SMIL 动画生成器命名规范 (`src/smil/`)

函数名以生成的 SVG 标签为前缀，用户一看导入名就知道标签类型：

| 前缀 | SVG 标签 | 示例 |
|---|---|---|
| `animate*` | `<animate>` | `animateOpacity`, `animateOpacityWrap` |
| `transform*` | `<animateTransform>` | `transformScale`, `transformRotate`, `transformTranslate` |
| `set*` | `<set>` | `setVisibility`, `setOpacity`, `setDisplay` |
| `pathMotion*` | `<animateMotion>` | `pathMotionLoop`, `pathMotionSlide` |
| `pathStroke*` | `<animate>` (stroke) | `pathStroke` |

### 目录结构

```
src/smil/
├── animate/        # animateAttribute 泛型 + animateOpacity 等
├── transform/      # transformAttribute 泛型 + transformScale 等
├── motion/         # pathMotion* — <animateMotion>
├── stroke/         # pathStroke* — <animate> 操作 stroke-dashoffset
├── set/            # set* — <set> 瞬时状态切换
└── index.ts        # barrel 导出

src/behaviors/
├── blink/          # animateSoftBlink, animateHardBlink
├── breathe/        # transformBreathe
├── float/          # transformFloat
├── extrude/        # genAnimateExtrude
└── index.ts        # barrel 导出
```

## SVG 组件参考代码翻译规则

用户会提供原始 SVG/HTML 参考代码，需要将其转换为 React 组件。遵循以下原则：

1. **仅 `margin-top: -1px` 用 spacing 替换** — 参考代码中的 `margin-top: -1px` 不硬编码，改用 `spacing` prop + `T_SpacingProps` 系统控制。其他 `margin` 值（如 `margin: 0 auto`、`margin-top: 0`）保持与参考一致，不做替换。
2. **生成结果必须与参考代码完全一致** — 除以下两项外，最终渲染的 HTML/CSS 必须与参考代码一模一样：
   - `margin-top: -1px` → 用 `spacing` prop 替代（见规则 1）
   - 水印/版权属性（`powered-by`、`label`、`copyright`）→ 用 `resolveWatermark()` 系统替代
3. **开发模式标注组件身份** — 当 `ExPubGoConfig().mode === 'development'` 时，组件最外层输出 `expubgo-label` 属性标明组件名称，方便 AI 审计。生产模式下不输出。

## SMIL animateTransform 嵌套规则

多个 `<animateTransform>` 不能放在同一个 `<g>` 上——后一个会覆盖前一个的 `transform`，且会覆盖该 `<g>` 上已有的静态 `transform` 属性。

**正确做法：** 每个 `<animateTransform>` 必须包在独立的 `<g>` 中：

```tsx
{/* ✅ 正确：每层动画各自包 <g> */}
<g transform={`translate(${offsetX}, ${offsetY})`}>
  <g>
    <animateTransform type="skewX" ... />
    <g>
      <animateTransform type="rotate" ... />
      <foreignObject>content</foreignObject>
    </g>
  </g>
</g>
```

```tsx
{/* ❌ 错误：多个 animateTransform 在同一 <g> 上，互相覆盖 */}
<g transform={`translate(${offsetX}, ${offsetY})`}>
  <animateTransform type="skewX" ... />   {/* 覆盖了 translate(offset) */}
  <animateTransform type="rotate" ... />   {/* 覆盖了 skewX */}
  <foreignObject>content</foreignObject>
</g>
```

## 构建架构

- **Vite + Rollup**，`preserveModules: true`，每个源文件在 dist 中保持独立模块
- **双格式**：ESM (`dist/esm/*.mjs`) + CJS (`dist/cjs/*.cjs`)
- **类型**：`tsc --emitDeclarationOnly` 输出到 `dist/types/`
- **外部依赖**：`react`, `react-dom`, `react/jsx-runtime`, `lodash`, `lodash/*`
- **入口点**与源码路径一一对应：`css/index`, `svg/index`, `svg-utils/index` 等

## 路径别名 (tsconfig.json + vite.config.ts)

| 别名 | 对应路径 |
|---|---|
| `@html/*` | `src/html/*` |
| `@common/*` | `src/common/*` |
| `@css/*` | `src/css/*` |
| `@svg-comps/*` | `src/svg-comps/*` |
| `@smil/*` | `src/smil/*` |
| `@behaviors/*` | `src/behaviors/*` |
| `@svg/*` | `src/svg/*` |
| `@svg-utils/*` | `src/svg-utils/*` |
| `@css-fn/*` | `src/css/cssFunctions/*` |
| `@css-presets/*` | `src/css/cssPresets/*` |

## 开发文档 (devDocs/)

开发时必须参考以下文档，它们是组件开发和 SMIL API 的权威指南：

- **`devDocs/SMIL_API.md`** — SMIL 动画工具函数完整接口文档，包括 timeline 格式、animateTransform 系列、animate 系列、set 系列、bezier 缓动函数的用法和参数说明
- **`devDocs/COMPONENT_SPLIT_GUIDE.md`** — 硬编码 SVG → React 组件逆向工程流程，包括结构分析、魔法数字提取、文件拆分规范、props 边界设计、编码规范（defaultTo、spacing、Object 参数、目录结构、lodash 优先、方向常量、变量命名）

## 编码规范

- **类型命名**：`T_` 前缀表示类型别名，`I_` 前缀表示接口
- **命名导出**：库代码一律使用 named export（利于 tree-shaking）
- **禁止 namespace 导出**：子路径只用扁平的命名导出
- **lodash**：使用单包导入（`import defaultTo from "lodash/defaultTo"`），构建时外部化
- **默认值**：优先使用 `defaultTo(prop, fallback)` 而非解构默认值，保持风格统一
- **优先 lodash**：类型判断、空判断优先用 lodash，尤其是 `isNil` 代替分别使用 `isUndefined` / `isNull`
- **错误信息**：变量名用反引号包裹，首字母大写，句末加句号。例：`` `keyframes` must not be empty. ``
- **styles 提取**：不需要所有样式都提取到独立文件，只有当重复内容多、影响可读性时再提取公共部分到 `styles.ts`
