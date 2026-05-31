# BottomAlignedContainer — 底部对齐容器

通过双层 180° 旋转实现内容底部对齐到容器位置。容器高度为 0，内容向上溢出。

## 原理

```
普通容器：                底部对齐容器：
┌─────────┐ ← 容器顶部    │  图片内容  │ ← 向上溢出（正向显示）
│  图片    │              │           │
│  内容    │              └───────────┘
│         │              ┌───────────┐ ← 容器位置（高度0）
└─────────┘                内容底部对齐到这里
```

双层旋转拆解：

1. **height: 0** — 内容向下溢出
2. **外层 rotate(180deg)** — 溢出方向翻转为向上（但内容倒置）
3. **内层 rotate(180deg)** — 内容转正，底部对齐到容器位置

```
┌─ SectionEx（overflow: hidden）──┐
│  ┌─ outer（height: 0, rotate 180°）─┐
│  │  ┌─ inner（rotate 180°）───────┐ │
│  │  │  children（正向显示）        │ │
│  │  └─────────────────────────────┘ │
│  └──────────────────────────────────┘
└─────────────────────────────────────┘
```

两层都设了 `pointer-events: none`，因为容器是装饰性的，不应拦截交互。

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | — | 要底部对齐的内容 |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

### 装饰性分隔线

```tsx
<BottomAlignedContainer>
  <img src="divider.png" style={{ width: '100%', height: '50px' }} />
</BottomAlignedContainer>
```

### 带间距

```tsx
<BottomAlignedContainer spacing={{ mt: 20 }}>
  <img src="decoration.png" />
</BottomAlignedContainer>
```

## 注意

- 容器高度为 0，内容向上溢出，可能覆盖上方内容
- `pointer-events: none` 导致内部元素无法响应交互，如需交互需手动覆盖 `pointer-events: auto`
- 旋转可能导致文本渲染模糊，建议用于图片/图形而非文字
