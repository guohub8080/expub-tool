# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`expub-tool` is a TypeScript library for WeChat Official Account (微信公众号) HTML/SVG content generation. It provides:

- **SVG animation generation** (`src/svg/`) — SMIL-based animated SVG components with presets (click effects, multi-display transitions, etc.)
- **HTML component generation** (`src/html/`) — React components that output static HTML/SVG strings for WeChat articles
- **Bezier curve utilities** (`src/bezier/`) — Easing functions for SVG animations
- **CSS utilities** (`src/css/`) — Helper functions for generating inline styles

The library is built with Vite + TypeScript + React (dev only) and published as a multi-format package (ESM/CJS/UMD/IIFE).

## Common Commands

```bash
# Development — start React playground for previewing components
pnpm dev

# Build library for npm publish (outputs dist/ with .mjs, .cjs, .umd.js, .iife.js + .d.ts)
pnpm build

# Type check only
pnpm typecheck

# Run tests
pnpm test              # interactive watch mode
pnpm test:run          # single run (CI)
pnpm test:ui           # with Vitest UI

# Build playground for static deployment
pnpm build:playground
```

## Architecture

### Dual Build System

The project has **two separate Vite configs**:

- **`vite.config.ts`** — Library build. Uses `build.lib` with multiple output formats. React is external (peer dependency). Entry: `src/index.ts`.
- **`vite.playground.config.ts`** — Dev server build. Standalone React app in `playground/` for previewing components. Not published.

### Path Aliases

Both TypeScript and Vite are configured with the same aliases:

| Alias | Maps to |
|-------|---------|
| `@html/*` | `src/html/*` |
| `@svg/*` | `src/svg/*` |
| `@css/*` | `src/css/*` |
| `@common/*` | `src/common/*` |
| `@utils/*` | `src/utils/*` |
| `@bezier/*` | `src/bezier/*` |
| `@colors/*` | `src/common/colors/*` |
| `@css-fn/*` | `src/css/cssFunctions/*` |
| `@css-presets/*` | `src/css/cssPresets/*` |

**Important**: Relative imports should NOT include `.ts`/`.tsx` extensions. The `moduleResolution: bundler` setting handles extension resolution.

### Key Source Directories

- **`src/html/basicEx/`** — Base React components (ImgEx, SectionEx, SpanEx, SvgEx) that support `important` (for `!important` CSS) and `waterMark` props. These are the building blocks for HTML generation.
- **`src/svg/presets/`** — Pre-built SVG animation components organized by category (C1_Standard, C3_MultiDisplay, C5_ClickEffects, etc.)
- **`src/svg/genSvgAnimate/`** — Low-level SMIL animation generators (animate, animateTransform, etc.)
- **`src/common/`** — Shared utilities organized as:
  - `hooks/` — React hooks (e.g., `useImgSize`)
  - `utils/` — Pure functions (e.g., `getImgSizeAsync`)
  - `colors/` — Color palettes (`googleColors`, `tailwindColors`)

### `important` Pattern

Components in `basicEx/` use a consistent pattern for applying `!important` CSS:

```tsx
import { useImportant } from "./useImportant";

// In component:
const { ref, hasImportant } = useImportant<HTMLElement>(important);

// Conditionally attach ref only when important is provided
{hasImportant ? <tag ref={ref} ... /> : <tag ... />}
```

The `useImportant` hook applies `style.setProperty(key, value, "important")` via `useEffect`.

### Publishing Notes

- `package.json` has `"type": "module"` and exports ESM/CJS
- React is an optional peer dependency
- `files` field only includes `dist/` and `README.md` — playground and source are excluded
- Sub-path exports supported (e.g. `import {} from "expub-tool/bezier"`)

### Dependency Principles

- **Minimize runtime dependencies.** Prefer native JS APIs over libraries. Only add a dependency when it provides significant value.
- **Use lodash single-function imports** (`import xxx from "lodash/xxx"`) instead of `lodash` or `lodash-es`. Each `lodash/xxx` is a standalone file (~400 bytes), keeping the bundle lean without needing to externalize.
- **`src/api/` is playground-only.** Library code must not depend on `@api/`. Placeholder image defaults belong in the playground, not the library.
