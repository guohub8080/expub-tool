# CollapsibleBoxFade — 坍塌盒子淡入版

在 CollapsibleBox 基础上增加 opacity 淡入动画和替换图片功能。点击后旧内容淡出，新图片淡入。

## 原理

与 CollapsibleBox 相同，额外增加：

- `<g opacity="0">` 包裹替换内容，点击时 opacity 从 0→1 淡入
- `foreignObject` + `animateTransform translate` — 替换图片从屏幕外移入
- `begin="click+${duration}s"` — width 坍塌延迟 duration 秒，等淡入完成后再消失

```
点击热区
  ├── 0s: opacity 0→1（淡入替换图片）
  ├── 0s: translate 动画开始（替换图片移入视口）
  ├── 0s: height 动画开始（discrete 瞬间坍塌）
  └── +duration s: width 动画开始（discrete 瞬间坍塌）
```

## 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | — | 初始展示内容 |
| viewBoxW | number | 100 | SVG viewBox 宽度 |
| viewBoxH | number | 300 | SVG viewBox 高度 |
| hotAreaX | number | 0 | 热区 X 坐标 |
| hotAreaY | number | 0 | 热区 Y 坐标 |
| hotAreaW | number | 100 | 热区宽度 |
| hotAreaH | number | 100 | 热区高度 |
| afterSwitchImgUrl | string | '' | 淡入显示的替换图片 URL |
| duration | number | 0.5 | 淡入动画时长（秒） |
| spacing | T_SpacingProps | SPACING_ZERO | 外边距配置 |

## 常用场景

```tsx
<CollapsibleBoxFade
  viewBoxW={450} viewBoxH={750}
  hotAreaW={450} hotAreaH={750}
  afterSwitchImgUrl="https://example.com/new-pic.jpg"
  duration={0.8}
>
  <NormalSvgImg url={oldPic} w={450} h={750} />
</CollapsibleBoxFade>
```

## 注意

- `afterSwitchImgUrl` 为空时淡入效果无实际图片
- 与 CollapsibleBoxGif 的区别：本组件有 opacity 淡入动画，Gif 版没有
