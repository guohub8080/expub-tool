# SkewSlideCarousel

统一斜切轮播组件，通过 skew + translate 的同步动画模拟正方体旋转效果。
支持 X 轴（skewY + translate X）和 Y 轴（skewX + translate Y）两种模式。

## Props

```ts
interface SkewSlideCarouselProps {
  canvasSize: { w: number; h: number }       // SVG 画布尺寸
  childCanvasSize?: { w: number; h: number }  // 内容渲染尺寸，默认 = canvasSize
  gap?: number                                 // 面内留白（仅 X 轴影响面宽度），默认 0
  skewAngle?: number                           // 斜切角度，默认 15
  axis?: 'X' | 'Y'                            // 轴向，默认 'X'
  isReversed?: boolean                         // 反向旋转，默认 false
  childItems: Array<{
    url?: string
    jsx?: React.ReactNode
    switchDuration?: number                    // 切换动画时长，默认 2
    stayDuration?: number                      // 停留时长，默认 2
  }>
  spacing?: T_SpacingProps                     // 外间距
  canvasBg?: I_CanvasBg                        // 画布背景
}
```

## 核心概念

- **childCanvasSize** = 内容实际渲染大小（foreignObject 内的图片/jsx）
- **gap** = 面内内容周围的留白（仅 X 轴模式下影响面宽度）
- **虚拟面宽度** = childCanvasSize.w + gap，内容居中，两侧各 gap/2
- cube 面与面之间无缝衔接，gap 只是面内留白
- 不传 childCanvasSize 时 = canvasSize，不传 gap 时 = 0

## 核心算法：skew 与 translate 的关系

skew 和 translate **不是两个独立动画**，而是同一个 3D 旋转的两个 2D 投影：

- translate（主轴方向）→ 位移（面对应的位置）
- skew → 透视形变（面的倾斜角度）
- 两者由同一个旋转角度 θ 驱动，共享相同的 duration、keySplines、begin 偏移

### 1. skew origin（旋转轴位置）

| 轴向 | skew 类型 | origin 位置 | 说明 |
|---|---|---|---|
| X | skewY | 底边中心 (faceW/2, contentH) | 绕底边旋转 |
| Y | skewX | 顶边中心 (faceW/2, 0) | 绕顶边旋转 |

origin 通过嵌套 `<g transform="translate(ox,oy)">` 实现，内容通过反向 translate 定位。

### 2. 交叉轴补偿

origin 不在中心时，skew 会让内容倾斜，translate 需要交叉轴偏移来保持视觉稳定：

```
crossComp = contentPerpendicularDim / 2 × tan(skewAngle)
signedCrossComp = isReversed ? +crossComp : -crossComp
```

- X 轴模式：perpendicularDim = contentH，补偿加在 Y 方向
- Y 轴模式：perpendicularDim = contentW，补偿加在 X 方向

### 3. 四阶段动画值

每个 item 的动画周期分为四个阶段：entry → stay → exit → hold

| 阶段 | translate（X 轴） | skewY | opacity |
|---|---|---|---|
| entry | (faceW, crossComp) → (0, 0) | entryAngle → 0 | 0 → 1 |
| stay | (0, 0) | 0 | 1 |
| exit | (0, 0) → (−faceW, crossComp) | 0 → exitAngle | 1 → 0 |
| hold | (−faceW, crossComp) | exitAngle | 0 |

角度方向：
- X 轴 normal：entryAngle = −angle, exitAngle = +angle
- X 轴 reversed：entryAngle = +angle, exitAngle = −angle
- Y 轴 normal：entryAngle = +angle, exitAngle = −angle
- Y 轴 reversed：entryAngle = −angle, exitAngle = +angle

### 4. 缓冲区（buffer）

离屏位置额外加 buffer = crossComp + 1，防止 skew 导致的边缘像素残留。

### 5. 时间轴模型

使用 `buildCyclicTimelines` 工具函数：

- 每个 childItem 有 switchDuration（entry 时长）和 stayDuration（停留时长）
- item i 的 exit 时长 = item (i+1) 的 switchDuration
- hold 时长 = totalCycle − entry − stay − exit
- hold 阶段 opacity 归零，translate 保持离屏

### 6. 严格同步

translate、skew、opacity 三条动画轨道必须：

- **相同 duration**（总周期）
- **相同 begin 偏移**
- **相同 keySplines**（"0.42 0 0.58 1"）

### 7. 反向模式（isReversed）

反向时 skew 角度方向和交叉轴补偿方向取反，视觉上旋转方向反转。

## 限制

- skewAngle 上限由 `atan(宽高比)` 决定（不超过 90° 的几何约束）
- foreignObject 宽高比 content 多 1px，用于防止亚像素边缘缝隙
- 交叉轴补偿量随 skewAngle 增大而增大（tan 函数特性），大角度时位移明显

## 目录结构

```
SkewSlideCarousel/
├── README.md              本文档
├── index.tsx              入口组件
├── buildTimeline.ts       时间轴计算（包装 buildCyclicTimelines + 四阶段 segments）
├── SkewSlideItem.tsx      单项渲染（translate + opacity + skew + content）
└── utils.ts               常量、角度限制、交叉轴补偿计算
```
