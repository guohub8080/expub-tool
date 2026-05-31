# TopPinedFrame — 置顶浮层容器

通过 CSS 层叠上下文实现内容"浮"在页面其他元素之上，不依赖 `position: fixed` 或 `z-index`。

## 原理

核心是 `isolation: isolate` + `transform` 双重创建层叠上下文：

```
普通页面内容（z-index 层级 0）
├── 文字段落
├── 图片
├── TopPinedFrame（独立层叠上下文）← 浮在其他内容之上
│   └── children
├── 更多文字
└── 其他内容
```

三种模式对应不同的 inner style：

| 模式 | transform | isolation | pointer-events |
|------|-----------|-----------|----------------|
| 普通 | `scale(1)` | `isolate` | auto |
| 事件穿透 | `scale(1)` | `isolate` | `none` |
| 加强 | `translateZ(0.01px)` | `isolate` | auto |

- `isolation: isolate` — 创建独立层叠上下文，隔离 z-index
- `transform: scale(1)` — 兼容性兜底，任何非 none 的 transform 都会创建层叠上下文
- `transform: translateZ(0.01px)` — 3D 变换触发 GPU 合成层，层级更强
- `pointer-events: none` — 事件穿透，装饰层不拦截交互

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | — | 框架内的内容 |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |
| isEventPassThrough | boolean | false | 事件穿透模式（pointer-events: none） |
| isEnhanced | boolean | false | 加强模式（translateZ 3D变换） |

## 常用场景

### 普通置顶

```tsx
<TopPinedFrame>
  <SeamlessImg url="image.jpg" />
</TopPinedFrame>
```

### 事件穿透（装饰层/水印）

```tsx
<TopPinedFrame isEventPassThrough>
  <img src="watermark.png" style={{ opacity: 0.3 }} />
</TopPinedFrame>
```

### 加强模式（复杂层级环境）

```tsx
<TopPinedFrame isEnhanced>
  <SeamlessImg url="important-content.jpg" />
</TopPinedFrame>
```

### 带间距

```tsx
<TopPinedFrame spacing={{ mt: 10, mb: 10 }}>
  {children}
</TopPinedFrame>
```

## 注意

- `isolation` 和 `transform` 双重保障，确保各种环境下都能创建层叠上下文
- 不依赖 `position: fixed`，避免被微信编辑器限制或重置
- 事件穿透模式下，框架内**所有**子元素都无法响应交互
- 优先使用普通模式，加强模式仅在层级不够时使用
