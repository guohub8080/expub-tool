# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 工作流程

- 每次对话结束前，自动 commit 当前未提交的所有改动（`git add -A`），提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- **绝对禁止执行 `git push` 或任何推送到远程仓库的命令**

## 项目概述

`expub-tool` 是一个 TypeScript 库，用于微信公众号 HTML/SVG 内容生成。主要模块：

- **SMIL 动画生成器** (`src/smil/`) — 底层 SMIL 动画原语（animate, animateTransform, animateMotion, set）
- **组合动画** (`src/behaviors/`) — 由 SMIL 原语组合而成的高级动画（闪烁、呼吸、浮动、挤压）
- **SVG 组件** (`src/svg/`) — 零高度容器、循环展示、点击交互等 SVG 组件
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
import { spacing, ExPubGoProvider, ExPubGoConfig } from "expub-tool"       // 主入口
import { px, py, mx, my, borderX, roundedT } from "expub-tool/css"        // CSS 工具
import { animateOpacity, transformScale } from "expub-tool/smil"           // SMIL 动画
import { animateSoftBlink, transformBreathe } from "expub-tool/behaviors"  // 组合动画
import { SvgEx, SectionEx, ImgEx } from "expub-tool/html"                  // HTML 组件
import { ZeroHeightContainer } from "expub-tool/svg"                       // SVG 组件
import { svgURL, getEaseBezier, validateWechatSvg } from "expub-tool/svg-utils"  // SVG 工具
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

## 非空判断规范

**核心原则：`if ()` 里只写纯布尔值，空值判断必须用 `isNil` / `isDefined`。**

### 什么时候用 isNil / isDefined

变量类型可能是 `null` / `undefined` 的场景（即类型为 `T | undefined`、`T | null`、`T | null | undefined`）：

- **判断为空**：`if (isNil(x))` — x 是 null 或 undefined
- **判断非空**：`if (isDefined(x))` — x 不是 null 且不是 undefined（类型守卫，收窄为 NonNullable\<T\>）

适用：props 可选字段、函数可选参数、`querySelector` 返回值、`getAttribute` 返回值等。

### 什么时候直接写布尔值

`if ()` 里的表达式**本身就是布尔类型**时，直接写，不加 isNil/isDefined：

```ts
// ✅ 纯布尔变量 / 布尔表达式 — 直接写
if (hasAnimation) { ... }
if (!isEdge) { ... }
if (!isValidColor(color)) { ... }
if (!allowedAttrs.has(attr)) { ... }
if (!has(POWER_BEZIER_MAP, power)) { ... }      // lodash has 检查属性存在
if (!isArray(value) || isEmpty(value)) { ... }  // lodash 函数返回 boolean
if (items.length === 0) { ... }             // 数值比较返回 boolean
```

### 示例

```ts
import isNil from 'lodash/isNil'
import { isDefined } from '@utils/fn/isDefined'

// ✅ 空值判断 — 用 isNil / isDefined
if (isNil(canvasBg)) return {}
if (isDefined(canvasBg.url)) { ... }

// ❌ 禁止用 !x / if(x) 做空值判断
if (!canvasBg) return {}
if (canvasBg.url) { ... }
```

## SMIL animateTransform 嵌套规则

多个 `<animateTransform>` 不能放在同一个 `<g>` 上——后一个会覆盖前一个的 `transform`，且会覆盖该 `<g>` 上已有的静态 `transform` 属性。每个 `<animateTransform>` 必须包在独立的 `<g>` 中。

## 缩进规范

- **统一使用 2 空格缩进**，禁止 Tab
- 项目已配置 `.editorconfig` 和 `.vscode/settings.json` 强制执行
- 每次编辑代码后，确保缩进符合 2 空格规范

## 属性存在性检查规范

- 一般场景使用 `has`（`lodash/has`）检查对象自身属性是否存在
- `in` 会查原型链，`has` 只查自身属性，语义更明确
- **例外**：区分联合类型（discriminated union）需要类型收窄时，使用 `in` 运算符（TypeScript 原生支持，`has` 无法收窄类型）

```ts
import has from 'lodash/has'

// ✅ 一般场景用 has
if (!has(POWER_BEZIER_MAP, power)) { ... }

// ✅ 区分联合类型需要类型收窄时用 in（例外）
type Config = { x: number; y: number } | { timeline: ...[] }
if ('timeline' in value) { ... }  // TypeScript 能收窄类型

// ❌ 一般场景禁止用 in
if (!(power in POWER_BEZIER_MAP)) { ... }
```

## 开发文档 (devDocs/)

开发时**必须参考**以下文档，它们是组件开发和 SMIL API 的权威指南：

- **`devDocs/SMIL_API.md`** — SMIL 动画工具函数完整接口文档（timeline 格式、animateTransform 系列、animate 系列、set 系列、bezier 缓动函数、命名规范、目录结构）
- **`devDocs/COMPONENT_SPLIT_GUIDE.md`** — 组件开发全流程指南（SVG 逆向工程、魔法数字提取、文件拆分规范、props 设计、编码规范：defaultTo、spacing、Object 参数、lodash 优先、方向常量、变量命名、childItem 规范）
