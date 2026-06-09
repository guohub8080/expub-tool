# SkewSlideCarousel

斜切轮播组件，通过 skewY + translate 的同步动画模拟正方体旋转效果。

## 核心算法：skewY 与 translate 的关系

skewY 和 translate **不是两个独立动画**，而是同一个 3D 旋转的两个 2D 投影：

- translate X → 水平位移（面对应的位置）
- skewY → 透视形变（面的倾斜角度）
- 两者由同一个旋转角度 θ 驱动，共享相同的 duration、keySplines、begin 偏移

### 1. 共享原点（origin）

skewY 的 pivot 必须和 translate 的参考点一致。cube 效果使用 **Bottom**（底边中心）作为 origin：

```
外层定位 translate(contentW/2, contentH)  ← 内容区域底边中心
skewY 以 (0, 0) 为 pivot ← 即底边中心
内容定位 translate(-contentW/2, -contentH) ← 相对于 pivot 偏移到左上角
```

### 2. Y 补偿

origin 在 Bottom（非中心）时，skewY 会让内容绕底边倾斜，translate 需要垂直偏移来保持视觉中心稳定：

```
offset = round(contentH × tan(skewAngle) / 2)
yOff = -offset    // 非反向模式
```

### 3. 四段动画值

```
         translate              skewY          opacity
────────────────────────────────────────────────────────
entry:   (w, yOff) → (0, 0)    -angle → 0     可见
center:  (0, 0)                 0              可见
exit:    (0, 0) → (-w, yOff)    0 → +angle     可见
hold:    (-w, yOff)             +angle         不可见（opacity=0）
```

- entry 时 skewY 为负角度（顶边向入场方向倾斜），exit 时为正角度
- Y 补偿只在 entry/exit 阶段出现，center 阶段为 0
- hold 阶段 opacity 归零，防止 exit 位置的残留线可见

### 4. 严格同步

translate 和 skewY 必须：

- **相同 duration**（总周期 = N × step）
- **相同 keySplines**（`"0.42 0 0.58 1"`）
- **相同 begin 偏移**（item i 的 begin = (i-1) × step）

keySplines 不一致会导致两条边缘不同步；duration 不一致会导致缝隙。

## 时序对齐

每个 item 的动画周期内，entry 和 exit 的时间分配：

```
keyTimes: 0; k1; k2; 1

k1 = step / dur        ← entry 结束 / center 开始
k2 = 2 × step / dur    ← center 结束 / exit 开始
dur = N × step
```

item i 的 exit 起始时刻 = item (i+1) 的 entry 起始时刻，两者完全重叠，形成无缝的 cube 翻转。

## 反向模式（isReversed）

反向时 skewY 角度和 Y 补偿方向取反：

```
entrySkewAngle = isReversed ? +angle : -angle
exitSkewAngle  = isReversed ? -angle : +angle
yOff           = isReversed ? +offset : -offset
```

## 限制

- skewAngle 上限由 `atan(contentW / contentH)` 决定（不超过 90° 的几何约束）
- foreignObject 宽高比 content 多 1px，用于防止亚像素边缘缝隙
- Y 补偿量随 skewAngle 增大而增大（`tan` 函数特性），大角度时位移明显

## 目录结构

```
SkewSlideCarousel/
├── README.md                    ← 本文档
├── types.ts                     共享类型、常量（EASE, DEFAULT_SKEW_ANGLE, DEFAULT_STEP）
├── SkewSlideCarouselX/          横向 cube 旋转（skewY + translate X）
│   └── index.tsx
└── SkewSlideCarouselY/          纵向 cube 旋转（skewX + translate Y）
    └── index.tsx
```
