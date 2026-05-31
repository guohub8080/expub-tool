# Container180 — 180° 旋转容器

将子内容旋转 180 度（上下颠倒），用于镜像倒影、倒置分隔线、对称装饰等场景。

## 原理

```
原始内容：          旋转 180° 后：
┌─────────────┐    ┌─────────────┐
│    ╱╲       │    │  ▔▔▔▔▔▔     │
│   ╱  ╲      │    │   ╲    ╱    │
│  ╱____╲     │    │    ╲  ╱     │
│  三角形      │    │     ╲╱      │
└─────────────┘    └─────────────┘
```

核心实现：

```tsx
// 外层：通用容器样式（居中、overflow hidden、行高 0）
<SectionEx style={rootBaseStyle}>
  // 内层：180° 旋转
  <section style={{ display: 'block', transform: 'rotate(180deg)', transformOrigin: 'center' }}>
    {children}
  </section>
</SectionEx>
```

`transform-origin: center` 确保以中心点旋转，内容在原位置上下翻转，不会偏移。

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | — | 要旋转的内容 |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距，通过 spacing 系统控制 |

## 常用场景

### 倒置分隔线

```tsx
// 正常分隔线（线在上方）
<hr style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} />

// 倒置分隔线（线在下方）
<Container180>
  <hr style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} />
</Container180>
```

### 镜像倒影

配合 opacity + blur 实现自然倒影效果：

```tsx
<img src="landscape.jpg" style={{ width: '100%' }} />
<Container180>
  <img src="landscape.jpg" style={{ width: '100%', opacity: 0.3, filter: 'blur(2px)' }} />
</Container180>
```

### 对称装饰

同一个装饰元素正反使用，形成上下对称：

```tsx
<img src="decoration-top.svg" />
<div style={{ padding: '20px' }}>内容区域</div>
<Container180 spacing={{ mt: 10 }}>
  <img src="decoration-top.svg" />
</Container180>
```

### 从下往上的滚动效果

内容被 180° 翻转后，原本从上往下的滚动方向会反转为从下往上，滚动条也会出现在左侧。利用这个特性可以实现内容从底部向上滑出的视觉效果：

```tsx
// 普通容器：滚动条在右侧，内容从上往下滚动
// Container180：滚动条在左侧，内容从下往上滚动
<Container180>
  <section style={{ height: '200px', overflowY: 'scroll' }}>
    <p>第一行（视觉上在底部）</p>
    <p>第二行</p>
    <p>最后一行（视觉上在顶部）</p>
  </section>
</Container180>
```

## 注意

- 不要用于需要阅读的文字内容，文字会上下颠倒
- 镜像效果建议配合 `opacity` + `filter: blur()` 使用
- 通过 `spacing` 控制与相邻元素的间距
