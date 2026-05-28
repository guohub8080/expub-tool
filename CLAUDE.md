# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`expub-tool` is a TypeScript library for WeChat Official Account (微信公众号) HTML/SVG content generation. It provides:

- **SVG components** (`src/svg-comps/`) — Pre-built SMIL animated SVG React components (click effects, multi-display transitions, containers, etc.)
- **SVG animation generators** (`src/svg-anim/`) — Low-level SMIL animation generators, each organized by SVG animation tag type (animate, animateTransform, set)
- **SVG utilities** (`src/svg-utils/`) — Bezier curves, keySplines generator, svgURL, WeChat SVG validator
- **HTML components** (`src/html/`) — React components that output static HTML/SVG strings for WeChat articles
- **CSS utilities** (`src/css/`) — Spacing, border, flex layout helpers
- **Common** (`src/common/`) — Shared colors, hooks, utils

The library is built with Vite + TypeScript + React (dev only) and published as ESM/CJS with preserveModules for true tree-shaking.

## Common Commands

```bash
pnpm dev              # Start React playground for previewing components
pnpm build            # Build library for npm publish (ESM + CJS, preserveModules)
pnpm typecheck        # Type check without emitting files
pnpm test             # Run tests with vitest
pnpm test:run         # Run tests once (no watch)
```

## NPM Sub-path Exports

Users install `expub-tool` and import from sub-paths:

```ts
// Main entry — SVG components + CSS utilities
import { BgImg, SeamlessImg, spacing } from "expub-tool"

// CSS utilities only
import { px, py, mx, my, borderX, roundedT } from "expub-tool/css"

// SVG animation generators
import { animateOpacity, transformScale, setVisibility } from "expub-tool/svg-anim"

// SVG components only
import { ... } from "expub-tool/svg"

// SVG utilities (bezier, keySplines, svgURL, validator)
import { svgURL, getEaseBezier, validateWechatSvg } from "expub-tool/svg-utils"
```

## SVG Animation Generator Naming Convention (`src/svg-anim/`)

Functions are prefixed by the SVG tag they generate, so users can tell the tag type from the import:

| Prefix | SVG Tag | Examples |
|---|---|---|
| `animate*` | `<animate>` | `animateOpacity`, `animateOpacityFade`, `animateOpacityLoop` |
| `transform*` | `<animateTransform>` | `transformScale`, `transformScaleLoop`, `transformRotate`, `transformTranslate`, `transformSkewX` |
| `set*` | `<set>` | `setVisibility`, `setOpacity`, `setDisplay` |
| `pathMotion*` | `<animateMotion>` | `pathMotionLoop`, `pathMotionSlide` |
| `pathStroke*` | `<animate>` (stroke) | `pathStroke` |

### Directory structure

Each animation type lives in its own subdirectory under `src/svg-anim/`:

```
src/svg-anim/
├── opacity/        # animateOpacity* — <animate attributeName="opacity">
├── scale/          # transformScale* — <animateTransform type="scale">
├── rotate/         # transformRotate* — <animateTransform type="rotate">
├── translate/      # transformTranslate* — <animateTransform type="translate">
├── skewX/          # transformSkewX* — <animateTransform type="skewX">
├── skewY/          # transformSkewY* — <animateTransform type="skewY">
├── pathMotion/     # pathMotion* — <animateMotion>
├── pathStroke/     # pathStroke* — <animate> on stroke-dashoffset
├── blink/          # animateSoftBlink, animateHardBlink — <animate> opacity blink
├── breathe/        # animateBreathe — <animate> + <animateTransform> composite
├── extrude/        # animateExtrude — multi-element animation
├── float/          # animateFloat — <animateTransform> floating effect
├── set/            # set* — <set> instant state changes
└── index.tsx       # barrel export
```

### Current state

The functions currently use `genAnimate*` / `genSet*` naming (e.g., `genAnimateOpacity`, `genSetVisibility`). These will be renamed to the new convention:
- `genAnimateOpacity` → `animateOpacity`
- `genAnimateScale` → `transformScale`
- `genSetVisibility` → `setVisibility`

## Build Architecture

- **Vite + Rollup** with `preserveModules: true` for true tree-shaking (each source file becomes an individual module in dist)
- **Dual format**: ESM (`dist/esm/*.mjs`) + CJS (`dist/cjs/*.cjs`)
- **Types**: generated via `tsc --emitDeclarationOnly` to `dist/types/`
- **External deps**: `react`, `react-dom`, `react/jsx-runtime`, `lodash`, `lodash/*`
- **Entry points** match source paths: `css/index`, `svg/index`, `svg-utils/index`, etc.

## Path Aliases (tsconfig.json + vite.config.ts)

| Alias | Resolves to |
|---|---|
| `@html/*` | `src/html/*` |
| `@common/*` | `src/common/*` |
| `@css/*` | `src/css/*` |
| `@svg-comps/*` | `src/svg-comps/*` |
| `@svg-anim/*` | `src/svg-anim/*` |
| `@svg-utils/*` | `src/svg-utils/*` |
| `@css-fn/*` | `src/css/cssFunctions/*` |
| `@css-presets/*` | `src/css/cssPresets/*` |

## Conventions

- **Type naming**: `T_` prefix for type aliases, `I_` prefix for interfaces
- **Named exports** over default exports for library code (tree-shaking friendly)
- **No namespace exports** for sub-paths — flat named exports only (tree-shaking concern)
- **lodash**: use single-package imports (`import defaultTo from "lodash/defaultTo"`); lodash is externalized in build
- **Prefer native JS** over lodash where possible (e.g., `Number.isInteger` instead of `lodash/isInteger`)
- **Error messages**: use backtick-wrapped variable names (`` `keyframes` ``), start with uppercase, end with a period. Example: `` `keyframes` must not be empty. ``
