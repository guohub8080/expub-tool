# LongImgSlideX — 横向长图滑动组件

展示横向长图（宽 > 高），用户可以左右滑动查看完整内容。

## 原理

微信会对横向图片进行压缩，但竖图不会。所以：

1. **上传前**：用户将横向长图**顺时针旋转 90°**，变成竖图上传
2. **组件渲染**：通过 SVG `transform="rotate(-90)"` 逆时针旋转回来
3. **滑动浏览**：`overflow: scroll hidden` 实现横向滑动

```
上传的图片（竖图）：        组件渲染后（横图）：
┌──────┐                  ┌────────────────────────────┐
│      │                  │                            │
│      │   rotate(-90°)   │    横向长图，可左右滑动     │
│      │   ──────────→    │                            │
│      │                  └────────────────────────────┘
│      │                  ← 滑动查看 →
└──────┘
```

### exposedPercent 机制

`exposedPercent` 控制默认露出的比例，决定滑动范围：

| exposedPercent | 滑动内容宽度 | 说明 |
|---|---|---|
| 25（默认） | 400% | 需滑动 4 屏看完 |
| 50 | 200% | 需滑动 2 屏看完 |
| 100 | 100% | 刚好一屏，无需滑动 |

### SVG 旋转结构

```
外层 SVG（viewBox: h × w，旋转后尺寸）
  └─ g translate(0, w)        ← 下移 w
       └─ g rotate(-90)        ← 逆时针旋转 90°
            └─ foreignObject
                 └─ 内层 SVG（background-image 渲染图片）
```

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| url | string | '' | 图片 URL（需预先顺时针旋转 90° 上传） |
| exposedPercent | number | 25 | 默认露出的百分比 |
| isReverse | boolean | false | 是否反向滑动（rtl） |
| w | number | — | 图片宽度（像素），不传则自动获取 |
| h | number | — | 图片高度（像素），不传则自动获取 |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

### 基础用法（默认露出 25%）

```tsx
<LongImgSlideX url="https://example.com/long-image.jpg" />
```

### 露出 50%（需滑动 2 屏）

```tsx
<LongImgSlideX url="..." exposedPercent={50} />
```

### 从右向左滑动

```tsx
<LongImgSlideX url="..." isReverse />
```

### 指定图片尺寸（跳过自动获取）

```tsx
<LongImgSlideX url="..." w={2000} h={500} />
```

## 注意

- `url` 为空时不渲染
- 图片必须预先顺时针旋转 90° 上传，否则显示方向错误
- 不传 `w`/`h` 时会异步获取图片尺寸，首次渲染可能有闪烁
