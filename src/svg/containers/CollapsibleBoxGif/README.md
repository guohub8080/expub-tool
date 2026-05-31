# CollapsibleBoxGif — 坍塌盒子 GIF 版

在 CollapsibleBox 基础上增加延迟坍塌（等待 GIF 播放）和替换图片功能。

## 原理

与 CollapsibleBox 相同，额外增加：

- `begin="click+${gifDuration}s"` — 点击后延迟 N 秒再坍塌，让 GIF 播放完
- `foreignObject` + `animateTransform translate` — 替换图片从屏幕外移入
- height 坍塌使用 `discrete` 模式（瞬间消失，无缓动），与 CollapsibleBox 的 `spline` 缓动不同

```
点击热区
  ├── 0s: translate 动画开始（替换图片移入视口）
  ├── 0s: height 动画开始（discrete 瞬间坍塌）
  └── +gifDuration s: width 动画开始（discrete 瞬间坍塌）
```

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | — | 展示内容（通常是 GIF） |
| viewBoxW | number | 100 | SVG viewBox 宽度 |
| viewBoxH | number | 300 | SVG viewBox 高度 |
| hotAreaX | number | 0 | 热区 X 坐标 |
| hotAreaY | number | 0 | 热区 Y 坐标 |
| hotAreaW | number | 100 | 热区宽度 |
| hotAreaH | number | 100 | 热区高度 |
| afterSwitchImgUrl | string | '' | 坍塌后显示的替换图片 URL |
| gifDuration | number | 2 | GIF 播放时长（秒） |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

```tsx
<CollapsibleBoxGif
  viewBoxW={450} viewBoxH={750}
  hotAreaW={450} hotAreaH={750}
  gifDuration={2}
  afterSwitchImgUrl="https://example.com/static.jpg"
>
  <NormalSvgImg url={gifUrl} w={450} h={750} />
</CollapsibleBoxGif>
```

## 注意

- `afterSwitchImgUrl` 为空时不显示替换图片
- height 坍塌是 discrete（瞬间），与 CollapsibleBox 的 spline（缓动）不同
