# StackCarousel

叠层卡牌轮播组件。卡牌沿 `mainChild → tailChild` 两点连线方向堆叠（最远端 tail → … → 焦点 center），自动循环推进，支持点击跳转链接与八方向退场。

不再区分横向 / 纵向——叠层方向完全由 `mainChild` 与 `tailChild` 两个点的连线决定，可以横、竖、任意斜向。

## 用法

```tsx
import { StackCarousel } from "expub-tool/svg"

{/* 水平叠层（tailChild 缺省，向右延伸） */}
<StackCarousel
  canvasSize={{ w: 1080, h: 1080 }}
  mainChild={{ w: 900, h: 900 }}
  childItems={[
    { url: "https://example.com/1.jpg" },
    { url: "https://example.com/2.jpg", link: "https://baidu.com" },
    { url: "https://example.com/3.jpg" },
    { url: "https://example.com/4.jpg" },
  ]}
/>

{/* 斜向叠层：两点连线即方向 */}
<StackCarousel
  canvasSize={{ w: 1080, h: 1080 }}
  mainChild={{ w: 900, h: 900, centerX: 540, centerY: 540 }}
  tailChild={{ scale: 0.2, centerX: 760, centerY: 720 }}
  showStackNum={5}
  childItems={[...]}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w, h }` | 必填 | SVG 画布尺寸（viewBox） |
| `mainChild` | `I_MainChildConfig` | 必填 | 焦点卡牌：基准尺寸 + 中心位置，scale 恒为 1 |
| `tailChild` | `I_TailChildConfig` | 向右延伸 | 最远端卡牌：缩放 + 中心位置；与 mainChild 两点连线决定方向与深度 |
| `showStackNum` | `number` | `3` | 可见叠层数，范围 [2, 8] 闭区间，越界抛错。被 `showStackConfig` 优先覆盖 |
| `showStackConfig` | `I_StackLayerConfig[]` | — | 逐层覆盖配置；传则数组长度即层数（覆盖 `showStackNum`）。首项=tail（最远端）、末项=center（焦点）；缺省字段走自动公式（scale 幂律、位置恒定 peek） |
| `childItems` | `I_StackCarouselItem[]` | 必填 | 图片/内容配置数组，至少 1 项 |
| `canvasBg` | `I_CanvasBg` | — | 画布背景 |
| `spacing` | `T_SpacingProps` | — | 外层 margin-top 间距 |

### I_MainChildConfig

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `w` | `number` | 必填 | 卡牌基准宽（scale=1 时的 viewBox 尺寸） |
| `h` | `number` | 必填 | 卡牌基准高 |
| `centerX` | `number` | viewBox 几何中心 | 焦点卡牌正中心 X（viewBox 坐标） |
| `centerY` | `number` | viewBox 几何中心 | 焦点卡牌正中心 Y（viewBox 坐标） |

### I_TailChildConfig

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `scale` | `number` | `0.78` | 最远端缩放 |
| `centerX` | `number` | mainCenterX + 162 | 最远端正中心 X（viewBox 坐标） |
| `centerY` | `number` | mainCenterY | 最远端正中心 Y（viewBox 坐标） |

### I_StackLayerConfig

逐层覆盖配置（`showStackConfig` 数组元素）。首项=tail（最远端）、末项=center（焦点）。

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `scale` | `number` | 幂律 `tailScale ^ depthRatio` | 该层缩放；覆盖自动等比缩放 |
| `progress` | `number` | 恒定 peek 反推 | 该层中心沿方向轴归一化进度：0=mainChild（center 端）、1=tailChild（tail 端）；覆盖自动露边恒定分布 |
| `rotate` | `number` | `0` | 该层旋转角度（度）。卡片循环推进时与 translate/scale 同步层间插值；与 `exit.rotation` 独立。**注意**：center 层（数组末项）的 rotate 对 center 位无效——center 位旋转走 per-item `stayRotate` |
| `rotatePivot` | `T_Pivot` | `"Center"` | 该层旋转中心（child 局部，九宫格或 `{x,y}`） |

两端锚点契约恒成立：center 层落 `mainChild.center`、tail 层落 `tailChild.center`。中间层不传则 scale 走幂律、位置走恒定 peek（露边相等）；想让 tail 近的贴更紧，给中间几层 `progress` 略大于自动值（使中心更靠近 tail）。

### I_StackCarouselItem

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `url` | `string` | — | 图片地址，与 `jsx` 二选一 |
| `jsx` | `ReactNode` | — | 自定义内容，优先级高于 `url` |
| `link` | `string` | — | 点击跳转链接（可选） |
| `exit` | `I_ExitConfig` | — | 退场配置 |
| `switchDuration` | `number` | `1` | 切换动画时长（秒） |
| `stayDuration` | `number` | `1` | 停留时长（秒） |
| `keySplines` | `string` | ease-in-out | SMIL keySplines 缓动曲线 |
| `stayRotate` | `number` | `0` | 该卡在 center（mainChild）位停留时的旋转角度（度）。center 位旋转纯 per-item，不走 showStackConfig 全局层 |
| `stayRotatePivot` | `T_Pivot` | `"Center"` | 该卡 center 停留旋转中心（child 局部，九宫格或 `{x,y}`） |

### I_ExitConfig

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `direction` | `T_Direction8` | 远离 tail 方向 | 退场方向（L/R/T/B/TL/TR/BL/BR） |
| `distance` | `number` | `√(w²+h²)×1.2` | 退场移动距离 |
| `skew` | `I_SkewConfig` | — | 退场斜切 |
| `rotation` | `I_RotationConfig` | — | 退场旋转 |
| `scale` | `number` | `1` | 退场缩放目标值 |

## 几何与插值

- **方向**：`direction = tailChild.center − mainChild.center`，局部空间内 mainChild 在原点。
- **层数**：`showStackNum`（n），层 i（i=0 最远端 tail，i=n−1 焦点 center）。
- **缩放**：等比，`scale(i) = tailChild.scale ^ t`（t = 1 − i/(n−1)，tail=tailChild.scale，center=1）。`showStackConfig[i].scale` 可逐层覆盖。
- **位置**：默认恒定 peek 分布，每张露出等宽边。peek `P = [D − projHalf·(1−tailChild.scale)]/(n−1)`（D=|direction|，projHalf 为卡牌沿方向轴投影半宽 `(w·|ux|+h·|uy|)/2`），两端锚点精确命中。tail 太近时 P 可能为负，卡牌会糊一块。`showStackConfig[i].progress`（0=center、1=tail）可逐层覆盖中心落点，覆盖后露边不再恒定，但两端锚点仍精确命中。
- **旋转**：默认每层 `rotate=0`（不转）。`showStackConfig[i].rotate`（度）逐层设值后，卡片循环推进时 rotate 与 translate/scale 同步层间插值（如 tail 层 30°、次层 15°、center 位 0°，从 tail 推到 center 角度渐变）。pivot 默认 `"Center"`（child 几何中心），可逐层用 `rotatePivot` 覆盖。**center 位旋转例外**：纯 per-item，走 `childItems[i].stayRotate`（默认 0），`showStackConfig` 末项的 rotate 对 center 位无效。退场时维持退场前所在角度飞出，仅当该 item 显式配了 `exit.rotation` 才过渡到退场角度。
- **退场**：卡片从 center 朝「远离 tail」方向飞出（即 mainChild − tailChild 方向，吸附到最近的八方向），可被单项 `exit.direction` 覆盖。退场距离默认按 `mainChild.center` 位置 + 退场方向精确计算「完全移出 viewBox 的最小距离」（补偿 mainChild 偏离画布中心时对角线估计不够的情形，不纳入 exit scale、恒按 scale=1），可被单项 `exit.distance` 覆盖。

## 注意

- `childItems` 少于 `showStackNum` 项时自动按整组复制补齐（ceil(showStackNum/N)）。
- 动画周期 = N × (switchDuration + stayDuration)，每张图片在 center 位停留后飞出。
- `showStackNum=2` 时只有 tail + center 两层，公比即 `tailChild.scale`。
